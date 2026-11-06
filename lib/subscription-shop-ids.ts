const SHOP_ID_PATTERN = /^[A-Za-z0-9]{20}$/;

export function isShopIdArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === 'string');
}

export function normalizeShopIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.filter((id): id is string => typeof id === 'string'))];
  }
  if (value === null || typeof value !== 'object') return [];

  return [...new Set(Object.entries(value)
    .filter(([key, id]) => key.toLowerCase() !== 'token' &&
      typeof id === 'string' && SHOP_ID_PATTERN.test(id))
    .map(([, id]) => String(id)))];
}
