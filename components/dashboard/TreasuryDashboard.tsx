'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import TickingDigit from './TickingDigit';

// Traditional banking fee baseline
const WIRE_FEE = 45; // $45 per wire transfer
const FX_MARKUP = 0.03; // 3% foreign exchange markup

export default function TreasuryDashboard() {
  const { walletAddress } = useAuth();
  const { displayBalance, numericBalance, isLoading, isError } = useTickingBalance(walletAddress);

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
      className="glass-card p-8 md:p-12 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
            <div className="h-16 flex items-center">
              <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
            </div>
          ) : isError ? (
            <div className="h-16 flex items-center">
              <p className="text-sm text-red-400">Unable to load balance</p>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-3xl md:text-4xl font-light">$</span>
              <span className="text-balance-ticker text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {integer}
              </span>
              <span className="text-balance-ticker text-lg md:text-xl lg:text-2xl font-medium text-slate-400">
                .
              </span>
              <span className="text-balance-ticker text-lg md:text-xl lg:text-2xl font-medium text-slate-400 inline-flex">
                {decimal.split('').map((d, i) => (
                  <TickingDigit
                    key={i}
                    digit={d}
                    className="text-lg md:text-xl lg:text-2xl font-medium text-slate-400"
                  />
                ))}
              </span>
              <Badge className="ml-3 bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20">
                SGUSD
              </Badge>
            </div>
          )}
        </div>

        {/* Yield indicator */}
        {hasBalance && (
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
        )}

        {/* Fees saved counter */}
        {hasBalance && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                <PiggyBank size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Fees Saved vs. Traditional Banking
                </p>
                <p className="text-lg font-semibold text-emerald-400 mt-0.5">
                  ${feesSaved}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 leading-tight">
                  $45 wire fee + 3% FX
                  <br />
                  markup eliminated
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
