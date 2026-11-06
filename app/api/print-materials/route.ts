import { NextRequest, NextResponse } from 'next/server';
import { authAdmin, db } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await authAdmin.verifyIdToken(idToken);  // ← authAdmin
    const uid = decoded.uid;

    // 1. 代理店として探す
    const agencyDoc = await db.collection('agencies').doc(uid).get();
    if (agencyDoc.exists) {
      const a = agencyDoc.data()!;
      if (a.status !== 'active') {
        return NextResponse.json({ error: '決済完了後にご利用いただけます' }, { status: 403 });
      }
      return NextResponse.json({
        role: 'agency',
        companyName: a.companyName || '',
        ownerName: a.ownerName || '',
        email: a.email || decoded.email || '',
        phone: a.phone || '',
        address: a.address || '',
        website: a.website || '',
        invoiceNumber: a.invoiceNumber || '',
        referralCode: a.referralCode || '',
        referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${a.referralCode}`,
        logoUrl: a.logoUrl || '',
      });
    }

    // 2. affilishopとして探す
    const affilishopDoc = await db.collection('affilishops').doc(uid).get();
    if (affilishopDoc.exists) {
      const s = affilishopDoc.data()!;
      return NextResponse.json({
        role: 'affilishop',
        companyName: s.companyName || '',
        ownerName: s.ownerName || '',
        email: s.email || decoded.email || '',
        phone: s.phone || '',
        address: s.address || '',
        website: s.website || '',
        invoiceNumber: s.invoiceNumber || '',
        referralCode: s.referralCode || '',
        referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${s.referralCode}`,
        logoUrl: s.logoUrl || '',
      });
    }

    return NextResponse.json({ error: 'Not a partner' }, { status: 403 });
  } catch (err: any) {
    console.error('[print-materials]', err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
