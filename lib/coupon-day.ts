const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function couponDay(date: Date): string {
  return new Date(date.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * JST基準の「YYYY-MM」を返す。
 * サーバーのTZ（通常UTC）に依存しないよう +9時間してから切り出す。
 * （UTCのままだと JST 1日 0:00〜8:59 が前月扱いになる）
 */
export function jstMonth(date: Date): string {
  return new Date(date.getTime() + JST_OFFSET_MS).toISOString().slice(0, 7);
}