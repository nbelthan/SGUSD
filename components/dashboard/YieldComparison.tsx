'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Building, Landmark, Zap } from 'lucide-react';

// Bank rates as of March 2026 (Bankrate, NerdWallet)
const RATES = [
  { name: 'Chase / BofA / Wells Fargo', rate: 0.01, icon: Building, color: 'text-red-400', barColor: 'bg-red-500/60', tier: 'big-bank' },
  { name: 'National Avg Savings', rate: 0.50, icon: Landmark, color: 'text-amber-400', barColor: 'bg-amber-500/60', tier: 'avg' },
  { name: 'SGUSD (SageBridge)', rate: 5.00, icon: Zap, color: 'text-emerald-400', barColor: 'bg-emerald-500', tier: 'sgusd' },
];

const MAX_RATE = 5.5; // for bar width scaling

interface YieldComparisonProps {
  balance?: number;
}

export default function YieldComparison({ balance = 0 }: YieldComparisonProps) {
  const annualEarnings = useMemo(() => {
    return RATES.map((r) => ({
      ...r,
      annual: balance * (r.rate / 100),
      barWidth: Math.max((r.rate / MAX_RATE) * 100, 1.5), // min 1.5% so tiny rates are visible
    }));
  }, [balance]);

  // Loss calculation: what you lose per year at Chase vs SGUSD
  const annualLoss = useMemo(() => {
    if (balance <= 0) return 0;
    const chaseEarnings = balance * (0.01 / 100);
    const sgusdEarnings = balance * (5.0 / 100);
    return sgusdEarnings - chaseEarnings;
  }, [balance]);

  const multiplier = Math.round(5.0 / 0.01);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-5 sm:p-6 md:p-8 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500 rounded-full blur-3xl pointer-events-none opacity-[0.07]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Your Money vs. The Bank
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual Percentage Yield comparison
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp size={12} className="text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">{multiplier}x more</span>
          </div>
        </div>

        {/* Rate bars */}
        <div className="space-y-4">
          {annualEarnings.map((item, i) => {
            const Icon = item.icon;
            const isSgusd = item.tier === 'sgusd';

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 * i }}
                className={`${isSgusd ? 'p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15' : ''}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={item.color} />
                    <span className={`text-xs font-medium ${isSgusd ? 'text-white' : 'text-slate-400'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-bold ${item.color}`}>
                      {item.rate.toFixed(2)}%
                    </span>
                    {balance > 0 && (
                      <span className="text-[10px] text-slate-500">
                        {item.annual < 1
                          ? `$${item.annual.toFixed(2)}/yr`
                          : `$${item.annual.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar */}
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.barWidth}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + 0.15 * i, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.barColor} ${isSgusd ? 'shadow-[0_0_12px_rgba(16,185,129,0.3)]' : ''}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Loss aversion callout */}
        {balance > 0 && annualLoss > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-5 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-300 font-medium">
                  Your idle capital is costing you{' '}
                  <span className="text-red-400 font-bold">
                    ${annualLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  /year at a traditional bank.
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Based on Chase savings rate (0.01% APY) vs SGUSD (5.00% APY) on your current balance.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Source footnote */}
        <p className="text-[9px] text-slate-600 mt-4">
          Rates as of March 2026 · Sources: Bankrate, NerdWallet
        </p>
      </div>
    </motion.div>
  );
}
