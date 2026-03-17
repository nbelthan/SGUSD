'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Building, Landmark, Zap } from 'lucide-react';

const YIELD_BARS = [
  {
    name: 'Big Bank Checking',
    sub: 'Chase, BofA, Wells Fargo',
    rate: 0.01,
    icon: Building,
    color: 'text-red-400',
    barGradient: 'from-red-500/80 to-red-400/60',
    per10k: '$1',
  },
  {
    name: 'Avg Savings',
    sub: 'National average',
    rate: 0.50,
    icon: Landmark,
    color: 'text-amber-400',
    barGradient: 'from-amber-500/80 to-amber-400/60',
    per10k: '$50',
  },
  {
    name: 'High-Yield Savings',
    sub: 'Marcus, Ally, Discover',
    rate: 4.25,
    icon: Building,
    color: 'text-sky-400',
    barGradient: 'from-sky-500/80 to-sky-400/60',
    per10k: '$425',
  },
  {
    name: 'SGUSD',
    sub: 'SageBridge',
    rate: 5.00,
    icon: Zap,
    color: 'text-emerald-400',
    barGradient: 'from-emerald-500 to-emerald-400',
    per10k: '$500',
  },
];

const MAX_RATE = 5.5;

interface YieldComparisonProps {
  balance?: number;
}

export default function YieldComparison({ balance = 0 }: YieldComparisonProps) {
  const annualLoss = useMemo(() => {
    if (balance <= 0) return 0;
    return balance * (5.0 / 100) - balance * (0.01 / 100);
  }, [balance]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-5 sm:p-6 md:p-8 relative overflow-hidden"
    >
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500 rounded-full blur-3xl pointer-events-none opacity-[0.07]" />

      <div className="relative z-10">
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
            <span className="text-sm font-bold text-emerald-400">500x more</span>
          </div>
        </div>

        {/* Vertical bar chart */}
        <div className="flex items-end justify-between gap-3 sm:gap-4 h-48 sm:h-56 mb-2">
          {YIELD_BARS.map((item, i) => {
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
                <span className={`text-xs sm:text-sm font-bold ${item.color} mb-1.5`}>
                  {item.rate.toFixed(2)}%
                </span>

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
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-1.5 ${
                    isSgusd
                      ? 'bg-emerald-500/15 border border-emerald-500/25'
                      : 'bg-white/[0.04] border border-white/[0.06]'
                  }`}
                >
                  <Icon size={14} className={item.color} />
                </div>
                <p
                  className={`text-[10px] sm:text-xs font-medium leading-tight ${
                    isSgusd ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {item.name}
                </p>
                <p className="text-[9px] text-slate-600 leading-tight mt-0.5 hidden sm:block">
                  {item.sub}
                </p>
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

        {/* Loss aversion callout */}
        {balance > 0 && annualLoss > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-6 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-300 font-medium">
                  You&apos;re leaving{' '}
                  <span className="text-red-400 font-bold">
                    ${annualLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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

        <p className="text-[9px] text-slate-600 mt-4">
          Rates as of March 2026 &middot; Sources: Bankrate, NerdWallet
        </p>
      </div>
    </motion.div>
  );
}
