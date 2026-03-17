'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  Loader2,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Building2,
  User,
  Clock,
  ShieldCheck,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMint } from '@/lib/hooks/useMint';
import { useTransactionToast } from '@/components/ui/TransactionToast';
import { useConfetti } from '@/components/ui/Confetti';
import { getTxUrl } from '@/lib/basescan';
import {
  DEFAULT_MINT_AMOUNT,
  DOMESTIC_FEES,
  CONSUMER_ACCOUNT,
} from '@/lib/demo/accounts';

interface MintStepProps {
  onMintComplete?: (txHash: `0x${string}`) => void;
}

export default function MintStep({ onMintComplete }: MintStepProps) {
  const { walletAddress } = useAuth();
  const { mint, txHash, isLoading, isConfirmed, isError, error, reset } = useMint();
  const { showToast, ToastContainer } = useTransactionToast();
  const { fireConfetti } = useConfetti();
  const toastedRef = useRef<Set<string>>(new Set());
  const [isSageMode, setIsSageMode] = useState(true);

  const invoiceAmount = Number(DEFAULT_MINT_AMOUNT);
  const cardFee = invoiceAmount * (DOMESTIC_FEES.cardProcessingPercent / 100) + DOMESTIC_FEES.cardFixedFee;
  const totalCost = isSageMode ? invoiceAmount : invoiceAmount + cardFee;

  const handleMint = () => {
    if (!walletAddress) return;
    mint(walletAddress, DEFAULT_MINT_AMOUNT);
  };

  useEffect(() => {
    if (isConfirmed && txHash && !toastedRef.current.has(txHash)) {
      toastedRef.current.add(txHash);
      showToast({
        type: 'mint',
        amount: Number(DEFAULT_MINT_AMOUNT).toLocaleString(),
        txHash,
      });
      fireConfetti();
      onMintComplete?.(txHash as `0x${string}`);
    }
  }, [isConfirmed, txHash, showToast, onMintComplete, fireConfetti]);

  const formattedAmount = Number(DEFAULT_MINT_AMOUNT).toLocaleString();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Step header card */}
        <div className="glass-card p-5 sm:p-8 md:p-10 relative overflow-hidden max-w-lg mx-auto">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Banknote size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                  Step 1
                </p>
                <h3 className="text-lg font-semibold text-white">
                  Invoice Payment
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              <span className="text-white font-medium">{CONSUMER_ACCOUNT.name}</span>, a Sage
              consumer, pays a <span className="text-white font-medium">${formattedAmount}</span> invoice
              to Acme Inc. Today this domestic payment costs the SMB{' '}
              <span className="text-red-400 font-medium">2.9% in card fees</span> or takes{' '}
              <span className="text-amber-400 font-medium">2-3 days via ACH</span>.
              With SGUSD &mdash; instant, zero fees, on-network.
            </p>
          </div>
        </div>

        {/* Payment toggle card — mirrors PayoutToggle design */}
        <div className="flex justify-center">
          <div className="w-full max-w-md glass-card p-5 sm:p-8 relative overflow-hidden">
            <AnimatePresence>
              {isSageMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo"
                />
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="relative z-10 mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
                Domestic Invoice Payment
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <User size={16} />
                <span>{CONSUMER_ACCOUNT.name}</span>
                <ArrowRight size={14} />
                <Building2 size={16} />
                <span className="text-white font-medium">Acme Inc.</span>
              </div>
            </div>

            {/* Amount display */}
            <div className="relative z-10 mb-8">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Invoice Amount
              </label>
              <div className="mt-2 p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">SGUSD</span>
                  <span className="text-2xl sm:text-3xl font-light text-white">
                    {formattedAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* The Toggle */}
            <div className="relative z-10 flex items-center justify-between p-1 bg-black/40 rounded-full mb-8 border border-white/5">
              <button
                onClick={() => setIsSageMode(false)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  !isSageMode
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Credit Card / ACH
              </button>
              <button
                onClick={() => setIsSageMode(true)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isSageMode
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                SageBridge (SGUSD)
              </button>
            </div>

            {/* Breakdown */}
            <div className="relative z-10 space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Invoice Principal</span>
                <span>{formattedAmount}.00 SGUSD</span>
              </div>

              <AnimatePresence mode="popLayout">
                {!isSageMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between text-sm text-red-400">
                      <span>Card Processing ({DOMESTIC_FEES.cardProcessingPercent}% + $0.30)</span>
                      <span>+ ${cardFee.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-slate-500 -mt-2">
                      Paid by Acme Inc. to receive this payment
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isSageMode && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Fees</span>
                  <span>0.00 SGUSD</span>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-sm text-slate-400">
                  {isSageMode ? 'Acme Inc. Receives' : 'Cost to Acme Inc.'}
                </span>
                <motion.span
                  key={String(totalCost)}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className={`text-2xl sm:text-3xl font-medium ${
                    isSageMode ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isSageMode ? (
                    <>
                      ${formattedAmount}.00{' '}
                      <span className="text-base text-slate-400">SGUSD</span>
                    </>
                  ) : (
                    <>
                      -${cardFee.toFixed(2)}{' '}
                      <span className="text-base text-slate-400">in fees</span>
                    </>
                  )}
                </motion.span>
              </div>
            </div>

            {/* ETA */}
            <div className="relative z-10 flex items-center justify-between mb-6 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <Clock
                  size={16}
                  className={isSageMode ? 'text-indigo-400' : 'text-amber-400'}
                />
                <span className="text-sm font-medium">Settlement:</span>
              </div>
              <span
                className={`text-sm ${
                  isSageMode
                    ? 'text-indigo-300 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                {isSageMode ? '< 2 Seconds' : DOMESTIC_FEES.achDays}
              </span>
            </div>

            {/* Action Button */}
            <AnimatePresence mode="wait">
              {isConfirmed && txHash ? (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 space-y-3"
                >
                  <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                      ${formattedAmount} SGUSD settled instantly
                    </span>
                  </div>
                  <a
                    href={getTxUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>View on BaseScan</span>
                    <ExternalLink size={10} />
                  </a>
                </motion.div>
              ) : (
                <motion.div key="action" className="relative z-10 group">
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
                        {isSageMode ? 'Settle Invoice in SGUSD' : 'Pay via Credit Card'}
                      </>
                    )}
                  </button>
                  {!isSageMode && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-xs text-slate-500 whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                        Demo only — switch to SageBridge mode
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!isSageMode && (
              <p className="relative z-10 text-xs text-slate-500 text-center mt-3">
                Traditional payments are shown for comparison only.
              </p>
            )}

            {isError && (
              <div className="relative z-10 text-center mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <p className="text-xs text-red-400 mb-2">
                  {error?.message?.includes('User rejected') || error?.message?.includes('denied')
                    ? 'Transaction was rejected'
                    : 'Transaction failed — please try again'}
                </p>
                <button
                  onClick={reset}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* "You Saved" card — shown after confirmation */}
        <AnimatePresence>
          {isConfirmed && txHash && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              className="glass-card p-5 sm:p-8 relative overflow-hidden max-w-lg mx-auto"
            >
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-emerald-500 rounded-full blur-3xl pointer-events-none glow-pulse-emerald" />
              <div className="absolute inset-0 bg-emerald-500/[0.03] pointer-events-none" />

              <div className="relative z-10">
                <div className="text-center mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                    className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4"
                  >
                    <DollarSign size={28} className="text-emerald-400" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Acme Inc. saved{' '}
                    <span className="text-emerald-400">${cardFee.toFixed(2)}</span>{' '}
                    on this invoice!
                  </h3>
                  <p className="text-sm text-slate-400">
                    Payment stayed on Sage&apos;s network &mdash; no card processor needed
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={14} className="text-red-400" />
                      <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                        Eliminated
                      </span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      <span className="line-through text-red-400/60">${cardFee.toFixed(2)}</span>{' '}
                      <span className="text-emerald-400">$0</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Card processing fee (2.9%)</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.4 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={14} className="text-indigo-400" />
                      <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                        Instant
                      </span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      <span className="line-through text-red-400/60">2-3 days</span>{' '}
                      <span className="text-emerald-400">&lt;2 sec</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Settlement time</p>
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-xs text-center text-slate-500"
                >
                  At $1T in annual invoices, eliminating card fees saves Sage SMBs{' '}
                  <span className="text-emerald-400 font-medium">$29B/year</span>
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ToastContainer />
    </>
  );
}
