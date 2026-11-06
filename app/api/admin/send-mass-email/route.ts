import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailer';

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

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const { target, subject, body, testOnly } = await request.json();

    if (!target || !subject || !body) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    if (!['shop', 'agency', 'affiliate'].includes(target)) {
      return NextResponse.json({ error: '無効な対象です' }, { status: 400 });
    }

    // ============================================================
    // 送信対象のメールアドレスを取得
    // ============================================================
    let emails: string[] = [];

    if (target === 'shop') {
      const snap = await db.collection('shops').get();
      emails = snap.docs
        .map((d) => d.data().email)
        .filter((e): e is string => !!e && e.includes('@'));
    } else if (target === 'agency') {
      const snap = await db.collection('agencies').get();
      emails = snap.docs
        .map((d) => d.data().email)
        .filter((e): e is string => !!e && e.includes('@'));
    } else if (target === 'affiliate') {
      const snap = await db.collection('affiliates').get();
      emails = snap.docs
        .map((d) => d.data().email)
        .filter((e): e is string => !!e && e.includes('@'));
    }

    // 重複削除
    emails = Array.from(new Set(emails));

    if (emails.length === 0) {
      return NextResponse.json({ error: '送信対象のメールアドレスがありません' }, { status: 404 });
    }

    // ============================================================
    // テスト送信モード（管理者のメールアドレスのみ）
    // ============================================================
    if (testOnly) {
      const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim() || 'info@push-taro.com';
      await sendEmail({
        to: adminEmail,
        subject: `[TEST] ${subject}`,
        html: body.replace(/\n/g, '<br>'),
      });
      return NextResponse.json({
        success: true,
        message: `テスト送信完了（${adminEmail} に送信）`,
        count: 1,
      });
    }

    // ============================================================
    // 本番送信（1件ずつ送信、スパム対策で200ms間隔）
    // ============================================================
    let successCount = 0;
    let failureCount = 0;
    const failedEmails: string[] = [];

    for (const email of emails) {
      try {
        const result = await sendEmail({
          to: email,
          subject,
          html: body.replace(/\n/g, '<br>'),
        });
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          failedEmails.push(email);
        }
      } catch (err) {
        console.error(`[send-mass-email] 送信エラー: ${email}`, err);
        failureCount++;
        failedEmails.push(email);
      }
      // スパム扱いを避けるため、200ms待機
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // ============================================================
    // 送信履歴をFirestoreに記録
    // ============================================================
    await db.collection('mass_email_logs').add({
      target,
      subject,
      body,
      totalCount: emails.length,
      successCount,
      failureCount,
      failedEmails: failedEmails.slice(0, 50), // 最大50件記録
      sentAt: new Date(),
      sentBy: uid,
    });

    return NextResponse.json({
      success: true,
      message: `送信完了：成功 ${successCount}件 / 失敗 ${failureCount}件`,
      count: emails.length,
      successCount,
      failureCount,
    });
  } catch (error: any) {
    console.error('[send-mass-email] エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
