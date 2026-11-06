import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';
import { enforceRateLimit } from '@/lib/rate-limit';
import { generatePrintToken } from '@/lib/print-token';

// 紹介コード生成（AGENCY-XXXXXX）
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'AGENCY-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// パスワード自動生成（8桁）
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const retryAfter = await enforceRateLimit(request, 'signup-agency', 10, 10 * 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'しばらく待ってから再度お試しください' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  // 🔥 ロールバック用の追跡変数
  let createdAuthUid: string | null = null;
  let isNewAuthUser = false;
  let createdAgencyId: string | null = null;

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

    // メールアドレス重複チェック（agencies のみ）
    const existing = await db.collection('agencies').where('email', '==', normalizedEmail).get();
    if (!existing.empty) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に代理店登録されています' },
        { status: 409 }
      );
    }

    // パスワード自動生成
    const generatedPassword = generatePassword();

    // Firebase Auth ユーザー作成
    let userRecord;
    try {
      userRecord = await authAdmin.createUser({
        email: normalizedEmail,
        password: generatedPassword,
        emailVerified: true,
        disabled: true,
      });
      isNewAuthUser = true;
    } catch (e: any) {
      if (e.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 409 }
        );
      } else {
        throw e;
      }
    }
    createdAuthUid = userRecord.uid;

    // 紹介コード生成（重複防止）
    let referralCode = generateReferralCode();
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 10) {
      const existingCode = await db.collection('agencies')
        .where('referralCode', '==', referralCode)
        .get();
      if (existingCode.empty) {
        codeExists = false;
      } else {
        referralCode = generateReferralCode();
        attempts++;
      }
    }

    const hasInvoice = !!(invoiceNumber && invoiceNumber.trim() !== '');

    // agencies コレクションに保存
    const agencyData = {
      uid: userRecord.uid,
      companyName: businessType === 'corporation' ? companyName.trim() : null,
      ownerName: ownerName.trim(),
      email: normalizedEmail,
      phone: phone || '',
      address: address.trim(),
      businessType: businessType || 'corporation',
      invoiceNumber: invoiceNumber || null,
      hasInvoice,
      referralCode,
      status: 'pending_approval',
      bankAccount: {
        bankName: bankAccount.bankName.trim(),
        branchName: bankAccount.branchName.trim(),
        accountType: bankAccount.accountType || 'savings',
        accountNumber: bankAccount.accountNumber.trim(),
        accountHolder: bankAccount.accountHolder.trim(),
      },
      approvedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection('agencies').doc(userRecord.uid).set(agencyData);
    createdAgencyId = userRecord.uid;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';
    const printToken = generatePrintToken('agency', userRecord.uid);
    const applicationUrl = `${appUrl}/print/application?type=agency&agencyId=${userRecord.uid}${printToken ? `&token=${printToken}` : ''}`;
    const termsUrl = `${appUrl}/print/terms?type=agency`;

    // 登録完了メール
    const mailResult = await sendEmail({
      to: email,
      subject: '【Push-taro】代理店申し込み受付のお知らせ',
      html: `
        <h2>${ownerName} 様</h2>
        <p>この度はPush-taro代理店プログラムへのお申し込み、誠にありがとうございます。</p>

        <p>審査完了後、ご案内メールをお送りいたします。</p>
        <p>審査完了まで今暫くお待ちくださいますようお願い申し上げます。</p>

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

    if (!mailResult.success) {
      throw new Error('登録完了メールの送信に失敗しました');
    }

    return NextResponse.json({
      success: true,
      message: '代理店申し込みを受け付けました',
      agencyId: userRecord.uid,
      referralCode,
      email,
    });

  } catch (error: any) {
    console.error('[agency/signup] エラー:', error);

    // 🔥 ロールバック: Firestore の agencies ドキュメント
    if (createdAgencyId) {
      try {
        await db.collection('agencies').doc(createdAgencyId).delete();
        console.log(`[agency/signup] Firestoreロールバック完了: ${createdAgencyId}`);
      } catch (delErr: any) {
        console.error('[agency/signup] Firestoreロールバック失敗:', delErr);
      }
    }

    // 🔥 ロールバック: Auth ユーザー（新規作成時のみ）
    if (isNewAuthUser && createdAuthUid) {
      try {
        await authAdmin.deleteUser(createdAuthUid);
        console.log(`[agency/signup] Authロールバック完了: ${createdAuthUid}`);
      } catch (delErr: any) {
        console.error('[agency/signup] Authロールバック失敗:', delErr);
      }
    }

    return NextResponse.json(
      { error: error.message || '申し込み処理に失敗しました' },
      { status: 500 }
    );
  }
}
