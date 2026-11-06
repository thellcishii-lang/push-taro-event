// app/api/upgrade-request/pro/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '../../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '../../../../lib/mailer';

// PROプランのSquareリンク（環境変数から取得）
const PRO_PAYMENT_URL = process.env.NEXT_PUBLIC_SQUARE_LINK_PRO || '';

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
    const body = await request.json();
    const { shopId, companyName, invoiceNumber, address, phone, bankAccount } = body;
    const normalizedAccountNumber = String(bankAccount?.accountNumber || '')
      .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
      .trim();
    const accountHolder = String(bankAccount?.accountHolder || '').trim();

    if (!shopId) {
      return NextResponse.json({ error: '店舗IDが必要です' }, { status: 400 });
    }

    if (!/^\d{7}$/.test(normalizedAccountNumber)) {
      return NextResponse.json(
        { error: '口座番号は半角数字7桁で入力してください。数字以外の文字は使用できません。' },
        { status: 400 }
      );
    }

    if (!/^[ァ-ヶー]+$/.test(accountHolder)) {
      return NextResponse.json(
        { error: '口座名義は全角カナで入力してください。' },
        { status: 400 }
      );
    }

    // 店舗の所有権確認
    const shopDoc = await db.collection('shops').doc(shopId).get();
    if (!shopDoc.exists || shopDoc.data()?.ownerUid !== uid) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const shopData = shopDoc.data();

    // 既にPROならエラー
    if (shopData?.plan === 'pro') {
      return NextResponse.json(
        { error: 'すでにPROプランです' },
        { status: 400 }
      );
    }

    if (!PRO_PAYMENT_URL) {
      console.error('[upgrade-pro] NEXT_PUBLIC_SQUARE_LINK_PRO が設定されていません');
      return NextResponse.json(
        { error: '決済リンクが設定されていません' },
        { status: 500 }
      );
    }

    // アップグレード申請情報を一時保存（決済待ち）
    await shopDoc.ref.update({
      upgradeStatus: 'pending_payment',
      upgradeTargetPlan: 'pro',
      upgradeRequestedAt: FieldValue.serverTimestamp(),
      upgradeData: {
        companyName: companyName || shopData?.name || '',
        invoiceNumber: invoiceNumber || '',
        address: address || '',
        phone: phone || '',
        bankAccount: bankAccount ? { ...bankAccount, accountNumber: normalizedAccountNumber, accountHolder } : null,
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 決済リンクに shopId をパラメータとして付与
    const paymentUrl = `${PRO_PAYMENT_URL}?s=${shopId}&upgrade=pro`;

    // アップグレード申請受付メール（決済案内）
    await sendEmail({
  to: shopData?.email || '',  // ← オプショナルチェーン + フォールバック
  subject: '【Push-taro】PROプラン アップグレード申請受付', 
  html: `
    <h2>${shopData?.name || '店舗'} 様</h2> 
    <p>PROプランへのアップグレード申請を受け付けました。</p>
    <p>以下のリンクより決済手続きをお進めください。</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/payment/check?shopId=${shopId}" style="display:inline-block;padding:12px 24px;background:#ff4500;color:#fff;border-radius:6px;text-decoration:none;">決済画面へ進む</a></p>
    <p>決済完了後、PROプランが有効になり、紹介報酬機能もご利用いただけます。</p>
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
      message: 'PROアップグレード申請を受け付けました。決済へお進みください。',
    });

  } catch (error: any) {
    console.error('[upgrade-pro] エラー:', error);
    return NextResponse.json(
      { error: error.message || 'アップグレード処理に失敗しました' },
      { status: 500 }
    );
  }
}
