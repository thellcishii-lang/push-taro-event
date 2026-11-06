import { handlePosCoupon } from '@/lib/pos-api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handlePosCoupon(request, false);
}
