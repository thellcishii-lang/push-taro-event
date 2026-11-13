// lib/storage-bucket.ts
// Admin SDK 用の Storage バケット名の解決（純関数）。
//
// 背景: firebase-admin の initializeApp に storageBucket を渡していないと、
// getStorage().bucket() は "Bucket name not specified or invalid" で落ちる。
// イベント削除（lib/event-store.ts）と案内PDF削除（lib/event-info.ts）が
// このエラーで失敗したため、初期化時に必ずバケット名を渡す。
// 値の出どころは apphosting.yaml の NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
// （クライアント設定と同じ公開識別子）。最終フォールバックはこの
// プロジェクトの既定バケット。

export const DEFAULT_STORAGE_BUCKET = 'push-taro-event.firebasestorage.app';

export function resolveStorageBucket(
  env: Record<string, string | undefined>,
): string {
  return (
    env.FIREBASE_STORAGE_BUCKET ||
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    DEFAULT_STORAGE_BUCKET
  );
}
