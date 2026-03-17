'use client';

import dynamic from 'next/dynamic';
import FallbackProvider from '@/components/providers/FallbackProvider';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

// Lazy-load Privy + Wagmi providers to avoid SSR side effects from @privy-io/wagmi
const PrivyStack = dynamic(() => import('@/components/providers/PrivyStack'), {
  ssr: false,
});

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
    return <FallbackProvider>{children}</FallbackProvider>;
  }

  return <PrivyStack>{children}</PrivyStack>;
}
