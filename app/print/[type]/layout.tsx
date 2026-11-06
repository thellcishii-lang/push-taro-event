// app/print/[type]/layout.tsx
import type { Metadata } from 'next';
import { PRINT_MATERIALS } from '@/lib/print/constants';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const m = PRINT_MATERIALS.find((x) => x.type === type);
  return {
    title: m ? `${m.label} | Push-taro` : 'Push-taro',
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
