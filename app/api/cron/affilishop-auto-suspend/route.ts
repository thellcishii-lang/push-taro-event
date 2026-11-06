// app/api/cron/affilishop-auto-suspend/route.ts
/**
 * affilishop 自動退会バッチ
 *
 * 実行頻度: 月1回想定
 * 対象: 承認から3ヶ月以上経過した稼働中(active)のaffilishopのうち、
 *       直近3ヶ月間の新規紹介実績（referral_relations作成）が0件のもの
 * 処理: status を 'withdrawn' に変更し、ログインアカウントを無効化、通知メールを送信
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';
import { isValidCronRequest } from '@/lib/cron-auth';
import { AFFILISHOP_AUTO_WITHDRAW_MONTHS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setMonth(windowStart.getMonth() - AFFILISHOP_AUTO_WITHDRAW_MONTHS);

    const activeSnap = await db.collection('affilishops').where('status', '==', 'active').get();

    let withdrawnCount = 0;
    const errors: string[] = [];

    for (const doc of activeSnap.docs) {
      const data = doc.data();

      // 承認から一定期間経過していないものは対象外
      const approvedAt = data.approvedAt?.toDate ? data.approvedAt.toDate() : null;
      if (!approvedAt || approvedAt > windowStart) continue;

      try {
        const relSnap = await db.collection('referral_relations')
          .where('referrerId', '==', doc.id)
          .where('referrerType', '==', 'affilishop')
          .where('createdAt', '>=', windowStart)
          .get();

        if (!relSnap.empty) continue; // 実績あり → 対象外

        // ログインアカウントを無効化
        if (data.uid) {
          try {
            await authAdmin.updateUser(data.uid, { disabled: true });
          } catch (authErr: any) {
            console.warn(`[affilishop自動退会] Auth無効化スキップ: ${doc.id}`, authErr.message);
          }
        }

        await doc.ref.update({
          status: 'withdrawn',
          withdrawnAt: FieldValue.serverTimestamp(),
          withdrawnReason: `${AFFILISHOP_AUTO_WITHDRAW_MONTHS}ヶ月間紹介実績0件のため自動退会`,
          updatedAt: FieldValue.serverTimestamp(),
        });

        if (data.email) {
          await sendEmail({
            to: data.email,
            subject: '【Push-taro】affilishop自動退会のお知らせ',
            html: `
              <h2>${data.ownerName || 'affilishop'} 様</h2>
              <p>直近${AFFILISHOP_AUTO_WITHDRAW_MONTHS}ヶ月間、紹介実績が確認できなかったため、規定に基づきaffilishop契約を自動退会とさせていただきました。</p>
              <p>再度お申し込みをご希望の場合は、担当窓口までご連絡ください。</p>
              <hr />
              <p><strong>Push-taro.com</strong></p>
              <p>運営会社：the合同会社</p>
              <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
            `,
          });
        }

        withdrawnCount++;
      } catch (err: any) {
        console.error(`[affilishop自動退会] エラー affilishopId=${doc.id}:`, err);
        errors.push(`${doc.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      withdrawn: withdrawnCount,
      candidates: activeSnap.size,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('[affilishop自動退会] 致命的エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
