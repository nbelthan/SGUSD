'use client';

import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { baseSepolia } from '@/lib/chains';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
    return <>{children}</>;
  }

  return (
    <PrivyProviderBase
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: '#0a0a0a',
          accentColor: '#6366f1',
          landingHeader: 'Welcome to SageBridge',
          loginMessage: 'Sign in to access your SGUSD treasury',
          walletList: [],
        },
        loginMethods: ['email'],
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
