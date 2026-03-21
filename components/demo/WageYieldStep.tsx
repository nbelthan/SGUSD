'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Coins,
  Sparkles,
} from 'lucide-react';
import {
  EMPLOYEE_ACCOUNT,
  PAYROLL_DAILY_AMOUNT,
} from '@/lib/demo/accounts';

interface WageYieldStepProps {
  onContinue?: () => void;
}

const DAILY_AMOUNT = Number(PAYROLL_DAILY_AMOUNT); // $164
const TOTAL_DAYS = 30;
const ANIMATION_DURATION_MS = 10000; // 10 seconds to simulate 30 days
const APY_SGUSD = 3.20;
const APY_CHECKING = 0.01;
const APY_SAVINGS = 0.45;
const DAYS_IN_YEAR = 365;

/**
 * Calculate cumulative yield for daily deposits over N days at a given APY.
 * Each day's deposit earns for (days - depositDay) remaining days.
 * yield = dailyAmount × (APY/100/365) × days×(days-1)/2
 */
function calculateYield(days: number, apy: number): number {
  const dailyRate = apy / 100 / DAYS_IN_YEAR;
  const cumulativeDays = days * (days - 1) / 2;
  return DAILY_AMOUNT * dailyRate * cumulativeDays;
}

export default function WageYieldStep({ onContinue }: WageYieldStepProps) {
  const [currentDay, setCurrentDay] = useState(0);
  const [totalWages, setTotalWages] = useState(0);
  const [yieldEarned, setYieldEarned] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const startAnimation = useCallback(() => {
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      // Ease-out curve for natural feel
      const eased = 1 - Math.pow(1 - progress, 2.5);

      const fractionalDays = eased * TOTAL_DAYS;
      const days = Math.min(Math.ceil(fractionalDays), TOTAL_DAYS);

      setCurrentDay(days);
      setTotalWages(days * DAILY_AMOUNT);
      setYieldEarned(calculateYield(fractionalDays, APY_SGUSD));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCurrentDay(TOTAL_DAYS);
        setTotalWages(TOTAL_DAYS * DAILY_AMOUNT);
        setYieldEarned(calculateYield(TOTAL_DAYS, APY_SGUSD));
        setAnimationComplete(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => startAnimation(), 600);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startAnimation]);

  const netBalance = totalWages + yieldEarned;
  const finalYieldSgusd = calculateYield(TOTAL_DAYS, APY_SGUSD);
  const finalYieldChecking = calculateYield(TOTAL_DAYS, APY_CHECKING);
  const finalYieldSavings = calculateYield(TOTAL_DAYS, APY_SAVINGS);

  const formatYield = (val: number) => {
    const [int, dec = ''] = val.toFixed(6).split('.');
    return { integer: int, decimal: dec };
  };

  const yield6 = formatYield(yieldEarned);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="glass-card p-5 sm:p-8 md:p-10 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4de082]/10 border border-[#4de082]/20">
            <TrendingUp size={20} className="text-[#4de082]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Wage Yield</h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Maria&apos;s wages don&apos;t just sit idle. Every dollar she earns starts accruing{' '}
          <span className="text-emerald-400 font-medium">3.20% APY</span> the moment it lands
          in her Sage wallet. Over 30 days of daily streaming, her accumulated wages generate
          meaningful yield &mdash; unlike a traditional checking account where the same money
          earns almost nothing.
        </p>
      </div>

      {/* Main animation card */}
      <div className="glass-card p-5 sm:p-8 max-w-lg mx-auto">
        {/* Employee profile */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4de082]/15 to-[#3cd072]/15 border border-white/10 flex items-center justify-center text-sm font-bold text-[#4de082]">
            MG
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{EMPLOYEE_ACCOUNT.name}</p>
            <p className="text-xs text-slate-400">{EMPLOYEE_ACCOUNT.role}</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-slate-500">30-Day Projection</span>
          </div>
        </div>

        {/* Day counter + progress */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-sm text-slate-400">
              Day <span className="text-white font-semibold font-mono">{currentDay}</span> of {TOTAL_DAYS}
            </span>
          </div>
          {!animationComplete && currentDay > 0 && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Simulating
            </span>
          )}
          {animationComplete && (
            <span className="text-xs text-emerald-400">Complete</span>
          )}
        </div>

        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-6">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#4de082]/60 to-[#4de082]"
            animate={{ width: `${(currentDay / TOTAL_DAYS) * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>

        {/* Wages + Yield counters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Coins size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-400">Wages Deposited</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white font-mono">
              ${totalWages.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              ${DAILY_AMOUNT}/day &times; {currentDay} days
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Yield Earned</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
                ${yield6.integer}
              </span>
              <span className="text-xs sm:text-sm font-medium text-emerald-400/60 font-mono">
                .{yield6.decimal}
              </span>
            </div>
            <p className="text-[10px] text-emerald-500/60 mt-1">
              3.20% APY compounding
            </p>
          </div>
        </div>

        {/* Net balance */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Maria&apos;s Net Balance</span>
            <Sparkles size={14} className="text-[#4de082]" />
          </div>
          <div className="flex items-baseline gap-0.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              ${Math.floor(netBalance).toLocaleString()}
            </span>
            <span className="text-sm sm:text-lg font-medium text-slate-400 font-mono">
              .{(netBalance % 1).toFixed(6).slice(2)}
            </span>
            <span className="text-xs text-slate-500 ml-2">SGUSD</span>
          </div>
        </div>

        {/* Yield comparison — appears after animation */}
        <AnimatePresence>
          {animationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              className="space-y-4"
            >
              <p className="text-xs text-slate-500 text-center mb-3">
                Where would Maria&apos;s ${(TOTAL_DAYS * DAILY_AMOUNT).toLocaleString()} earn the most in 30 days?
              </p>

              <div className="space-y-2">
                {[
                  { name: 'Bank Checking', apy: APY_CHECKING, earned: finalYieldChecking, accent: false },
                  { name: 'Savings Acct', apy: APY_SAVINGS, earned: finalYieldSavings, accent: false },
                  { name: 'SGUSD', apy: APY_SGUSD, earned: finalYieldSgusd, accent: true },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className={`text-xs font-medium w-24 shrink-0 ${item.accent ? 'text-[#4de082]' : 'text-slate-400'}`}>
                      {item.name}
                    </span>
                    <div className={`flex-1 h-8 rounded-lg flex items-center justify-between px-3 ${
                      item.accent
                        ? 'bg-[#4de082]/15 border border-[#4de082]/25'
                        : 'bg-white/[0.06]'
                    }`}>
                      <span className={`text-xs font-medium ${item.accent ? 'text-[#4de082]' : 'text-slate-400'}`}>
                        {item.apy.toFixed(2)}% APY
                      </span>
                      <span className={`text-xs font-bold font-mono ${item.accent ? 'text-[#4de082]' : 'text-slate-300'}`}>
                        +${item.earned.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-center text-emerald-400/70 mt-2">
                Maria earns{' '}
                <span className="font-semibold text-emerald-400">
                  {Math.round(finalYieldSgusd / finalYieldChecking)}&times;
                </span>{' '}
                more yield with SGUSD than a traditional checking account
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue button */}
      <AnimatePresence>
        {animationComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <button
              onClick={onContinue}
              className="w-full btn-sage py-4 rounded-xl font-medium text-sm"
            >
              Continue to Auto-Repay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
