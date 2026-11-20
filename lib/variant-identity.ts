// lib/variant-identity.ts
// このバリアント（Push-taro EVENT）の同一性（Firebase プロジェクト）を
// 一元管理する定義ファイル。
//
// 背景: バリアントは相互にフォークして作られるため、コピー元の公開 URL や
// プロジェクト ID がコードに残ると、来場者が別バリアントのアプリへ
// 飛ばされる事故になる（初詣のフォーク時に EVENT の origin が残り、
// 来場者が EVENT アプリへ飛んだ実例がある）。
// 対策として、プロジェクト ID はここ1か所だけに置き、公開 origin と
// 既定ストレージバケットはここから導出する。値の正しさと「他バリアントの
// ID がコードのどこにも残っていない」ことは lib/variant-identity.test.ts
// が常時検証する。

/** このバリアントの Firebase プロジェクト ID。 */
export const VARIANT_PROJECT_ID = 'push-taro-event';

/** App Hosting のバックエンド ID（このバリアントではプロジェクト ID と同じ）。 */
export const VARIANT_BACKEND_ID = 'push-taro-event';

/**
 * 本番の App Hosting origin の既定値。
 * 形式: https://<バックエンドID>--<プロジェクトID>.asia-east1.hosted.app
 */
export const DEFAULT_APP_ORIGIN = `https://${VARIANT_BACKEND_ID}--${VARIANT_PROJECT_ID}.asia-east1.hosted.app`;

/** このプロジェクトの既定ストレージバケット。 */
export const VARIANT_DEFAULT_STORAGE_BUCKET = `${VARIANT_PROJECT_ID}.firebasestorage.app`;

/**
 * 他バリアントの Firebase プロジェクト ID。
 * このバリアントのコード（テストとこの定義ファイルを除く）にこれらが
 * 現れてはいけない。現れたらフォーク時の残り（混入）の疑いが強い。
 */
export const OTHER_VARIANT_PROJECT_IDS = [
  'push-taro-machiokoshi', // 町おこし
  'push-taro-hatsumode', // 初詣
  'push-taro-8b503', // 本家 Push-taro.com
] as const;
