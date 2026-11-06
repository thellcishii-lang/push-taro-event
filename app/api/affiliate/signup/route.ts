import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/mailer';
import { enforceRateLimit } from '@/lib/rate-limit';
import { generatePrintToken } from '@/lib/print-token';

// 紹介コード生成
//   recurring（ストック型）: AF-S-XXXXXX
//   one-time（単発型）:      AF-O-XXXXXX
function generateReferralCode(rewardType: 'recurring' | 'one-time'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = rewardType === 'recurring' ? 'AF-S-' : 'AF-O-';
  let code = prefix;
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
  const retryAfter = await enforceRateLimit(request, 'signup-affiliate', 10, 10 * 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'しばらく待ってから再度お試しください' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  let createdAffiliateId: string | null = null;
  let createdAuthUid: string | null = null;
  let isNewAuthUser = false;

  try {
    const {
      name,
      email,
      phone,
      address,
      businessType,
      companyName,
      invoiceNumber,
      rewardType,
      bankAccount,
    } = await request.json();

    // === バリデーション ===
    if (!name || !email) {
      return NextResponse.json({ error: '氏名とメールアドレスは必須です' }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: '住所は必須です' }, { status: 400 });
    }
    if (businessType === 'corporation' && !companyName) {
      return NextResponse.json({ error: '法人の場合は会社名が必須です' }, { status: 400 });
    }
    if (!rewardType || !['recurring', 'one-time'].includes(rewardType)) {
      return NextResponse.json({ error: '報酬タイプを選択してください' }, { status: 400 });
    }
    if (!bankAccount || !bankAccount.bankName || !bankAccount.branchName || !bankAccount.accountNumber || !bankAccount.accountHolder) {
      return NextResponse.json({ error: '振込先口座情報はすべて必須です' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ============================================================
    // 1. メール重複チェック（affiliates のみ）
    // ============================================================
    const existingAffiliate = await db
      .collection('affiliates')
      .where('email', '==', normalizedEmail)
      .get();

    if (!existingAffiliate.empty) {
      return NextResponse.json(
        { error: 'このメールアドレスは既にアフィリエイト登録されています' },
        { status: 409 }
      );
    }

    // ============================================================
    // 2. Auth ユーザー作成
    // ============================================================
    const generatedPassword = generatePassword();

    let userRecord;
    try {
      userRecord = await authAdmin.createUser({
        email: normalizedEmail,
        password: generatedPassword,
        emailVerified: true,
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

    // ============================================================
    // 3. 紹介コード生成（重複防止）
    // ============================================================
    let referralCode = generateReferralCode(rewardType);
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await db
        .collection('affiliates')
        .where('referralCode', '==', referralCode)
        .get();
      if (existingCode.empty) break;
      referralCode = generateReferralCode(rewardType);
      attempts++;
    }

    // ============================================================
    // 4. Firestore 保存
    // ============================================================
    const hasInvoice = !!(invoiceNumber && invoiceNumber.trim() !== '');

    const affiliateData = {
      uid: userRecord.uid,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || '',
      address: address.trim(),
      businessType: businessType || 'individual',
      companyName: businessType === 'corporation' ? companyName.trim() : null,
      invoiceNumber: invoiceNumber || null,
      hasInvoice,
      referralCode,
      rewardType,
      status: 'active',
      totalEarnings: 0,
      unpaidReward: 0,
      payoutStatus: 'none',
      lastPaidAt: null,
      bankAccount: bankAccount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

        const docRef = await db.collection('affiliates').add(affiliateData);
    createdAffiliateId = docRef.id;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push-taro.com';
    // 申込書（口座情報等を含む）へのアクセス用に署名付きトークンを付与
    const printToken = generatePrintToken('affiliate', createdAffiliateId);
    const applicationUrl = `${appUrl}/print/application?type=affiliate&affiliateId=${createdAffiliateId}${printToken ? `&token=${printToken}` : ''}`;
    const termsUrl = `${appUrl}/print/terms?type=affiliate`;

    // ============================================================
    // 5. 申込者へのメール
    // ============================================================
    const rewardTypeLabel = rewardType === 'recurring'
      ? 'ストック型（初年度8%・13ヶ月目以降5%還元）'
      : '単発型（初回のみ固定報酬）';

    const applicantMailResult = await sendEmail({
      to: normalizedEmail,
      subject: '【Push-taro】アフィリエイト登録完了のお知らせ',
      html: `
        <h2>${name} 様</h2>
        <p>この度はPush-taroアフィリエイトプログラムへのご登録、誠にありがとうございます。</p>
        <p>以下の情報で管理画面にログインいただけます。</p>
        <hr />
        <p><strong>ログインID（メールアドレス）:</strong> ${normalizedEmail}</p>
        <p><strong>パスワード:</strong> <code style="background:#f1f5f9;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:16px;">${generatedPassword}</code></p>
        <p><strong>ご自身の紹介コード:</strong> <code style="background:#f1f5f9;padding:4px 12px;border-radius:4px;font-weight:bold;">${referralCode}</code></p>
        <p><strong>報酬タイプ:</strong> ${rewardTypeLabel}</p>
        <hr />
        <p><strong>インボイス登録番号:</strong> ${invoiceNumber || '未登録'}</p>
        ${!hasInvoice ? `
          <p style="color: #dc2626; font-weight: bold;">
            ⚠️ インボイス番号が未登録のため、報酬支払い時に10%が源泉徴収（または手数料）として差し引かれます。
          </p>
          <p>インボイス番号は後日マイページから登録可能です。</p>
        ` : `
          <p>✅ インボイス番号が登録されています。報酬は全額支払われます。</p>
        `}
        <hr />
        <p>初回ログイン後、パスワードの変更をお勧めします。</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/affiliate/dashboard" style="display:inline-block;padding:12px 24px;background:#ff4500;color:#fff;border-radius:6px;text-decoration:none;">アフィリエイトダッシュボードへ</a></p>
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

    // メール送信失敗 → ロールバック
    if (!applicantMailResult.success) {
      console.error('[affiliate/signup] 申込者メール送信失敗 → ロールバック');
      if (createdAffiliateId) {
        await db.collection('affiliates').doc(createdAffiliateId).delete();
      }
      if (isNewAuthUser && createdAuthUid) {
        await authAdmin.deleteUser(createdAuthUid);
      }
      return NextResponse.json(
        { error: 'メール送信に失敗しました。しばらく経ってから再度お試しください。' },
        { status: 500 }
      );
    }

    // ============================================================
    // 6. 管理者への通知メール（失敗しても登録は維持）
    // ============================================================
    const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim() || 'info@push-taro.com';
    await sendEmail({
      to: adminEmail,
      subject: `【新規アフィリエイト登録】${name}（${rewardTypeLabel}）`,
      html: `
        <h2>新規アフィリエイト登録</h2>
        <table style="font-size: 14px;">
          <tr><td style="padding: 6px; font-weight: bold;">氏名</td><td style="padding: 6px;">${name}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">メール</td><td style="padding: 6px;">${normalizedEmail}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">紹介コード</td><td style="padding: 6px;">${referralCode}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">報酬タイプ</td><td style="padding: 6px;">${rewardTypeLabel}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">事業形態</td><td style="padding: 6px;">${businessType === 'corporation' ? '法人' : '個人'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">インボイス</td><td style="padding: 6px;">${hasInvoice ? 'あり' : 'なし'}</td></tr>
        </table>
        <hr />
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/system-admin">全体管理画面で確認</a></p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      `,
    });

    // ============================================================
    // 7. レスポンス
    // ============================================================
    return NextResponse.json({
      success: true,
      message: 'アフィリエイト登録が完了しました',
      affiliateId: createdAffiliateId,
      referralCode,
      rewardType,
      email: normalizedEmail,
    });

  } catch (error: any) {
    console.error('[affiliate/signup] エラー:', error);

    if (createdAffiliateId) {
      try {
        await db.collection('affiliates').doc(createdAffiliateId).delete();
      } catch {}
    }
    if (isNewAuthUser && createdAuthUid) {
      try {
        await authAdmin.deleteUser(createdAuthUid);
      } catch {}
    }

    return NextResponse.json(
      { error: error.message || '登録処理に失敗しました' },
      { status: 500 }
    );
  }
}
