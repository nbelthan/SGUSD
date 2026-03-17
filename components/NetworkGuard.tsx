'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { CHAIN_ID } from '@/lib/chains';

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chain } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  // If not connected via wagmi, let the auth layer handle it
  if (!isConnected) {
    return <>{children}</>;
  }

  // Wrong network
  if (chain && chain.id !== CHAIN_ID) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6">
        <div className="glass-card p-8 md:p-10 max-w-md w-full text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto mb-5">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Wrong Network
          </h3>
          <p className="text-sm text-slate-400 mb-1">
            SageBridge runs on <span className="text-indigo-400 font-medium">Base Sepolia</span> testnet.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            You&apos;re currently connected to {chain.name || `Chain ${chain.id}`}.
          </p>
          <button
            onClick={() => switchChain({ chainId: CHAIN_ID })}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-sm text-indigo-300 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Wifi size={14} />
            )}
            Switch to Base Sepolia
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function NetworkDisconnected() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
      <WifiOff size={12} />
      <span>Network disconnected — reconnecting...</span>
    </div>
  );
}
