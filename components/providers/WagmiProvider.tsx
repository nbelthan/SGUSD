'use client';

import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi';
import { createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { baseSepolia } from '@/lib/chains';

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export { wagmiConfig };

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyWagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PrivyWagmiProvider>
  );
}
