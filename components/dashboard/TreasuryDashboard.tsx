'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Building,
  Landmark,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import { useTreasuryAddress } from '@/lib/hooks/useTreasuryAddress';
import { getAddressUrl } from '@/lib/basescan';
import TickingDigit from './TickingDigit';

/* ── Yield-comparison data ── */
const YIELD_BARS = [
  {
    name: 'Big Bank Checking',
    sub: 'Chase, BofA, Wells Fargo',
    rate: 0.01,
    icon: Building,
    color: 'text-red-400',
    barGradient: 'from-red-500/80 to-red-400/60',
    bgGlow: 'bg-red-500',
    per10k: '$1',
  },
  {
    name: 'Avg Savings',
    sub: 'National average',
    rate: 0.50,
    icon: Landmark,
    color: 'text-amber-400',
    barGradient: 'from-amber-500/80 to-amber-400/60',
    bgGlow: 'bg-amber-500',
    per10k: '$50',
  },
  {
    name: 'High-Yield Savings',
    sub: 'Marcus, Ally, Discover',
    rate: 4.25,
    icon: Building,
    color: 'text-sky-400',
    barGradient: 'from-sky-500/80 to-sky-400/60',
    bgGlow: 'bg-sky-500',
    per10k: '$425',
  },
  {
    name: 'SGUSD',
    sub: 'SageBridge',
    rate: 5.00,
    icon: Zap,
    color: 'text-emerald-400',
    barGradient: 'from-emerald-500 to-emerald-400',
    bgGlow: 'bg-emerald-500',
    per10k: '$500',
  },
];
const MAX_RATE = 5.5;

export default function TreasuryDashboard() {
  const { walletAddress } = useAuth();
  const treasuryAddress = useTreasuryAddress();
  const balanceAddress = treasuryAddress || walletAddress;
  const { displayBalance, numericBalance, isLoading, isError, refetch } =
    useTickingBalance(balanceAddress);
  const [copied, setCopied] = useState(false);

  /* ── copy handler ── */
  const handleCopyAddress = () => {
    if (!balanceAddress) return;
    navigator.clipboard.writeText(balanceAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasBalance =
    displayBalance !== undefined && parseFloat(displayBalance) > 0;
  const balance = numericBalance ?? 0;

  /* ── format balance into integer + decimal parts ── */
  const formatBalance = (bal: string | undefined) => {
    if (!bal) return { integer: '0', decimal: '00000000' };
    const [integer, decimal = '00000000'] = bal.split('.');
    const formattedInteger = parseInt(integer, 10).toLocaleString();
    return { integer: formattedInteger, decimal };
  };
  const { integer, decimal } = formatBalance(displayBalance);

  /* ── yield comparison memos ── */
  const annualLoss = useMemo(() => {
    if (balance <= 0) return 0;
    return balance * (5.0 / 100) - balance * (0.01 / 100);
  }, [balance]);

  const basescanUrl = balanceAddress ? getAddressUrl(balanceAddress) : '#';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-5 sm:p-8 md:p-12 relative overflow-hidden"
    >
      {/* Background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo" />
      <div
        className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo"
        style={{ animationDelay: '1.5s' }}
      />
      <div className="absolute -bottom-24 left-1/2 w-56 h-56 bg-emerald-500 rounded-full blur-3xl pointer-events-none opacity-[0.06]" />

      <div className="relative z-10">
        {/* ── Account header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
              Acme Inc.
            </h2>
            <p className="text-sm text-slate-400 mt-1">SMB Treasury</p>
          </div>

          {balanceAddress && (
            <div className="flex items-center gap-2">
              {/* Copy button */}
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
                  <Copy
                    size={10}
                    className="text-slate-600 group-hover:text-slate-400 transition-colors"
                  />
                )}
              </button>

              {/* BaseScan link */}
              <a
                href={basescanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
                title="View on BaseScan"
              >
                <ExternalLink size={12} className="text-slate-500 hover:text-slate-300" />
              </a>
            </div>
          )}
        </div>

        {/* ── Balance display ── */}
        <div className="mb-8">
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
              <span className="text-slate-400 text-2xl sm:text-3xl md:text-4xl font-light">
                $
              </span>
              <span className="text-balance-ticker text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {integer}
              </span>
              <span className="text-balance-ticker text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-slate-400">
                .
              </span>
              <span
                className="text-balance-ticker text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-slate-400 inline-flex"
                style={{ textShadow: '0 0 8px rgba(129,140,248,0.3)' }}
              >
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

          {/* Yield indicator line */}
          {!isLoading && !isError && hasBalance && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-2 text-sm mt-3"
            >
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">5.00% APY</span>
              <span className="text-slate-500">&middot; Earning yield in real-time</span>
            </motion.div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-white/[0.06] mb-6" />

        {/* ── Embedded Yield Comparison — Vertical Bar Chart ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Where is your money working hardest?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Annual yield on every $10,000
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">
                500x more
              </span>
            </div>
          </div>

          {/* Vertical bar chart */}
          <div className="flex items-end justify-between gap-3 sm:gap-4 h-48 sm:h-56 mb-2">
            {YIELD_BARS.map((item, i) => {
              const Icon = item.icon;
              const isSgusd = item.name === 'SGUSD';
              const barHeight = Math.max((item.rate / MAX_RATE) * 100, 2);

              return (
                <motion.div
                  key={item.name}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  {/* Rate label above bar */}
                  <span className={`text-xs sm:text-sm font-bold ${item.color} mb-1.5`}>
                    {item.rate < 1 ? `${item.rate.toFixed(2)}%` : `${item.rate.toFixed(2)}%`}
                  </span>

                  {/* Vertical bar */}
                  <div className="w-full flex justify-center">
                    <motion.div
                      className={`relative w-10 sm:w-14 rounded-t-xl bg-gradient-to-t ${item.barGradient} ${
                        isSgusd ? 'shadow-[0_0_20px_rgba(16,185,129,0.25)]' : ''
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.2 + 0.12 * i,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      style={{ minHeight: '8px' }}
                    >
                      {/* Glow effect for SGUSD */}
                      {isSgusd && (
                        <div className="absolute inset-0 rounded-t-xl bg-emerald-400/20 blur-sm" />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Labels below bars */}
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            {YIELD_BARS.map((item) => {
              const Icon = item.icon;
              const isSgusd = item.name === 'SGUSD';
              return (
                <div key={item.name} className="flex-1 flex flex-col items-center text-center">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-1.5 ${
                      isSgusd
                        ? 'bg-emerald-500/15 border border-emerald-500/25'
                        : 'bg-white/[0.04] border border-white/[0.06]'
                    }`}
                  >
                    <Icon size={14} className={item.color} />
                  </div>
                  {/* Name */}
                  <p
                    className={`text-[10px] sm:text-xs font-medium leading-tight ${
                      isSgusd ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.name}
                  </p>
                  {/* Sub label */}
                  <p className="text-[9px] text-slate-600 leading-tight mt-0.5 hidden sm:block">
                    {item.sub}
                  </p>
                  {/* Per-10k earnings */}
                  <p
                    className={`text-[10px] font-semibold mt-1 ${
                      isSgusd ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {item.per10k}
                    <span className="text-slate-600 font-normal">/yr</span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Loss aversion callout — reframed for impact */}
          {balance > 0 && annualLoss > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="mt-6 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  size={14}
                  className="text-red-400 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-red-300 font-medium">
                    You&apos;re leaving{' '}
                    <span className="text-red-400 font-bold">
                      $
                      {annualLoss.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    /year on the table in a checking account.
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Big bank checking (0.01% APY) vs SGUSD (5.00% APY) on your current balance.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* BaseScan + source footnote */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-[9px] text-slate-600">
              Rates as of March 2026 &middot; Sources: Bankrate, NerdWallet
            </p>
            {balanceAddress && (
              <a
                href={basescanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View on BaseScan
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
