'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownCircle,
  CheckCircle2,
  ExternalLink,
  XCircle,
  DollarSign,
  Globe,
  Banknote,
  Loader2,
} from 'lucide-react';
import { useConfetti } from '@/components/ui/Confetti';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import { getTxUrl } from '@/lib/basescan';
import {
  GLOBAL_LOGISTICS_ACCOUNT,
  DEFAULT_BURN_AMOUNT,
  OFFRAMP_FEES,
  MXN_RATE,
} from '@/lib/demo/accounts';

interface BurnStepProps {
  onBurnComplete?: (txHash: string) => void;
}

export default function BurnStep({ onBurnComplete }: BurnStepProps) {
  const [burnTxHash, setBurnTxHash] = useState<string | undefined>();
  const [isBurning, setIsBurning] = useState(false);
  const [burnError, setBurnError] = useState<string | undefined>();
  const completedRef = useRef(false);
  const confettiFiredRef = useRef(false);
  const { fireConfetti } = useConfetti();

  const receiverAddress = GLOBAL_LOGISTICS_ACCOUNT.address as `0x${string}`;
  const burnAmount = Number(DEFAULT_BURN_AMOUNT);
  const mxnAmount = burnAmount * MXN_RATE;

  // Traditional off-ramp costs
  const traditionalFee = OFFRAMP_FEES.remittanceFee;
  const fxSpreadCost = burnAmount * (OFFRAMP_FEES.fxSpreadPercent / 100);
  const totalTraditionalCost = traditionalFee + fxSpreadCost;

  const {
    displayBalance: receiverDisplayBalance,
    isLoading: receiverBalanceLoading,
  } = useTickingBalance(receiverAddress);

  const handleBurn = useCallback(async () => {
    setIsBurning(true);
    setBurnError(undefined);
    try {
      const res = await fetch('/api/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: receiverAddress,
          amount: DEFAULT_BURN_AMOUNT,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Burn failed');
      }

      setBurnTxHash(data.hash);
      if (!completedRef.current) {
        completedRef.current = true;
        onBurnComplete?.(data.hash);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Burn failed';
      setBurnError(message);
    } finally {
      setIsBurning(false);
    }
  }, [receiverAddress, onBurnComplete]);

  // Fire confetti on successful burn
  useEffect(() => {
    if (burnTxHash && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      const timer = setTimeout(() => {
        fireConfetti();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [burnTxHash, fireConfetti]);

  useEffect(() => {
    return () => {
      completedRef.current = false;
      confettiFiredRef.current = false;
    };
  }, []);

  const formatBalance = (bal: string | undefined) => {
    if (!bal) return { integer: '0', decimal: '00000000' };
    const [integer, decimal = '00000000'] = bal.split('.');
    const formattedInteger = parseInt(integer, 10).toLocaleString();
    return { integer: formattedInteger, decimal };
  };

  const receiverBal = formatBalance(receiverDisplayBalance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Step header */}
      <div className="glass-card p-5 sm:p-8 md:p-10 relative overflow-hidden max-w-lg mx-auto">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500 rounded-full blur-3xl pointer-events-none glow-pulse-amber" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ArrowDownCircle size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                Step 3
              </p>
              <h3 className="text-lg font-semibold text-white">
                Off-Ramp to Local Currency
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            <span className="text-white font-medium">Rivera Design Co.</span> converts $
            {burnAmount.toLocaleString()} SGUSD to Mexican Pesos via a local banking partner.
            The burned tokens leave the network, maintaining{' '}
            <span className="text-amber-400 font-medium">1:1 reserve backing</span>.
          </p>
        </div>
      </div>

      {/* Rivera's current balance */}
      <div className="glass-card p-5 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Globe size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {GLOBAL_LOGISTICS_ACCOUNT.name}
              </h3>
              <p className="text-xs text-slate-400">
                {GLOBAL_LOGISTICS_ACCOUNT.role}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              SGUSD Balance
            </p>
            {receiverBalanceLoading ? (
              <div className="h-10 flex items-center">
                <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
              </div>
            ) : (
              <div className="flex items-baseline gap-0.5">
                <span className="text-slate-400 text-xl sm:text-2xl font-light">$</span>
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {receiverBal.integer}
                </span>
                <span className="text-sm sm:text-lg font-medium text-slate-400">.</span>
                <span
                  className="text-sm sm:text-lg font-medium text-slate-400"
                  style={{ textShadow: '0 0 8px rgba(129,140,248,0.3)' }}
                >
                  {receiverBal.decimal}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversion preview + burn button */}
      {!burnTxHash && (
        <div className="glass-card p-5 sm:p-8 relative overflow-hidden max-w-lg mx-auto">
          <div className="relative z-10">
            <h4 className="text-sm font-semibold text-white mb-4">Conversion Preview</h4>

            {/* Conversion details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-indigo-400" />
                  <span className="text-sm text-slate-300">SGUSD to convert</span>
                </div>
                <span className="text-sm font-bold text-white">
                  ${burnAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-center">
                <ArrowDownCircle size={20} className="text-amber-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/15">
                <div className="flex items-center gap-2">
                  <Banknote size={16} className="text-amber-400" />
                  <span className="text-sm text-slate-300">Mexican Pesos (MXN)</span>
                </div>
                <span className="text-sm font-bold text-amber-400">
                  MXN ${mxnAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Rate: 1 USD = {MXN_RATE} MXN (mid-market rate, simulated)
              </p>
            </div>

            {/* Error display */}
            {burnError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {burnError}
              </div>
            )}

            {/* Burn button */}
            <motion.button
              onClick={handleBurn}
              disabled={isBurning}
              whileHover={isBurning ? {} : { scale: 1.02 }}
              whileTap={isBurning ? {} : { scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isBurning ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ArrowDownCircle size={16} />
                  Convert to Local Currency
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* Post-burn confirmation */}
      <AnimatePresence>
        {burnTxHash && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="glass-card p-5 sm:p-8 relative overflow-hidden"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-emerald-500 rounded-full blur-3xl pointer-events-none glow-pulse-emerald" />
            <div className="absolute inset-0 bg-emerald-500/[0.03] pointer-events-none" />

            <div className="relative z-10">
              {/* Headline */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4"
                >
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Off-Ramp Complete
                </h3>
                <p className="text-sm text-slate-400">
                  ${burnAmount.toLocaleString()} SGUSD burned &rarr; MXN $
                  {mxnAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} deposited to local bank
                </p>
              </div>

              {/* Fee comparison: Traditional vs Sage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {/* Traditional remittance fee */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={14} className="text-red-400" />
                    <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                      Eliminated
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    <span className="line-through text-red-400/60">${traditionalFee}</span>{' '}
                    <span className="text-emerald-400">$0</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Remittance fee</p>
                </motion.div>

                {/* FX spread */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={14} className="text-red-400" />
                    <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                      Eliminated
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    <span className="line-through text-red-400/60">${fxSpreadCost.toLocaleString()}</span>{' '}
                    <span className="text-emerald-400">$0</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    FX spread ({OFFRAMP_FEES.fxSpreadPercent}% on ${burnAmount.toLocaleString()})
                  </p>
                </motion.div>
              </div>

              {/* Total saved */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="flex items-center justify-center gap-3 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 mb-4"
              >
                <DollarSign size={16} className="text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  Off-ramp savings: ${totalTraditionalCost.toLocaleString()}
                </span>
              </motion.div>

              {/* BaseScan link */}
              <div className="text-center">
                <a
                  href={getTxUrl(burnTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>Verify burn on BaseScan</span>
                  <span className="font-mono text-indigo-400/60">
                    {burnTxHash.slice(0, 10)}...{burnTxHash.slice(-6)}
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
