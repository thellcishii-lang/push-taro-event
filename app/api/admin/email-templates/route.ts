import { NextResponse } from 'next/server';
import { db, authAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

// 一覧取得
export async function GET(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target'); // 'shop' | 'agency' | 'affiliate'

    let query: any = db.collection('email_templates');
    if (target) {
      query = query.where('target', '==', target);
    }

    const snapshot = await query.get();
    const templates = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        target: data.target,
        name: data.name,
        subject: data.subject,
        body: data.body,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error('[email-templates] GET エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 新規作成
export async function POST(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const { target, name, subject, body } = await request.json();

    if (!target || !name || !subject || !body) {
      return NextResponse.json({ error: '全項目必須です' }, { status: 400 });
    }

    if (!['shop', 'agency', 'affiliate'].includes(target)) {
      return NextResponse.json({ error: '無効な対象です' }, { status: 400 });
    }

    const docRef = await db.collection('email_templates').add({
      target,
      name,
      subject,
      body,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: uid,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error('[email-templates] POST エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 更新
export async function PUT(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const { id, name, subject, body } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    await db.collection('email_templates').doc(id).update({
      name,
      subject,
      body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[email-templates] PUT エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 削除
export async function DELETE(request: Request) {
  const uid = await verifyAdmin(request);
  if (!uid) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    await db.collection('email_templates').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[email-templates] DELETE エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
