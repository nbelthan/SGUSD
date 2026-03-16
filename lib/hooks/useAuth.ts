'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';

export function useAuth() {
  const { ready, authenticated, user, login, logout: privyLogout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address as `0x${string}` | undefined;

  const logout = async () => {
    await privyLogout();
  };

  return {
    ready,
    isAuthenticated: ready && authenticated,
    user,
    walletAddress,
    walletsReady,
    login,
    logout,
  };
}
