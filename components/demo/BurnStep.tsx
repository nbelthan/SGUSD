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
  CreditCard,
  TrendingUp,
} from 'lucide-react';
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
  const [isCardMode, setIsCardMode] = useState(true);
  const [burnTxHash, setBurnTxHash] = useState<string | undefined>();
  const [isBurning, setIsBurning] = useState(false);
  const [burnError, setBurnError] = useState<string | undefined>();
  const completedRef = useRef(false);

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

  useEffect(() => {
    return () => {
      completedRef.current = false;
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
    <div className="space-y-6">
      {/* Step header */}
      <div className="glass-card p-5 sm:p-8 md:p-10 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <ArrowDownCircle size={20} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Spend or Off-Ramp
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Rivera has expenses in Mexico City. She can convert SGUSD to pesos through
          Sage&apos;s banking partners, or skip the off-ramp entirely and spend directly
          with her Sage Visa card. With the card, her balance earns yield until the
          second she swipes.
        </p>
      </div>

      {/* Rivera's current balance */}
      <div className="glass-card p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4de082]/10 border border-[#4de082]/20">
            <Globe size={20} className="text-[#4de082]" />
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
          <p className="text-xs font-medium text-slate-400 mb-2">
            SGUSD Balance
          </p>
          {receiverBalanceLoading ? (
            <div className="h-10 flex items-center">
              <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {receiverBal.integer}
              </span>
              <span className="text-sm sm:text-lg font-medium text-slate-400">.</span>
              <span className="text-sm sm:text-lg font-medium text-slate-400">
                {receiverBal.decimal}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toggle + pre-action content */}
      {!burnTxHash && (
        <div className="glass-card p-5 sm:p-8 max-w-lg mx-auto">
          {/* Toggle */}
          <div className="flex items-center justify-between p-1 bg-black/40 rounded-full mb-6 border border-white/5">
            <button
              onClick={() => setIsCardMode(false)}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                !isCardMode
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Off-Ramp to Bank
            </button>
            <button
              onClick={() => setIsCardMode(true)}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isCardMode
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Spend with Sage Card
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isCardMode ? (
              <motion.div
                key="card-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Sage Visa Card visual */}
                <div className="relative mx-auto mb-6 max-w-sm rounded-2xl bg-gradient-to-br from-emerald-500/20 via-neutral-900 to-neutral-900 p-[1px]">
                  <div className="rounded-2xl bg-neutral-900/95 backdrop-blur-xl p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-bold text-white tracking-wider">Sage</span>
                      <span className="text-lg font-bold italic text-white/80">VISA</span>
                    </div>
                    <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-amber-300/40 to-amber-500/20 border border-amber-400/20 mb-5" />
                    <p className="text-base sm:text-lg font-mono text-white/60 tracking-[0.2em] mb-6">
                      &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4821
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Cardholder</p>
                        <p className="text-xs sm:text-sm font-medium text-white/80">Rivera Design Co.</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                        SGUSD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spending context */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Globe size={14} className="text-emerald-400 shrink-0" />
                    <span>Spend at 100M+ merchants worldwide</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-300">
                    <TrendingUp size={14} className="text-emerald-400 shrink-0" />
                    <span>Conversion at point of sale &mdash; earn yield until you swipe</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-emerald-400 font-medium">
                    <DollarSign size={14} className="shrink-0" />
                    <span>$0 FX fees &middot; $0 conversion fees</span>
                  </div>
                </div>

                {/* Error display */}
                {burnError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {burnError}
                  </div>
                )}

                {/* Simulate Card Spend button */}
                <button
                  onClick={handleBurn}
                  disabled={isBurning}
                  className="w-full py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBurning ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Simulate Card Spend
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="offramp-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h4 className="text-sm font-semibold text-white mb-4">Conversion Preview</h4>

                {/* Conversion details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[#4de082]" />
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
                <button
                  onClick={handleBurn}
                  disabled={isBurning}
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
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Post-action confirmation */}
      <AnimatePresence>
        {burnTxHash && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="glass-card p-5 sm:p-8"
          >
            {/* Headline */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                {isCardMode ? (
                  <CreditCard size={28} className="text-emerald-400" />
                ) : (
                  <CheckCircle2 size={28} className="text-emerald-400" />
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {isCardMode ? 'Spent with Sage Card' : 'Off-Ramp Complete'}
              </h3>
              <p className="text-sm text-slate-400">
                {isCardMode ? (
                  <>${burnAmount.toLocaleString()} SGUSD spent at Visa merchants</>
                ) : (
                  <>
                    ${burnAmount.toLocaleString()} SGUSD burned &rarr; MXN $
                    {mxnAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} deposited to local bank
                  </>
                )}
              </p>
            </div>

            {/* Fee comparison: Traditional vs Sage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Traditional remittance fee */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    Eliminated
                  </span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">${traditionalFee}</span>{' '}
                  <span className="text-emerald-400">$0</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Remittance fee</p>
              </div>

              {/* FX spread */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">
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
              </div>
            </div>

            {/* Total saved */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 mb-4">
              <DollarSign size={16} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">
                {isCardMode
                  ? `Spending savings: $${totalTraditionalCost.toLocaleString()}`
                  : `Off-ramp savings: $${totalTraditionalCost.toLocaleString()}`}
              </span>
            </div>

            {isCardMode && (
              <p className="text-sm text-emerald-400/80 text-center mb-4">
                Your balance earned yield right up until you spent. No off-ramp needed.
              </p>
            )}

            {/* BaseScan link */}
            <div className="text-center">
              <a
                href={getTxUrl(burnTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#4de082] hover:text-[#4de082] transition-colors"
              >
                <ExternalLink size={12} />
                <span>{isCardMode ? 'Verify on BaseScan' : 'Verify burn on BaseScan'}</span>
                <span className="font-mono text-[#4de082]/60">
                  {burnTxHash.slice(0, 10)}...{burnTxHash.slice(-6)}
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
