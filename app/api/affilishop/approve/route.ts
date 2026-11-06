// app/api/affilishop/approve/route.ts
/**
 * affilishop 審査（承認・却下）
 *
 * - 承認: Firebase Auth アカウントを作成し、affilishopとしてログイン可能にする
 * - 却下: レコードは削除せず status: 'rejected' として記録を残す
 */
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailer';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    return userRecord.customClaims?.admin === true ? decoded.uid : null;
  } catch {
    return null;
  }
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

// ============================================================
// 承認処理（GET）
// ============================================================
export async function GET(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const affilishopId = searchParams.get('affilishopId');
  if (!affilishopId) {
    return NextResponse.json({ error: 'affilishopId が指定されていません。' }, { status: 400 });
  }

  try {
    const ref = db.collection('affilishops').doc(affilishopId);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: '該当のaffilishopデータが見つかりません。' }, { status: 404 });
    }

    const data = doc.data()!;
    if (data.status !== 'pending_approval') {
      return NextResponse.json({ error: `既に ${data.status} の状態です。` }, { status: 400 });
    }

    // Firebase Auth ユーザー作成（承認時に初めて発行）
    const normalizedEmail = String(data.email).trim().toLowerCase();
    const generatedPassword = generatePassword();

    let userRecord;
    try {
      userRecord = await authAdmin.createUser({
        email: normalizedEmail,
        password: generatedPassword,
        emailVerified: true,
      });
    } catch (e: any) {
      if (e.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'このメールアドレスの認証アカウントは既に存在します。別のメールアドレスを指定してください。' },
          { status: 409 }
        );
      } else {
        throw e;
      }
    }

    await ref.update({
      status: 'active',
      uid: userRecord.uid,
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: uid,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await sendEmail({
      to: normalizedEmail,
      subject: '【Push-taro】affilishop審査完了・ログイン情報のご案内',
      html: `
        <h2>${data.ownerName || 'affilishop'} 様</h2>
        <p>この度はPush-taro affilishopへのお申し込み、誠にありがとうございます。</p>
        <p>審査の結果、affilishopとして認定されました。以下の情報でログインいただけます。</p>
        <hr />
        <p><strong>ログインID（メールアドレス）:</strong> ${normalizedEmail}</p>
        <p><strong>パスワード:</strong> <code style="background:#f1f5f9;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:16px;">${generatedPassword}</code></p>
        <p><strong>ご自身の紹介コード:</strong> <code style="background:#f1f5f9;padding:4px 12px;border-radius:4px;font-weight:bold;">${data.referralCode}</code></p>
        <p><strong>報酬率:</strong> 初年度10%・13ヶ月目以降7%（全プラン一律）</p>
        <hr />
        <p>初回ログイン後、パスワードの変更をお勧めします。</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/affilishop/dashboard" style="display:inline-block;padding:12px 24px;background:#0ea5e9;color:#fff;border-radius:6px;text-decoration:none;">affilishopダッシュボードへ</a></p>
        <hr />
        <p style="font-size:12px;color:#64748b;">※ 3ヶ月間紹介実績が0件の場合、自動的に退会となりますのでご注意ください。</p>
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      `,
    });

    console.log(`[affilishop承認] affilishopId: ${affilishopId} / 送信先: ${normalizedEmail}`);

    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('text/html')) {
      return new NextResponse(
        `<html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>affilishop申請を承認しました</h2>
          <p>${data.ownerName}（${normalizedEmail}）宛てにログイン情報メールを送信しました。</p>
          <p><a href="/system-admin">全体管理画面に戻る</a></p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    return NextResponse.json({
      success: true,
      message: '承認処理およびログイン情報メールの送信が完了しました。',
      affilishopId,
    });
  } catch (error: any) {
    console.error('[affilishop承認] エラー:', error);
    return NextResponse.json({ error: error.message || 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// ============================================================
// 却下処理（POST）
// レコードは削除せず記録として残す
// ============================================================
export async function POST(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const { affilishopId, reason } = await request.json();
    if (!affilishopId) {
      return NextResponse.json({ error: 'affilishopId が必要です' }, { status: 400 });
    }

    const ref = db.collection('affilishops').doc(affilishopId);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: '該当のaffilishopデータが見つかりません。' }, { status: 404 });
    }
    const data = doc.data()!;

    await ref.update({
      status: 'rejected',
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: uid,
      rejectReason: reason || '',
      updatedAt: FieldValue.serverTimestamp(),
    });

    await sendEmail({
      to: data.email,
      subject: '【Push-taro】affilishop申請結果のお知らせ',
      html: `
        <h2>${data.ownerName || 'affilishop'} 様</h2>
        <p>この度はPush-taro affilishopへのご申請、誠にありがとうございます。</p>
        <p>厳正なる審査の結果、誠に恐れ入りますが、今回はご期待に沿えない結果となりました。</p>
        ${reason ? `<p><strong>理由:</strong> ${reason}</p>` : ''}
        <p>今後ともPush-taroをよろしくお願いいたします。</p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      `,
    });

    console.log(`[affilishop却下] affilishopId: ${affilishopId}`);

    return NextResponse.json({
      success: true,
      message: '却下処理および通知メールの送信が完了しました。',
      affilishopId,
    });
  } catch (error: any) {
    console.error('[affilishop却下] エラー:', error);
    return NextResponse.json({ error: error.message || 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
