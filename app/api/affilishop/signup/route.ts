// app/api/affilishop/signup/route.ts
/**
 * affilishop（実店舗向けアフィリエイト）申し込み
 *
 * - LPなどでの公募は行わず、メール配信で案内されたURLからのみ申し込み可能
 * - 加盟金・月額費用は発生しない
 * - この時点ではログインアカウントは作成しない（審査通過後に作成）
 * - 却下された申し込みも記録として affilishops コレクションに残す
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';
import { enforceRateLimit } from '@/lib/rate-limit';
import { generatePrintToken } from '@/lib/print-token';

// 紹介コード生成（ASHOP-XXXXXX）
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ASHOP-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const retryAfter = await enforceRateLimit(request, 'signup-affilishop', 10, 10 * 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'しばらく待ってから再度お試しください' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const {
      businessType,
      companyName,
      ownerName,
      email,
      phone,
      address,
      invoiceNumber,
      bankAccount,
    } = await request.json();

    // === バリデーション ===
    if (!email) {
      return NextResponse.json({ error: 'メールアドレスは必須です' }, { status: 400 });
    }
    if (!ownerName) {
      return NextResponse.json({ error: '担当者名は必須です' }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: '住所は必須です' }, { status: 400 });
    }
    if (businessType === 'corporation' && !companyName) {
      return NextResponse.json({ error: '法人の場合は会社名が必須です' }, { status: 400 });
    }
    if (!bankAccount || !bankAccount.bankName || !bankAccount.branchName || !bankAccount.accountNumber || !bankAccount.accountHolder) {
      return NextResponse.json({ error: '振込先口座情報はすべて必須です' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // メールアドレス重複チェック（affilishops のみ。却下履歴も含めて重複扱い）
    const existing = await db.collection('affilishops').where('email', '==', normalizedEmail).get();
    if (!existing.empty) {
      return NextResponse.json(
        { error: 'このメールアドレスは既にaffilishop申し込み済みです' },
        { status: 409 }
      );
    }

    // 紹介コード生成（重複防止）
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await db.collection('affilishops')
        .where('referralCode', '==', referralCode)
        .get();
      if (existingCode.empty) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    const hasInvoice = !!(invoiceNumber && invoiceNumber.trim() !== '');

    const affilishopData = {
      companyName: businessType === 'corporation' ? companyName.trim() : null,
      ownerName: ownerName.trim(),
      email: normalizedEmail,
      phone: phone || '',
      address: address.trim(),
      businessType: businessType || 'corporation',
      invoiceNumber: invoiceNumber || null,
      hasInvoice,
      referralCode,
      status: 'pending_approval', // pending_approval / active / rejected / withdrawn
      bankAccount: {
        bankName: bankAccount.bankName.trim(),
        branchName: bankAccount.branchName.trim(),
        accountType: bankAccount.accountType || 'savings',
        accountNumber: bankAccount.accountNumber.trim(),
        accountHolder: bankAccount.accountHolder.trim(),
      },
      uid: null,
      approvedAt: null,
      rejectedAt: null,
      rejectReason: null,
      unpaidRewardTotal: 0,
      payoutStatus: 'none',
      lastPaidAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('affilishops').add(affilishopData);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';
    // 申込書（口座情報等を含む）へのアクセス用に署名付きトークンを付与
    const printToken = generatePrintToken('affilishop', docRef.id);
    const applicationUrl = `${appUrl}/print/application?type=affilishop&affilishopId=${docRef.id}${printToken ? `&token=${printToken}` : ''}`;
    const termsUrl = `${appUrl}/print/terms?type=affilishop`;

    // 申込者への受付メール
    await sendEmail({
      to: normalizedEmail,
      subject: '【Push-taro】affilishop申し込み受付のお知らせ',
      html: `
        <h2>${ownerName} 様</h2>
        <p>この度はPush-taro affilishop（実店舗向けアフィリエイト）へのお申し込み、誠にありがとうございます。</p>
        <p>審査完了後、結果をメールにてご案内いたします。審査完了まで今暫くお待ちくださいますようお願い申し上げます。</p>
        <hr />
        <p><strong>📄 お申し込み内容の控え</strong></p>
        <p>以下のリンクから、いつでも申込書・利用規約をダウンロードできます。</p>
        <p>
          <a href="${applicationUrl}" style="color:#3182ce;">📥 申込書をダウンロード（PDF）</a>
        </p>
        <p>
          <a href="${termsUrl}" style="color:#3182ce;">📥 利用規約をダウンロード（PDF）</a>
        </p>
        <p style="font-size:12px; color:#94a3b8;">
          ※上記リンクはご登録のメールアドレス宛にのみお送りしています。第三者と共有しないようご注意ください。
        </p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      `,
    });

    // 管理者への通知メール
    const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim() || 'info@push-taro.com';
    await sendEmail({
      to: adminEmail,
      subject: `【新規affilishop申し込み】${ownerName}`,
      html: `
        <h2>新規affilishop申し込み</h2>
        <table style="font-size: 14px;">
          <tr><td style="padding: 6px; font-weight: bold;">担当者</td><td style="padding: 6px;">${ownerName}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">メール</td><td style="padding: 6px;">${normalizedEmail}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">会社名/屋号</td><td style="padding: 6px;">${companyName || '-'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">紹介コード</td><td style="padding: 6px;">${referralCode}</td></tr>
        </table>
        <hr />
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/system-admin">全体管理画面で確認</a></p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'affilishop申し込みを受け付けました',
      affilishopId: docRef.id,
      referralCode,
      email: normalizedEmail,
    });

  } catch (error: any) {
    console.error('[affilishop/signup] エラー:', error);
    return NextResponse.json(
      { error: error.message || '申し込み処理に失敗しました' },
      { status: 500 }
    );
  }
}
