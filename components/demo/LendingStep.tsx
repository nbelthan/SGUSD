'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  CheckCircle2,
  ExternalLink,
  XCircle,
  DollarSign,
  Loader2,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getTxUrl } from '@/lib/basescan';
import {
  SAGE_CAPITAL_ACCOUNT,
  NEW_CUSTOMER_ACCOUNT,
  LOC_TOTAL,
  LOC_OUTSTANDING,
  NEW_PAYMENT_AMOUNT,
  AUTO_REPAY_PERCENT,
  AUTO_REPAY_AMOUNT,
  TRADITIONAL_LENDING_FEES,
} from '@/lib/demo/accounts';

interface LendingStepProps {
  onLendingComplete?: (txHash: string) => void;
}

export default function LendingStep({ onLendingComplete }: LendingStepProps) {
  const { walletAddress } = useAuth();
  const [isSageMode, setIsSageMode] = useState(true);
  const [phase, setPhase] = useState<'idle' | 'minting' | 'repaying' | 'done'>('idle');
  const [mintTxHash, setMintTxHash] = useState<string | undefined>();
  const [repayTxHash, setRepayTxHash] = useState<string | undefined>();
  const [actionError, setActionError] = useState<string | undefined>();
  const [showUpdatedLoc, setShowUpdatedLoc] = useState(false);
  const completedRef = useRef(false);

  const paymentAmount = Number(NEW_PAYMENT_AMOUNT);
  const repayAmount = Number(AUTO_REPAY_AMOUNT);
  const treasuryAmount = paymentAmount - repayAmount;
  const newOutstanding = LOC_OUTSTANDING - repayAmount;
  const newAvailable = LOC_TOTAL - newOutstanding;
  const oldAvailable = LOC_TOTAL - LOC_OUTSTANDING;
  const utilizationOld = (LOC_OUTSTANDING / LOC_TOTAL) * 100;
  const utilizationNew = (newOutstanding / LOC_TOTAL) * 100;

  // Interest savings: difference in APR on outstanding balance
  const annualInterestDiffOnOutstanding =
    LOC_OUTSTANDING * ((TRADITIONAL_LENDING_FEES.aprBank - TRADITIONAL_LENDING_FEES.aprSage) / 100);

  const handleAction = useCallback(async () => {
    if (!walletAddress) return;
    setActionError(undefined);

    // Step 1: Mint incoming payment
    setPhase('minting');
    let mintHash: string;
    try {
      const mintRes = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: walletAddress, amount: NEW_PAYMENT_AMOUNT }),
      });
      const mintData = await mintRes.json();
      if (!mintRes.ok) throw new Error(mintData.error || 'Mint failed');
      mintHash = mintData.hash;
      setMintTxHash(mintHash);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Payment mint failed');
      setPhase('idle');
      return;
    }

    // Wait for mint to confirm before sending transfer (same deployer wallet = same nonce pool)
    try {
      const waitRes = await fetch(`/api/tx-wait?hash=${mintHash}`);
      if (!waitRes.ok) {
        // Fallback: just wait a fixed time if the endpoint doesn't exist
        await new Promise((r) => setTimeout(r, 8000));
      }
    } catch {
      // Fallback: wait for block confirmation
      await new Promise((r) => setTimeout(r, 8000));
    }

    // Step 2: Transfer auto-repayment to Sage Capital
    setPhase('repaying');
    try {
      const transferRes = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: walletAddress,
          to: SAGE_CAPITAL_ACCOUNT.address,
          amount: AUTO_REPAY_AMOUNT,
        }),
      });
      const transferData = await transferRes.json();
      if (!transferRes.ok) throw new Error(transferData.error || 'Transfer failed');
      setRepayTxHash(transferData.hash);
      setPhase('done');

      // Animate LOC update after a brief pause
      setTimeout(() => setShowUpdatedLoc(true), 600);

      if (!completedRef.current) {
        completedRef.current = true;
        onLendingComplete?.(transferData.hash);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Auto-repayment failed');
      setPhase('minting'); // keep mint shown, repay failed
    }
  }, [walletAddress, onLendingComplete]);

  useEffect(() => {
    return () => { completedRef.current = false; };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="glass-card p-5 sm:p-8 md:p-10 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Landmark size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Lending Auto-Repayment
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Acme Inc. has a <span className="text-white font-medium">${LOC_TOTAL.toLocaleString()} Sage Capital</span> line
          of credit (${LOC_OUTSTANDING.toLocaleString()} outstanding). When a new $
          {paymentAmount.toLocaleString()} payment from{' '}
          <span className="text-white font-medium">{NEW_CUSTOMER_ACCOUNT.name}</span> arrives,
          the smart contract automatically sweeps {AUTO_REPAY_PERCENT}% ($
          {repayAmount.toLocaleString()}) to pay down the LOC. No manual payments, no late fees.
        </p>
      </div>

      {/* LOC Status Card */}
      <div className="glass-card p-5 sm:p-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white">Line of Credit Status</h4>
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            {SAGE_CAPITAL_ACCOUNT.role.match(/\((.+)\)/)?.[1]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-xs text-slate-500 mb-1">Total</p>
            <p className="text-sm font-bold text-white">${LOC_TOTAL.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-xs text-slate-500 mb-1">Outstanding</p>
            <motion.p
              className="text-sm font-bold"
              animate={{ color: showUpdatedLoc ? '#34d399' : '#ffffff' }}
            >
              ${showUpdatedLoc ? newOutstanding.toLocaleString() : LOC_OUTSTANDING.toLocaleString()}
            </motion.p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-xs text-slate-500 mb-1">Available</p>
            <motion.p
              className="text-sm font-bold"
              animate={{ color: showUpdatedLoc ? '#34d399' : '#ffffff' }}
            >
              ${showUpdatedLoc ? newAvailable.toLocaleString() : oldAvailable.toLocaleString()}
            </motion.p>
          </div>
        </div>

        {/* Utilization bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Utilization</span>
            <motion.span
              className="text-slate-300 font-medium"
              animate={{ opacity: 1 }}
            >
              {showUpdatedLoc ? `${utilizationNew.toFixed(0)}%` : `${utilizationOld.toFixed(0)}%`}
            </motion.span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              animate={{ width: showUpdatedLoc ? `${utilizationNew}%` : `${utilizationOld}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* APR comparison */}
        <div className="flex items-center gap-2 text-sm mt-4">
          <TrendingDown size={14} className="text-emerald-400" />
          <span className="text-emerald-400 font-medium">{TRADITIONAL_LENDING_FEES.aprSage}% APR</span>
          <span className="text-slate-500">&middot;</span>
          <span className="line-through text-red-400/60 text-xs">
            Bank: {TRADITIONAL_LENDING_FEES.aprBank}%
          </span>
        </div>
      </div>

      {/* Toggle */}
      <div className="glass-card p-5 sm:p-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between p-1 bg-black/40 rounded-full mb-6 border border-white/5">
          <button
            onClick={() => setIsSageMode(false)}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              !isSageMode
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Traditional Bank LOC
          </button>
          <button
            onClick={() => setIsSageMode(true)}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              isSageMode
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sage Capital
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
                <span className="text-slate-400">Repayment</span>
                <span className="text-emerald-400 font-medium">Auto {AUTO_REPAY_PERCENT}% sweep</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Late fees</span>
                <span className="text-emerald-400 font-medium">$0 (auto-pay)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">APR</span>
                <span className="text-emerald-400 font-medium">{TRADITIONAL_LENDING_FEES.aprSage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Annual fee</span>
                <span className="text-emerald-400 font-medium">$0</span>
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
                <span className="text-slate-400">Repayment</span>
                <span className="text-amber-400">Manual monthly</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Late fee risk</span>
                <span className="text-red-400">${TRADITIONAL_LENDING_FEES.lateFee}/occurrence</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">APR</span>
                <span className="text-red-400">{TRADITIONAL_LENDING_FEES.aprBank}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Annual fee</span>
                <span className="text-red-400">${TRADITIONAL_LENDING_FEES.annualFee}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <AnimatePresence mode="wait">
          {phase === 'done' ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Payment received &amp; LOC auto-repaid
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                {mintTxHash && (
                  <a
                    href={getTxUrl(mintTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Payment tx</span>
                    <ExternalLink size={10} />
                    <span className="font-mono text-indigo-400/60">
                      {mintTxHash.slice(0, 10)}...{mintTxHash.slice(-6)}
                    </span>
                  </a>
                )}
                {repayTxHash && (
                  <a
                    href={getTxUrl(repayTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Repayment tx</span>
                    <ExternalLink size={10} />
                    <span className="font-mono text-indigo-400/60">
                      {repayTxHash.slice(0, 10)}...{repayTxHash.slice(-6)}
                    </span>
                  </a>
                )}
              </div>
            </motion.div>
          ) : (
            <button
              key="action"
              onClick={handleAction}
              disabled={phase !== 'idle' || !walletAddress || !isSageMode}
              className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isSageMode ? 'btn-sage' : 'btn-traditional'
              }`}
            >
              {phase === 'minting' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Payment arriving...
                </>
              ) : phase === 'repaying' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Auto-repaying LOC...
                </>
              ) : (
                <>
                  <Landmark size={16} />
                  Simulate Incoming Payment (${paymentAmount.toLocaleString()})
                </>
              )}
            </button>
          )}
        </AnimatePresence>

        {actionError && (
          <div className="text-center mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
            <p className="text-xs text-red-400">{actionError}</p>
          </div>
        )}

        {!isSageMode && (
          <p className="text-xs text-slate-500 text-center mt-3">
            Traditional lending is shown for comparison only.
          </p>
        )}
      </div>

      {/* Post-action: Flow visualization + savings */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="glass-card p-5 sm:p-8 max-w-lg mx-auto"
          >
            {/* Flow visualization */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                <DollarSign size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Smart Contract Auto-Split
              </h3>
              <p className="text-sm text-slate-400">
                ${paymentAmount.toLocaleString()} from {NEW_CUSTOMER_ACCOUNT.name} was automatically allocated
              </p>
            </div>

            {/* Split visualization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/15 text-center">
                <Landmark size={16} className="text-indigo-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-indigo-300">${repayAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">LOC Repayment ({AUTO_REPAY_PERCENT}%)</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 text-center">
                <DollarSign size={16} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-emerald-400">${treasuryAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Treasury (earning yield)</p>
              </div>
            </div>

            {/* Interest savings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">Eliminated</span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">${TRADITIONAL_LENDING_FEES.lateFee}</span>{' '}
                  <span className="text-emerald-400">$0</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Late fee risk (auto-pay = never late)</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={14} className="text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Reduced</span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">{TRADITIONAL_LENDING_FEES.aprBank}%</span>{' '}
                  <span className="text-emerald-400">{TRADITIONAL_LENDING_FEES.aprSage}%</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Saves ${annualInterestDiffOnOutstanding.toLocaleString()}/yr on outstanding
                </p>
              </div>
            </div>

            <p className="text-xs text-center text-slate-500">
              Sage Capital&apos;s $300B lending book benefits from reduced risk &mdash;{' '}
              <span className="text-emerald-400 font-medium">auto-repayment = lower default rate = lower APR</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
