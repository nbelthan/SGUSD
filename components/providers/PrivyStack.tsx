'use client';

import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import WagmiProvider from '@/components/providers/WagmiProvider';
import { baseSepolia } from '@/lib/chains';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

export default function PrivyStack({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderBase
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: '#0a0a0a',
          accentColor: '#6366f1',
          landingHeader: 'Welcome to Sage Intacct',
          loginMessage: 'Sign in to access your Sage Dollar treasury',
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
      <SmartWalletsProvider>
        <WagmiProvider>{children}</WagmiProvider>
      </SmartWalletsProvider>
    </PrivyProviderBase>
  );
}
