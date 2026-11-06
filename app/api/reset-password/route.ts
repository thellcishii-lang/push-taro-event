// app/api/reset-password/route.ts
/**
 * パスワード再発行（全アカウント共通）
 * 
 * リクエストボディに role を含める:
 *   role: 'shop' | 'agency' | 'affiliate' | 'affilishop'
 * 
 * 該当コレクションにメールが存在する場合のみ送信。
 * 存在しなくても 200 を返す（列挙対策）。
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailer';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const VALID_ROLES = ['shop', 'agency', 'affiliate', 'affilishop'] as const;
type Role = typeof VALID_ROLES[number];

const ROLE_LABELS: Record<Role, string> = {
  shop: '店舗',
  agency: '代理店',
  affiliate: 'アフィリエイト',
  affilishop: 'affilishop',
};

export async function POST(request: Request) {
  const retryAfter = await enforceRateLimit(request, 'reset-password', 5, 15 * 60 * 1000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'しばらく待ってから再度お試しください' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const { email, role } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: '無効な役割です' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ============================================================
    // 該当コレクションにメールが存在するか確認
    // ============================================================
    let exists = false;

    if (role === 'shop') {
      const snap = await db.collection('shops').where('email', '==', normalizedEmail).limit(1).get();
      exists = !snap.empty;
    } else if (role === 'agency') {
      const snap = await db.collection('agencies')
        .where('email', '==', normalizedEmail)
        .where('status', '==', 'active')
        .limit(1)
        .get();
      exists = !snap.empty;
    } else if (role === 'affiliate') {
      const snap = await db.collection('affiliates').where('email', '==', normalizedEmail).limit(1).get();
      exists = !snap.empty;
    } else if (role === 'affilishop') {
      const snap = await db.collection('affilishops').where('email', '==', normalizedEmail).limit(1).get();
      exists = !snap.empty;
    }

    // 存在しない場合も 200 を返す（列挙対策）
    if (!exists) {
      return NextResponse.json({
        success: true,
        message: 'ご入力のメールアドレスが登録されている場合、パスワード再設定用のメールをお送りします。',
      });
    }

    // ============================================================
    // Firebase 標準のパスワードリセットリンクを生成
    // ============================================================
    let resetLink: string;
    try {
      resetLink = await authAdmin.generatePasswordResetLink(normalizedEmail);
    } catch (e: any) {
      console.error('[reset-password] リンク生成失敗:', e);
      // ユーザーには成功扱いを返す
      return NextResponse.json({
        success: true,
        message: 'ご入力のメールアドレスが登録されている場合、パスワード再設定用のメールをお送りします。',
      });
    }

    // ============================================================
    // メール送信
    // ============================================================
    const roleLabel = ROLE_LABELS[role as Role];

    await sendEmail({
      to: normalizedEmail,
      subject: `【Push-taro】${roleLabel}アカウント パスワード再設定のご案内`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>パスワード再設定のご案内</h2>
          <p>${roleLabel}アカウントのパスワード再設定を受け付けました。</p>
          <p>以下のリンクより、新しいパスワードを設定してください。</p>
          <p>
            <a href="${resetLink}" style="display:inline-block; padding:12px 24px; background:#3182ce; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
              パスワードを再設定する
            </a>
          </p>
          <p style="font-size: 12px; color: #64748b;">
            ※ このリンクの有効期限は1時間です。<br />
            ※ 心当たりがない場合は、このメールを破棄してください。
          </p>
          <hr />
          <p><strong>Push-taro.com</strong></p>
          <p>運営会社：the合同会社</p>
          <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'ご入力のメールアドレスが登録されている場合、パスワード再設定用のメールをお送りします。',
    });
  } catch (error: any) {
    console.error('[reset-password] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
