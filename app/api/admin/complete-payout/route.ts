import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailer';
import { FieldValue } from 'firebase-admin/firestore';

async function sendUserPayoutEmail({ to, amount, bankHolder, typeLabel }: {
  to: string;
  amount: number;
  bankHolder?: string;
  typeLabel: string;
}) {
  await sendEmail({
    to,
    subject: '【Push-taro】報酬のお振込み完了のお知らせ',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>報酬のお振込みが完了しました</h2>
        <p>いつもPush-taroをご利用いただき、ありがとうございます。</p>
        <p>下記の通り、${typeLabel}報酬のお振込みが完了いたしましたのでご報告いたします。</p>
        <hr />
        <table style="font-size: 14px;">
          <tr>
            <td style="padding: 6px; font-weight: bold;">お振込金額</td>
            <td style="padding: 6px;">¥${amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">お振込先</td>
            <td style="padding: 6px;">${bankHolder || 'ご登録口座'}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: bold;">お振込日</td>
            <td style="padding: 6px;">${new Date().toLocaleDateString('ja-JP')}</td>
          </tr>
        </table>
        <hr />
        <p style="font-size: 13px; color: #64748b;">
          ご不明な点がございましたら、お気軽にお問い合わせください。
        </p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      </div>
    `,
  });
}
const VALID_COLLECTIONS = ['shops', 'agencies', 'affiliates', 'affilishops'] as const;
type Collection = typeof VALID_COLLECTIONS[number];

// collection → referrerType / typeLabel のマッピング
function resolveMeta(collection: Collection) {
  if (collection === 'agencies')    return { referrerType: 'agency',     typeLabel: '代理店' };
  if (collection === 'affiliates')  return { referrerType: 'affiliate',  typeLabel: 'アフィリエイト' };
  if (collection === 'affilishops') return { referrerType: 'affilishop', typeLabel: 'affilishop' };
  return { referrerType: 'pro', typeLabel: 'PRO紹介' };
}

export async function POST(req: Request) {
  // ─── 管理者認証 ───
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  let adminUid: string;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    if (userRecord.customClaims?.admin !== true) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }
    adminUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  // ─── バリデーション ───
  const body = await req.json();
  const { userId, amount, collection } = body;

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId が必要です' }, { status: 400 });
  }
  if (!VALID_COLLECTIONS.includes(collection)) {
    return NextResponse.json(
      { error: `collection は ${VALID_COLLECTIONS.join(' / ')} のいずれかが必要です` },
      { status: 400 }
    );
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount は正の数値が必要です' }, { status: 400 });
  }

  const targetCollection = collection as Collection;
  const { referrerType, typeLabel } = resolveMeta(targetCollection);

  try {
    const userRef = db.collection(targetCollection).doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: `${targetCollection}/${userId} が存在しません` },
        { status: 400 }
      );
    }
    const userData = userDoc.data()!;

    const unpaidField = targetCollection === 'affiliates' ? 'unpaidReward' : 'unpaidRewardTotal';
    // ─── 1. monthly_rewards を paid に更新 ───
    const rewardsSnap = await db.collection('monthly_rewards')
      .where('userId', '==', userId)
      .where('referrerType', '==', referrerType)
      .where('status', '==', 'unpaid')
      .get();

    const rewardIds: string[] = [];
    if (!rewardsSnap.empty) {
      const batch = db.batch();
      rewardsSnap.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'paid',
          paidAt: FieldValue.serverTimestamp(),
          paidBy: adminUid,
        });
        rewardIds.push(doc.id);
      });
      await batch.commit();
    }

    // ─── 2. 未払い累計をリセット ───
    await userRef.update({
      [unpaidField]: 0,
      payoutStatus: 'none',
      lastPaidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    
    // ─── 2-2. monthly_statements の未払い分を paid に更新 ───
    const statementsSnap = await db.collection('monthly_statements')
      .where('userId', '==', userId)
      .where('referrerType', '==', referrerType)
      .where('status', '==', 'unpaid')
      .get();

    if (!statementsSnap.empty) {
      const stBatch = db.batch();
      statementsSnap.docs.forEach((doc) => {
        stBatch.update(doc.ref, {
          status: 'paid',
          paidAt: FieldValue.serverTimestamp(),
          paidBy: adminUid,
        });
      });
      await stBatch.commit();
      console.log(`[complete-payout] monthly_statements 更新: ${statementsSnap.size}件`);
    }

    // ─── 3. メール ───
    if (userData.email) {
      await sendUserPayoutEmail({
        to: userData.email,
        amount,
        bankHolder: userData.bankAccount?.accountHolder,
        typeLabel,
      });
    }

    // ─── 4. payout_history（referrerType も記録） ───
    await db.collection('payout_history').add({
      userId,
      collection: targetCollection,
      referrerType,                        // ← 追加
      type: typeLabel,
      amount,
      bankAccount: userData.bankAccount || null,
      rewardIds,                           // ← 追加（どの明細を消したか）
      paidAt: FieldValue.serverTimestamp(),
      paidBy: adminUid,
    });

    console.log(`[complete-payout] ✅ ${targetCollection}/${userId} / ${typeLabel} / ¥${amount.toLocaleString()} / rewards: ${rewardIds.length}件`);

    return NextResponse.json({ success: true, rewardCount: rewardIds.length });
  } catch (err: any) {
    console.error('[complete-payout] エラー:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
