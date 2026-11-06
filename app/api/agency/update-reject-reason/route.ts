import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

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

export async function POST(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  const { agencyId, reason } = await request.json();
  if (!agencyId) {
    return NextResponse.json({ error: 'agencyId が必要です' }, { status: 400 });
  }

  await db.collection('agencies').doc(agencyId).update({
    rejectReason: reason || '',
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
