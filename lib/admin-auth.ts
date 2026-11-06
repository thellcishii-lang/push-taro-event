// lib/admin-auth.ts
import { authAdmin } from './firebase-admin';

/**
 * リクエストヘッダーの Bearer トークンを検証し、
 * 管理者（customClaims.admin === true）であれば uid を返す。
 * 失敗時は null を返す。
 */
export async function verifyAdmin(request: Request): Promise<string | null> {
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
