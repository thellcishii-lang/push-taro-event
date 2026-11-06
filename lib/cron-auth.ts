export function isValidCronRequest(request: Request): boolean {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return false;

  return request.headers.get('authorization') === `Bearer ${expectedSecret}` ||
    request.headers.get('x-cron-secret') === expectedSecret;
}