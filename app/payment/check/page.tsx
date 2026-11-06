import { Suspense } from 'react';
import PaymentCheckContent from './PaymentCheckContent';

export const dynamic = 'force-dynamic';

export default function PaymentCheckPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>確認中...</div>}>
      <PaymentCheckContent />
    </Suspense>
  );
}
