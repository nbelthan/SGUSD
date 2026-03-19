'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle2,
  ExternalLink,
  Clock,
  XCircle,
  DollarSign,
  Loader2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getTxUrl } from '@/lib/basescan';
import {
  EMPLOYEE_ACCOUNT,
  PAYROLL_ANNUAL_SALARY,
  PAYROLL_DAILY_AMOUNT,
  EWA_FEE,
  TRADITIONAL_PAYROLL_FEES,
} from '@/lib/demo/accounts';

interface PayrollStepProps {
  onPayrollComplete?: (txHash: string) => void;
}

const DAILY_RATE = PAYROLL_ANNUAL_SALARY / 365;
const STREAM_DURATION_MS = 8000;

export default function PayrollStep({ onPayrollComplete }: PayrollStepProps) {
  const { walletAddress } = useAuth();
  const [isSageMode, setIsSageMode] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedAmount, setStreamedAmount] = useState(0);
  const [streamComplete, setStreamComplete] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintTxHash, setMintTxHash] = useState<string | undefined>();
  const [mintError, setMintError] = useState<string | undefined>();
  const completedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Streaming animation using requestAnimationFrame
  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setStreamedAmount(0);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / STREAM_DURATION_MS, 1);
      // Ease-out curve for natural feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setStreamedAmount(eased * DAILY_RATE);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setStreamComplete(true);
        setIsStreaming(false);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Auto-start streaming on mount
  useEffect(() => {
    const timer = setTimeout(() => startStreaming(), 800);
    return () => clearTimeout(timer);
  }, [startStreaming]);

  const handleMint = useCallback(async () => {
    if (!walletAddress) return;
    setIsMinting(true);
    setMintError(undefined);
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: walletAddress, amount: PAYROLL_DAILY_AMOUNT }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Mint failed');
      setMintTxHash(data.hash);
      if (!completedRef.current) {
        completedRef.current = true;
        onPayrollComplete?.(data.hash);
      }
    } catch (err: unknown) {
      setMintError(err instanceof Error ? err.message : 'Mint failed');
    } finally {
      setIsMinting(false);
    }
  }, [walletAddress, onPayrollComplete]);

  useEffect(() => {
    return () => { completedRef.current = false; };
  }, []);

  const formatStreamed = (val: number) => {
    const [int, dec = ''] = val.toFixed(6).split('.');
    return { integer: parseInt(int, 10).toLocaleString(), decimal: dec };
  };

  const streamed = formatStreamed(streamedAmount);
  const perEmployeeSaved = TRADITIONAL_PAYROLL_FEES.perEmployeePerMonth;
  const ewaFeeDiff = TRADITIONAL_PAYROLL_FEES.ewaFeeFlat - EWA_FEE;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="glass-card p-5 sm:p-8 md:p-10 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4de082]/10 border border-[#4de082]/20">
            <Users size={20} className="text-[#4de082]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Payroll Streaming
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Acme Inc. uses <span className="text-white font-medium">Sage Workforce</span> to
          pay employees. Instead of bi-weekly lump sums,{' '}
          <span className="text-white font-medium">{EMPLOYEE_ACCOUNT.name}</span>{' '}
          (warehouse manager, ${PAYROLL_ANNUAL_SALARY.toLocaleString()}/yr) sees daily wages
          stream into her wallet as SGUSD in real-time.
        </p>
      </div>

      {/* Employee + streaming card */}
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
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-500">Annual Salary</p>
            <p className="text-sm font-semibold text-white">${PAYROLL_ANNUAL_SALARY.toLocaleString()}</p>
          </div>
        </div>

        {/* Streaming counter */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-400">Today&apos;s Earnings</p>
            {isStreaming && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Streaming
              </span>
            )}
            {streamComplete && !mintTxHash && (
              <span className="text-xs text-emerald-400">Day complete</span>
            )}
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-slate-400 text-xl sm:text-2xl font-light">$</span>
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              {streamed.integer}
            </span>
            <span className="text-sm sm:text-lg font-medium text-slate-400">.</span>
            <span className="text-sm sm:text-lg font-medium text-slate-400 font-mono">
              {streamed.decimal}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#4de082]/60 to-[#4de082]"
              animate={{ width: `${(streamedAmount / DAILY_RATE) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Daily rate: ${DAILY_RATE.toFixed(2)} &middot; Streamed per-second as SGUSD
          </p>
        </div>

        {/* Sage Savings badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15 mb-6">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">
            Sage Savings: 4.0% APY on idle wages
          </span>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between p-1 bg-black/40 rounded-full mb-6 border border-white/5">
          <button
            onClick={() => setIsSageMode(false)}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              !isSageMode
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Traditional (ADP/Gusto)
          </button>
          <button
            onClick={() => setIsSageMode(true)}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              isSageMode
                ? 'bg-[#4de082]/20 text-[#4de082] border border-[#4de082]/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sage Workforce (SGUSD)
          </button>
        </div>

        {/* Comparison */}
        <AnimatePresence mode="wait">
          {isSageMode ? (
            <motion.div
              key="sage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 mb-6"
            >
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pay frequency</span>
                <span className="text-emerald-400 font-medium">Real-time streaming</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Processing cost</span>
                <span className="text-emerald-400 font-medium">$0 on-chain rails</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Early Wage Access</span>
                <span className="text-emerald-400 font-medium">${EWA_FEE} flat fee</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Settlement</span>
                <span className="text-emerald-400 font-medium">Instant</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="traditional"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 mb-6"
            >
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pay frequency</span>
                <span className="text-amber-400">Bi-weekly</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Processing cost</span>
                <span className="text-red-400">${TRADITIONAL_PAYROLL_FEES.perEmployeePerMonth}/employee/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Early Wage Access</span>
                <span className="text-red-400">${TRADITIONAL_PAYROLL_FEES.ewaFeeFlat}/advance</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Settlement</span>
                <span className="text-amber-400">{TRADITIONAL_PAYROLL_FEES.achSettlementDays}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <AnimatePresence mode="wait">
          {mintTxHash ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  ${PAYROLL_DAILY_AMOUNT} SGUSD deposited to Acme treasury
                </span>
              </div>
              <a
                href={getTxUrl(mintTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-[#4de082] hover:text-[#4de082] transition-colors"
              >
                <span>View on BaseScan</span>
                <ExternalLink size={10} />
              </a>
            </motion.div>
          ) : (
            <button
              key="action"
              onClick={handleMint}
              disabled={isMinting || !walletAddress || !streamComplete || !isSageMode}
              className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isSageMode ? 'btn-sage' : 'btn-traditional'
              }`}
            >
              {isMinting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Zap size={16} />
                  Deposit Today&apos;s Wages (${PAYROLL_DAILY_AMOUNT} SGUSD)
                </>
              )}
            </button>
          )}
        </AnimatePresence>

        {mintError && (
          <div className="text-center mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
            <p className="text-xs text-red-400">{mintError}</p>
          </div>
        )}

        {!isSageMode && (
          <p className="text-xs text-slate-500 text-center mt-3">
            Traditional payroll is shown for comparison only.
          </p>
        )}
      </div>

      {/* "You Saved" card */}
      <AnimatePresence>
        {mintTxHash && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="glass-card p-5 sm:p-8 max-w-lg mx-auto"
          >
            <div className="text-center mb-5">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                <DollarSign size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Payroll Savings
              </h3>
              <p className="text-sm text-slate-400">
                Real-time streaming eliminates processing delays and reduces fees
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">Eliminated</span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">${perEmployeeSaved}/mo</span>{' '}
                  <span className="text-emerald-400">$0</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Per-employee processing fee</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-[#4de082]" />
                  <span className="text-xs font-medium text-[#4de082]">Reduced</span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">${TRADITIONAL_PAYROLL_FEES.ewaFeeFlat}</span>{' '}
                  <span className="text-emerald-400">${EWA_FEE}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  EWA fee saved ${ewaFeeDiff.toFixed(2)}/advance
                </p>
              </div>
            </div>

            <p className="text-xs text-center text-slate-500">
              At 18K+ companies on Sage Workforce, streaming payroll could save{' '}
              <span className="text-emerald-400 font-medium">$2.6M/month</span> in processing fees
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
