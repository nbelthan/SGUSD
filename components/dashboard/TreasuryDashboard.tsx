'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, PiggyBank, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import TickingDigit from './TickingDigit';

// Traditional banking fee baseline
const WIRE_FEE = 45; // $45 per wire transfer
const FX_MARKUP = 0.03; // 3% foreign exchange markup

export default function TreasuryDashboard() {
  const { walletAddress } = useAuth();
  const { displayBalance, numericBalance, isLoading, isError, refetch } = useTickingBalance(walletAddress);

  const hasBalance = displayBalance !== undefined && parseFloat(displayBalance) > 0;

  // Calculate fees saved vs traditional banking
  // Assumes the current balance represents a transaction that would have incurred wire + FX fees
  const feesSaved = useMemo(() => {
    if (!numericBalance || numericBalance <= 0) return '0.00';
    const traditionalFees = WIRE_FEE + numericBalance * FX_MARKUP;
    return traditionalFees.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [numericBalance]);

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
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-slate-500" />
            {walletAddress && (
              <span className="text-xs text-slate-500 font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>
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

        {/* Fees saved counter */}
        {isLoading ? (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                <div className="h-5 w-20 bg-emerald-500/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ) : hasBalance ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 flex-shrink-0">
                <PiggyBank size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Fees Saved vs. Traditional Banking
                </p>
                <p className="text-lg font-semibold text-emerald-400 mt-0.5">
                  ${feesSaved}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-500 leading-tight">
                  $45 wire fee + 3% FX
                  <br />
                  markup eliminated
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
