// 運営用: 契約者（主催者）の詳細取得と、契約枠・状態の変更。
// 支払い情報は本家に一元化するため、ここでは扱わない。
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { getOrganizer, updateOrganizer, type OrganizerStatus } from '@/lib/organizers';
import { listEventsByOwner } from '@/lib/event-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> },
) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '運営権限が必要です' }, { status: 403 });
  }

  const { contractId } = await params;
  const organizer = await getOrganizer(contractId);
  if (!organizer) {
    return NextResponse.json({ error: '契約者が見つかりません' }, { status: 404 });
  }
  const events = organizer.ownerUid
    ? await listEventsByOwner(organizer.ownerUid)
    : [];
  return NextResponse.json({ organizer, events });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> },
) {
  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: '運営権限が必要です' }, { status: 403 });
  }

  const { contractId } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }

  const patch: {
    subscriberCap?: number;
    couponCap?: number;
    status?: OrganizerStatus;
    billingOptionEnabled?: boolean;
  } = {};
  for (const field of ['subscriberCap', 'couponCap'] as const) {
    const value = body[field];
    if (value !== undefined) {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
        return NextResponse.json(
          { error: `${field} は1以上の整数で指定してください` },
          { status: 400 },
        );
      }
      patch[field] = value;
    }
  }
  if (body.status !== undefined) {
    if (body.status !== 'active' && body.status !== 'suspended') {
      return NextResponse.json(
        { error: 'status は active / suspended のいずれかです' },
        { status: 400 },
      );
    }
    patch.status = body.status;
  }
  if (body.billingOptionEnabled !== undefined) {
    if (typeof body.billingOptionEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'billingOptionEnabled は真偽値で指定してください' },
        { status: 400 },
      );
    }
    patch.billingOptionEnabled = body.billingOptionEnabled;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: '変更項目がありません' }, { status: 400 });
  }

  const updated = await updateOrganizer(contractId, patch);
  if (!updated) {
    return NextResponse.json({ error: '契約者が見つかりません' }, { status: 404 });
  }
  const organizer = await getOrganizer(contractId);
  return NextResponse.json({ organizer });
}
