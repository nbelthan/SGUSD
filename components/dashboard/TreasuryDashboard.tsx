'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, RotateCcw, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import { useTreasuryAddress } from '@/lib/hooks/useTreasuryAddress';
import TickingDigit from './TickingDigit';

export default function TreasuryDashboard() {
  const { walletAddress } = useAuth();
  const treasuryAddress = useTreasuryAddress();
  const balanceAddress = treasuryAddress || walletAddress;
  const { displayBalance, numericBalance, isLoading, isError, refetch } = useTickingBalance(balanceAddress);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (!balanceAddress) return;
    navigator.clipboard.writeText(balanceAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasBalance = displayBalance !== undefined && parseFloat(displayBalance) > 0;

  // Split balance into integer and decimal parts for styling
  const formatBalance = (balance: string | undefined) => {
    if (!balance) return { integer: '0', decimal: '00000000' };
    const [integer, decimal = '00000000'] = balance.split('.');
    // Add thousands separators to integer part
    const formattedInteger = parseInt(integer, 10).toLocaleString();
    return { integer: formattedInteger, decimal };
  };

  const { integer, decimal } = formatBalance(displayBalance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-5 sm:p-8 md:p-12 relative overflow-hidden"
    >
      {/* Background glow — subtle breathing pulse */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10">
        {/* Account info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
              Acme Inc.
            </h2>
            <p className="text-sm text-slate-400 mt-1">SMB Treasury</p>
          </div>
          {balanceAddress && (
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group cursor-pointer"
              title={balanceAddress}
            >
              <Wallet size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-mono group-hover:text-slate-300 transition-colors">
                {balanceAddress.slice(0, 6)}...{balanceAddress.slice(-4)}
              </span>
              {copied ? (
                <Check size={10} className="text-emerald-400" />
              ) : (
                <Copy size={10} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              )}
            </button>
          )}
        </div>

        {/* Balance display */}
        <div className="mb-6">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            SGUSD Balance
          </p>

          {isLoading ? (
            <div className="h-12 sm:h-16 flex items-baseline gap-1 flex-wrap">
              <div className="h-6 sm:h-8 w-5 sm:w-6 bg-white/5 rounded animate-pulse" />
              <div className="h-8 sm:h-12 w-32 sm:w-48 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-5 sm:h-6 w-20 sm:w-32 bg-white/5 rounded animate-pulse ml-1" />
              <div className="h-5 w-14 bg-indigo-500/10 rounded-full animate-pulse ml-2 sm:ml-3" />
            </div>
          ) : isError ? (
            <div className="h-12 sm:h-16 flex items-center gap-3">
              <p className="text-sm text-red-400">Unable to load balance</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-0.5 sm:gap-1 flex-wrap">
              <span className="text-slate-400 text-2xl sm:text-3xl md:text-4xl font-light">$</span>
              <span className="text-balance-ticker text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {integer}
              </span>
              <span className="text-balance-ticker text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-slate-400">
                .
              </span>
              <span className="text-balance-ticker text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-slate-400 inline-flex" style={{ textShadow: '0 0 8px rgba(129,140,248,0.3)' }}>
                {decimal.split('').map((d, i) => (
                  <TickingDigit
                    key={i}
                    digit={d}
                    className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-slate-400"
                  />
                ))}
              </span>
              <Badge className="ml-2 sm:ml-3 bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20">
                SGUSD
              </Badge>
            </div>
          )}
        </div>

        {/* Yield indicator */}
        {isLoading ? (
          <div className="flex items-center gap-2 h-5">
            <div className="w-3.5 h-3.5 bg-emerald-500/10 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
          </div>
        ) : hasBalance ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2 text-sm"
          >
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-emerald-400 font-medium">5.00% APY</span>
            <span className="text-slate-500">· Earning yield in real-time</span>
          </motion.div>
        ) : null}

      </div>
    </motion.div>
  );
}
