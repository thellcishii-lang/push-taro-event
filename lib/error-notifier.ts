import { sendEmail } from './mailer';
import { db } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// 管理者のメールアドレス（環境変数から取得、カンマ区切りで複数指定可）
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'info@push-taro.com')
  .split(',')
  .map((e) => e.trim())
  .filter((e) => e);

// 同じエラーを短時間に何度も送らないためのスロットル（5分間）
const recentErrors = new Map<string, number>();
const THROTTLE_MS = 5 * 60 * 1000;

interface ErrorContext {
  source: string;        // 'send-push' | 'square-webhook' など
  userId?: string;       // エラー発生ユーザーのUID
  shopId?: string;       // 関連する店舗ID
  details?: any;         // 追加情報
}

/**
 * 管理者にエラー通知メールを送信する
 */
export async function notifyAdmins(error: Error | any, context: ErrorContext) {
  try {
    const errorMessage = error?.message || String(error);
    const errorStack = error?.stack || '';

    // スロットルチェック（同じエラーメッセージは5分に1回まで）
    const errorKey = `${context.source}:${errorMessage}`;
    const now = Date.now();
    const lastSent = recentErrors.get(errorKey);

    if (lastSent && now - lastSent < THROTTLE_MS) {
      console.warn(`[error-notifier] スロットル中: ${errorKey}`);
      return;
    }
    recentErrors.set(errorKey, now);

    // 古いエントリのクリーンアップ
    if (recentErrors.size > 100) {
      const cutoff = now - THROTTLE_MS;
      recentErrors.forEach((timestamp, key) => {
        if (timestamp < cutoff) recentErrors.delete(key);
      });
    }

    const html = `
      <div style="font-family: sans-serif; padding: 20px; background: #fff5f5; border: 2px solid #dc2626; border-radius: 8px;">
        <h2 style="color: #dc2626; margin: 0 0 16px 0;">🚨 Push-taro システムエラー発生</h2>
        
        <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 8px; background: #fee; font-weight: bold; width: 140px;">発生日時</td>
            <td style="padding: 8px;">${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #fee; font-weight: bold;">発生箇所</td>
            <td style="padding: 8px;"><code>${context.source}</code></td>
          </tr>
          ${context.userId ? `
          <tr>
            <td style="padding: 8px; background: #fee; font-weight: bold;">ユーザーUID</td>
            <td style="padding: 8px;"><code>${context.userId}</code></td>
          </tr>` : ''}
          ${context.shopId ? `
          <tr>
            <td style="padding: 8px; background: #fee; font-weight: bold;">店舗ID</td>
            <td style="padding: 8px;"><code>${context.shopId}</code></td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px; background: #fee; font-weight: bold;">エラーメッセージ</td>
            <td style="padding: 8px; color: #dc2626; font-weight: bold;">${errorMessage}</td>
          </tr>
        </table>

        ${context.details ? `
        <h3 style="margin: 20px 0 8px 0; font-size: 14px;">📋 追加情報</h3>
        <pre style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">${JSON.stringify(context.details, null, 2)}</pre>
        ` : ''}

        ${errorStack ? `
        <h3 style="margin: 20px 0 8px 0; font-size: 14px;">🔍 スタックトレース</h3>
        <pre style="background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; font-size: 11px; overflow-x: auto; max-height: 300px;">${errorStack}</pre>
        ` : ''}

        <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748b;">
          ※ このメールは自動送信されています。同じエラーは5分間に1回のみ通知されます。<br />
          ※ システム全体を緊急停止する場合は、<a href="${process.env.NEXT_PUBLIC_APP_URL}/system-admin" style="color: #dc2626;">全体管理画面</a>からサーキットブレーカーをONにしてください。
        </p>
      </div>
    `;

    // 全管理者に送信
        // 🔥 Firestore にエラーログを保存（エラーコンソール表示用）
    try {
      await db.collection('error_logs').add({
        source: context.source,
        message: errorMessage,
        stack: errorStack,
        userId: context.userId || null,
        shopId: context.shopId || null,
        details: context.details || null,
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log(`[error-notifier] Firestoreにログ保存完了`);
    } catch (logError) {
      console.error('[error-notifier] Firestoreログ保存失敗:', logError);
    }

    // 🔥 全管理者にメール送信
    await Promise.all(
      ADMIN_EMAILS.map((to) =>
        sendEmail({
          to,
          subject: `🚨【Push-taro】システムエラー [${context.source}] ${errorMessage.slice(0, 50)}`,
          html,
        })
      )
    );

    console.log(`[error-notifier] 管理者通知送信完了: ${context.source}`);
  } catch (notifyError) {
    // 通知自体が失敗しても、元のエラーは投げない
    console.error('[error-notifier] 通知送信失敗:', notifyError);
  }
}
