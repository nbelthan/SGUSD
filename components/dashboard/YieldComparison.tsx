'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Building, Landmark, DollarSign } from 'lucide-react';

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
    rate: 0.39,
    icon: Landmark,
    color: 'text-amber-400',
    barGradient: 'from-amber-500/80 to-amber-400/60',
    per10k: '$39',
  },
  {
    name: 'Sage Dollar',
    sub: 'SGUSD — 3.20% APY',
    rate: 3.20,
    icon: DollarSign,
    color: 'text-emerald-400',
    barGradient: 'from-emerald-500 to-emerald-400',
    per10k: '$320',
  },
];

interface YieldComparisonProps {
  balance?: number;
}

export default function YieldComparison({ balance = 0 }: YieldComparisonProps) {
  const annualLoss = useMemo(() => {
    if (balance <= 0) return 0;
    return balance * (3.20 / 100) - balance * (0.01 / 100);
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Where is your money working hardest?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual yield on every $10,000
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {YIELD_BARS.map((item, i) => {
            const Icon = item.icon;
            const isSgusd = item.name === 'SGUSD';
            const barWidth = Math.max((item.rate / 5.0) * 100, 1.5);

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className={`rounded-xl p-3 ${
                  isSgusd
                    ? 'bg-emerald-500/[0.06] border border-emerald-500/15'
                    : 'bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center ${
                        isSgusd
                          ? 'bg-emerald-500/15 border border-emerald-500/25'
                          : 'bg-white/[0.04] border border-white/[0.06]'
                      }`}
                    >
                      <Icon size={13} className={item.color} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${isSgusd ? 'text-white' : 'text-slate-400'}`}>
                        {item.name}
                      </p>
                      <p className="text-[9px] text-slate-600 hidden sm:block">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-bold tabular-nums ${item.color}`}>
                      {item.rate.toFixed(2)}%
                    </span>
                    <span className={`text-[10px] tabular-nums ${isSgusd ? 'text-emerald-400/70' : 'text-slate-600'}`}>
                      {item.per10k}/yr
                    </span>
                  </div>
                </div>

                <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.3 + 0.12 * i,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.barGradient} ${
                      isSgusd ? 'shadow-[0_0_12px_rgba(16,185,129,0.3)]' : ''
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {balance > 0 && annualLoss > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-4 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15"
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
                  Big bank checking (0.01% APY) vs SGUSD (3.20% APY) on your current balance.
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
