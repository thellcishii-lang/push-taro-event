// app/actions/agencyActions.ts
import { sendEmail } from '../../lib/mailer';
import { db } from '../../lib/firebase-admin';

// 代理店申請の承認処理
export async function approveAgency(agencyShopId: string, email: string) {
  try {
    await db.collection('shops').doc(agencyShopId).update({
      isAgency: true,
      role: 'agency',
      agencyId: agencyShopId,
      agencyApprovedAt: new Date(),
    });

    await sendEmail({
      to: email,
      subject: '【push-taro】代理店申請承認のお知らせ',
      html: `
        <p>代理店申請が承認されました。</p>
        <p>管理画面より代理店ダッシュボードをご利用いただけます。</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/agency">代理店ダッシュボードへログイン</a>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('代理店承認エラー:', error);
    return { success: false, error: '承認処理に失敗しました' };
  }
}

// 代理店申請の却下処理
export async function rejectAgency(agencyShopId: string, email: string, reason?: string) {
  try {
    await db.collection('shops').doc(agencyShopId).update({
      agencyRejectedAt: new Date(),
      agencyRejectReason: reason || '',
    });

    await sendEmail({
      to: email,
      subject: '【push-taro】代理店申請結果のお知らせ',
      html: `
        <p>大変恐れ入りますが、審査の結果、今回の代理店申請は見送りとなりました。</p>
        ${reason ? `<p>理由: ${reason}</p>` : ''}
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('代理店却下エラー:', error);
    return { success: false, error: '却下処理に失敗しました' };
  }
}
