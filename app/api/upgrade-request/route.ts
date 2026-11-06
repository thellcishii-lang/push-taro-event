// app/api/upgrade-request/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '../../../lib/mailer';

// StandardプランのSquareリンク（環境変数から取得）
const STANDARD_PAYMENT_URL = process.env.NEXT_PUBLIC_SQUARE_LINK_STANDARD || '';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let uid: string;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  try {
    const { shopId } = await request.json();

    if (!shopId) {
      return NextResponse.json({ error: '店舗IDが必要です' }, { status: 400 });
    }

    // 店舗の所有権確認
    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists || shopDoc.data()?.ownerUid !== uid) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const shopData = shopDoc.data();
    const currentPlan = shopData?.plan || 'light';

    // 既にStandard以上ならエラー
    if (currentPlan === 'standard' || currentPlan === 'pro') {
      return NextResponse.json(
        { error: 'すでに上位プランにアップグレード済みです' },
        { status: 400 }
      );
    }

    if (!STANDARD_PAYMENT_URL) {
      console.error('[upgrade-standard] NEXT_PUBLIC_SQUARE_LINK_STANDARD が設定されていません');
      return NextResponse.json(
        { error: '決済リンクが設定されていません' },
        { status: 500 }
      );
    }

    // アップグレード申請ステータスに変更（決済待ち）
    await shopDoc.ref.update({
      upgradeStatus: 'pending_payment',
      upgradeTargetPlan: 'standard',
      upgradeRequestedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 決済リンクに shopId をパラメータとして付与（Webhookで特定用）
    const paymentUrl = `${STANDARD_PAYMENT_URL}?s=${shopId}&upgrade=standard`;

    // アップグレード申請受付メール（決済案内）
    await sendEmail({
  to: shopData?.email || '',  // ← オプショナルチェーン + フォールバック
  subject: '【Push-taro】スタンダードプラン アップグレード申請受付',  
  html: `
    <h2>${shopData?.name || '店舗'} 様</h2> 
    <p>スタンダードプランへのアップグレード申請を受け付けました。</p>
    <p>以下のリンクより決済手続きをお進めください。</p>
    <p>
          <a 
            href="${process.env.NEXT_PUBLIC_APP_URL}/payment/check?shopId=${shopId}" 
            style="display:inline-block; padding:12px 24px; background:#3182ce; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;"
          >
          決済画面へ進む
          </a>
        </p>
    <p>決済完了後、プランが自動的に更新されます。</p>
    <hr />
    <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
  `,
});

    return NextResponse.json({
      success: true,
      paymentUrl,
      message: 'アップグレード申請を受け付けました。決済へお進みください。',
    });

  } catch (error: any) {
    console.error('[upgrade-standard] エラー:', error);
    return NextResponse.json(
      { error: error.message || 'アップグレード処理に失敗しました' },
      { status: 500 }
    );
  }
}
