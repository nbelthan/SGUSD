'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Landmark,
  ArrowRight,
  User,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMint } from '@/lib/hooks/useMint';
import { useTransactionToast } from '@/components/ui/TransactionToast';
import { useConfetti } from '@/components/ui/Confetti';
import { getTxUrl } from '@/lib/basescan';
import {
  DEFAULT_TAX_REFUND_AMOUNT,
  TAX_REFUND_YIELDS,
  IRS_ACCOUNT,
  CONSUMER_ACCOUNT,
} from '@/lib/demo/accounts';

interface TaxRefundStepProps {
  onComplete?: (txHash: `0x${string}`) => void;
}

export default function TaxRefundStep({ onComplete }: TaxRefundStepProps) {
  const { walletAddress } = useAuth();
  const { mint, txHash, isLoading, isConfirmed, isError, error, reset } = useMint();
  const { showToast, ToastContainer } = useTransactionToast();
  const { fireConfetti } = useConfetti();
  const toastedRef = useRef<Set<string>>(new Set());
  const [isSageMode, setIsSageMode] = useState(true);

  const refundAmount = Number(DEFAULT_TAX_REFUND_AMOUNT);
  const bankYieldAnnual = refundAmount * (TAX_REFUND_YIELDS.bankCheckingApy / 100);
  const sgusdYieldAnnual = refundAmount * (TAX_REFUND_YIELDS.sgusdApy / 100);
  const yieldDifference = sgusdYieldAnnual - bankYieldAnnual;

  const handleMint = () => {
    if (!walletAddress) return;
    mint(walletAddress, DEFAULT_TAX_REFUND_AMOUNT);
  };

  useEffect(() => {
    if (isConfirmed && txHash && !toastedRef.current.has(txHash)) {
      toastedRef.current.add(txHash);
      showToast({
        type: 'mint',
        amount: refundAmount.toLocaleString(),
        txHash,
      });
      fireConfetti();
      onComplete?.(txHash as `0x${string}`);
    }
  }, [isConfirmed, txHash, showToast, onComplete]);

  const formattedAmount = refundAmount.toLocaleString();

  return (
    <>
      <div className="space-y-6">
        {/* Step header card */}
        <div className="glass-card p-5 sm:p-8 md:p-10 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4de082]/10 border border-[#4de082]/20">
              <Receipt size={20} className="text-[#4de082]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Tax Refund Deposit
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            <span className="text-white font-medium">{CONSUMER_ACCOUNT.name}</span> files
            her taxes through Sage. Her{' '}
            <span className="text-white font-medium">${formattedAmount}</span> federal
            refund arrives as SGUSD &mdash; instantly, zero fees, earning{' '}
            <span className="text-emerald-400 font-medium">3.20% APY</span> from the
            first second.
          </p>
        </div>

        {/* Deposit toggle card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md glass-card p-5 sm:p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
                Federal Tax Refund
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Landmark size={16} />
                <span>{IRS_ACCOUNT.name}</span>
                <ArrowRight size={14} />
                <User size={16} />
                <span className="text-white font-medium">{CONSUMER_ACCOUNT.name}</span>
              </div>
            </div>

            {/* Amount display */}
            <div className="mb-8">
              <label className="text-xs font-medium text-slate-400">
                Refund Amount
              </label>
              <div className="mt-2 p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">USD</span>
                  <span className="text-2xl sm:text-3xl font-light text-white">
                    {formattedAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* The Toggle */}
            <div className="flex items-center justify-between p-1 bg-black/40 rounded-full mb-8 border border-white/5">
              <button
                onClick={() => setIsSageMode(false)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  !isSageMode
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Direct Deposit to Bank
              </button>
              <button
                onClick={() => setIsSageMode(true)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isSageMode
                    ? 'bg-[#4de082]/20 text-[#4de082] border border-[#4de082]/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Deposit as SGUSD
              </button>
            </div>

            {/* Breakdown */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Refund Amount</span>
                <span>${formattedAmount}.00</span>
              </div>

              <AnimatePresence mode="popLayout">
                {!isSageMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between text-sm text-amber-400">
                      <span>Annual Yield (Checking @ {TAX_REFUND_YIELDS.bankCheckingApy}%)</span>
                      <span>${bankYieldAnnual.toFixed(2)}/yr</span>
                    </div>
                    <div className="text-xs text-slate-500 -mt-2">
                      Most refunds sit in checking earning nearly nothing
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isSageMode && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Annual Yield ({TAX_REFUND_YIELDS.sgusdApy}% APY)</span>
                  <span>${sgusdYieldAnnual.toFixed(2)}/yr</span>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-sm text-slate-400">
                  {isSageMode ? 'Yield Advantage' : 'IRS Processing Time'}
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-medium ${
                    isSageMode ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isSageMode ? (
                    <>
                      +${yieldDifference.toFixed(0)}{' '}
                      <span className="text-base text-slate-400">/year</span>
                    </>
                  ) : (
                    <>
                      {TAX_REFUND_YIELDS.irsProcessingDays}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* ETA */}
            <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <Clock
                  size={16}
                  className={isSageMode ? 'text-[#4de082]' : 'text-amber-400'}
                />
                <span className="text-sm font-medium">Deposit Speed:</span>
              </div>
              <span
                className={`text-sm ${
                  isSageMode
                    ? 'text-[#4de082] font-semibold'
                    : 'text-slate-300'
                }`}
              >
                {isSageMode ? 'Instant on-network' : TAX_REFUND_YIELDS.irsProcessingDays}
              </span>
            </div>

            {/* Action Button */}
            <AnimatePresence mode="wait">
              {isConfirmed && txHash ? (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                      ${formattedAmount} SGUSD deposited instantly
                    </span>
                  </div>
                  <a
                    href={getTxUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs text-[#4de082] hover:text-[#4de082] transition-colors"
                  >
                    <span>View on BaseScan</span>
                    <ExternalLink size={10} />
                  </a>
                </motion.div>
              ) : (
                <div key="action" className="group">
                  <button
                    onClick={handleMint}
                    disabled={isLoading || !walletAddress || !isSageMode}
                    className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSageMode ? 'btn-sage' : 'btn-traditional'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {isSageMode && <ShieldCheck size={18} />}
                        {isSageMode ? 'Deposit Refund as SGUSD' : 'Direct Deposit to Bank'}
                      </>
                    )}
                  </button>
                  {!isSageMode && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-xs text-slate-500 whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                        Demo only — switch to SGUSD mode
                      </span>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>

            {!isSageMode && (
              <p className="text-xs text-slate-500 text-center mt-3">
                Traditional deposit is shown for comparison only.
              </p>
            )}

            {isError && (
              <div className="text-center mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <p className="text-xs text-red-400 mb-2">
                  {error?.message?.includes('User rejected') || error?.message?.includes('denied')
                    ? 'Transaction was rejected'
                    : 'Transaction failed — please try again'}
                </p>
                <button
                  onClick={reset}
                  className="text-xs text-[#4de082] hover:text-[#4de082] transition-colors font-medium"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Savings card — shown after confirmation */}
        <AnimatePresence>
          {isConfirmed && txHash && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              className="glass-card p-5 sm:p-8 max-w-lg mx-auto"
            >
              <div className="text-center mb-5">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                  <TrendingUp size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Your refund earns{' '}
                  <span className="text-emerald-400">${yieldDifference.toFixed(0)} more</span>{' '}
                  per year
                </h3>
                <p className="text-sm text-slate-400">
                  SGUSD puts your tax refund to work from the first second
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={14} className="text-red-400" />
                    <span className="text-xs font-medium text-red-400">
                      Bank Checking
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    ${bankYieldAnnual.toFixed(2)}<span className="text-sm text-slate-500">/yr</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{TAX_REFUND_YIELDS.bankCheckingApy}% APY</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">
                      SGUSD
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    ${sgusdYieldAnnual.toFixed(2)}<span className="text-sm text-slate-500">/yr</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{TAX_REFUND_YIELDS.sgusdApy}% APY</p>
                </div>
              </div>

              <p className="text-xs text-center text-slate-500">
                At 17M Sage tax filers &times; $3,100 avg refund ={' '}
                <span className="text-emerald-400 font-medium">$52.7B in refund capital</span>{' '}
                earning yield on the Sage network
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer />
    </>
  );
}
