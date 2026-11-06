// app/api/agency/approve/route.ts
import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailer';
import { FieldValue } from 'firebase-admin/firestore';
import { generatePrintToken } from '@/lib/print-token';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);
    const userRecord = await authAdmin.getUser(decoded.uid);
    return userRecord.customClaims?.admin === true ? decoded.uid : null;
  } catch {
    return null;
  }
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
  const agencyId = searchParams.get('agencyId');

  if (!agencyId) {
    return NextResponse.json({ error: 'agencyId が指定されていません。' }, { status: 400 });
  }

  try {
    const agencyRef = db.collection('agencies').doc(agencyId);
    const agencyDoc = await agencyRef.get();

    if (!agencyDoc.exists) {
      return NextResponse.json({ error: '該当の代理店データが見つかりません。' }, { status: 404 });
    }

    const agencyData = agencyDoc.data();
    if (!agencyData) {
      return NextResponse.json({ error: '代理店データが不正です。' }, { status: 400 });
    }

    // 既に承認済みチェック
    if (agencyData.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `既に ${agencyData.status} の状態です。` },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    // メール内のリンクは必ず状態確認画面を経由させる。
    // 決済状況の漏洩を防ぐため、署名付きトークンを付与する。
    const initialToken = generatePrintToken('agency', agencyId);
    const monthlyToken = generatePrintToken('agency', agencyId);
    const initialPaymentLink = `${appUrl}/agency/payment?agencyId=${encodeURIComponent(agencyId)}&type=initial${initialToken ? `&token=${initialToken}` : ''}`;
    const monthlyPaymentLink = `${appUrl}/agency/payment?agencyId=${encodeURIComponent(agencyId)}&type=monthly${monthlyToken ? `&token=${monthlyToken}` : ''}`;

    // ============================================================
    // 3. 決済案内メール送信
    // ============================================================
    const mailResult = await sendEmail({
      to: agencyData.email,
      subject: '【Push-taro】代理店パートナー 審査完了・決済手続きのご案内',
      html: `
        <h2>${agencyData.companyName || agencyData.ownerName || '代理店'} 様</h2>
        <p>この度はPush-taro代理店パートナーへのご申請、誠にありがとうございます。</p>
        <p>社内審査が完了いたしましたので、今後の決済手続きについてご案内いたします。</p>
        <hr />
        <p>以下の2つのリンクより、加盟金および初月月額費用のお手続きをお進めください。</p>
        <p><strong>1. 代理店加盟金（初期費用：300,000円・税別）</strong><br />
        <a href="${initialPaymentLink}" style="display:inline-block;padding:10px 20px;background:#3182ce;color:#fff;border-radius:6px;text-decoration:none;">加盟金を決済する</a></p>
        <p><strong>2. 代理店月額費用（月額：30,000円・税別）</strong><br />
        <a href="${monthlyPaymentLink}" style="display:inline-block;padding:10px 20px;background:#3182ce;color:#fff;border-radius:6px;text-decoration:none;">月額費用を決済する</a></p>
        <hr />
        <p>両方のお支払いが確認され次第、代理店専用アカウントが完全に有効化されます。</p>
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      `,
    });

    if (!mailResult.success) {
      return NextResponse.json(
        { error: `決済案内メールを送信できませんでした: ${mailResult.error || '不明なエラー'}` },
        { status: 502 }
      );
    }

    await agencyRef.update({
      status: 'approved_pending_payment',
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: uid,
      paymentGuideSentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`[代理店承認] agencyId: ${agencyId} / 送信先: ${agencyData.email}`);

    // ============================================================
    // 4. レスポンス（HTML / JSON 両対応）
    // ============================================================
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('text/html')) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2>代理店申請を承認しました</h2>
            <p>${agencyData.companyName || agencyData.ownerName}（${agencyData.email}）宛てに決済案内メールを送信しました。</p>
            <p><a href="/system-admin">全体管理画面に戻る</a></p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    return NextResponse.json({
      success: true,
      message: '承認処理および決済案内メールの送信が完了しました。',
      agencyId,
    });
  } catch (error: any) {
    console.error('[代理店承認] エラー:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ============================================================
// 却下処理（POST）
// ============================================================
export async function POST(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const { agencyId, reason } = await request.json();

    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId が必要です' }, { status: 400 });
    }

    const agencyRef = db.collection('agencies').doc(agencyId);
    const agencyDoc = await agencyRef.get();

    if (!agencyDoc.exists) {
      return NextResponse.json({ error: '該当の代理店データが見つかりません。' }, { status: 404 });
    }

    const agencyData = agencyDoc.data();
    if (!agencyData) {
      return NextResponse.json({ error: '代理店データが不正です。' }, { status: 400 });
    }
    if (agencyData.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `審査中ではないため却下できません（${agencyData.status}）` },
        { status: 400 }
      );
    }

    // ステータス更新
    await agencyRef.update({
      status: 'rejected',
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: uid,
      rejectReason: reason || '',
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (agencyData.uid) {
      try {
        await authAdmin.updateUser(agencyData.uid, { disabled: true });
      } catch (authError) {
        console.error('[代理店却下] Authアカウント無効化失敗:', authError);
      }
    }

    // 却下メール送信
    await sendEmail({
      to: agencyData.email,
      subject: '【Push-taro】代理店申請結果のお知らせ',
      html: `
        <h2>${agencyData.companyName || agencyData.ownerName || '代理店'} 様</h2>
        <p>この度はPush-taro代理店パートナーへのご申請、誠にありがとうございます。</p>
        <p>厳正なる審査の結果、誠に恐れ入りますが、今回はご期待に沿えない結果となりました。</p>
        ${reason ? `<p><strong>理由:</strong> ${reason}</p>` : ''}
        <p>今後ともPush-taroをよろしくお願いいたします。</p>
        <hr />
        <p><strong>Push-taro.com</strong></p>
        <p>運営会社：the合同会社</p>
        <p>〒357-0123 埼玉県飯能市中藤下郷23-21</p>
        <p><a href="mailto:info@push-taro.com">info@push-taro.com</a></p>
      `,
    });

    console.log(`[代理店却下] agencyId: ${agencyId}`);

    return NextResponse.json({
      success: true,
      message: '却下処理および通知メールの送信が完了しました。',
      agencyId,
    });
  } catch (error: any) {
    console.error('[代理店却下] エラー:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
