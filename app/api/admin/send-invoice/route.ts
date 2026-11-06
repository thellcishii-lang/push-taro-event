import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailer';
import { PLAN_PRICES } from '@/lib/constants';


export async function POST(request: Request) {
  // ① 認証ヘッダーの確認
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  // ② トークン検証 + 管理者チェック（まとめて1つに）
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    if (userRecord.customClaims?.admin !== true) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  // ③ 以降、既存の処理
  try {
    const { shopId, months } = await request.json();
    

    if (!shopId || !months || months < 1 || months > 3) {
      return NextResponse.json({ error: '無効なパラメータです' }, { status: 400 });
    }

    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return NextResponse.json({ error: '店舗が見つかりません' }, { status: 404 });
    }

    const shopData = shopDoc.data();
    // 🔥 ここを追加（shopData が undefined の場合のガード）
    if (!shopData) {
      return NextResponse.json({ error: '店舗データが取得できません' }, { status: 404 });
    }

    const price = PLAN_PRICES[shopData.plan || 'light'] || 3800;
    const totalAmount = price * months;

    const paymentUrl = `${process.env.NEXT_PUBLIC_SQUARE_LINK_TEST}?shopId=${shopId}&amount=${totalAmount}&months=${months}`;

    await sendEmail({
      to: shopData.email,  // ← これで安全
      subject: `【Push-taro】決済リンクのご案内（${months}ヶ月分）`,
      html: `
        <h2>${shopData.name || '店舗'} 様</h2>
        <p>決済不履行によりサービスが停止しております。</p>
        <p>以下のリンクより <strong>${months}ヶ月分（${totalAmount.toLocaleString()}円）</strong> の決済をお願いいたします。</p>
        <p><a href="${paymentUrl}" style="display:inline-block;padding:12px 24px;background:#ff4500;color:#fff;border-radius:6px;text-decoration:none;">決済する</a></p>
        <p>決済完了後、自動的にサービスが再開されます。</p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
           <hr />
            <p>運営会社：the合同会社</p>
            <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
            <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      `,
    });

    await db.collection('shops').doc(shopId).collection('invoice_history').add({
      months,
      amount: totalAmount,
      sentAt: new Date(),
      status: 'sent',
    });

    return NextResponse.json({
      success: true,
      message: `${months}ヶ月分の決済リンクを送信しました`,
    });
  } catch (error: any) {
    console.error('[send-invoice] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
