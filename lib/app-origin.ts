// lib/app-origin.ts
// アプリの公開 origin と、イベント配下の公開 URL の組み立て。
//
// もとは lib/exhibitor-access.ts（サーバー専用）にあったが、主催者コンソール
// （クライアント側）でも来場者ページ URL が必要になったため、サーバー専用
// コードを含まない共有 lib に切り出した。lib/exhibitor-access.ts は互換の
// ため APP_ORIGIN / resolveAppOrigin を re-export している。

/**
 * 本番の App Hosting origin（本家側 lib/event-provisioning.ts の定数と同じ値）。
 * 将来の独自ドメイン化に備え、環境変数 NEXT_PUBLIC_APP_ORIGIN があれば
 * そちらを優先する（末尾のスラッシュは取り除く）。
 */
export const APP_ORIGIN =
  'https://push-taro-event--push-taro-event.asia-east1.hosted.app';

export function resolveAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim();
  return (fromEnv || APP_ORIGIN).replace(/\/+$/, '');
}

/** 来場者ページ（登録・クーポン画面）の URL。主催者向け登録用 QR の飛び先。 */
export function eventVisitorUrl(eventId: string): string {
  return `${resolveAppOrigin()}/e/${encodeURIComponent(eventId)}`;
}
