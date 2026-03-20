'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Building2,
  Clock,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMint } from '@/lib/hooks/useMint';
import { useTransactionToast } from '@/components/ui/TransactionToast';
import { useConfetti } from '@/components/ui/Confetti';
import { getTxUrl } from '@/lib/basescan';
import { DEFAULT_MINT_AMOUNT } from '@/lib/demo/accounts';

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

  const fundAmount = Number(DEFAULT_MINT_AMOUNT);
  const dailyYield = fundAmount * (3.2 / 100) / 365;

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
  }, [isConfirmed, txHash, showToast, onMintComplete]);

  const formattedAmount = Number(DEFAULT_MINT_AMOUNT).toLocaleString();

  return (
    <>
      <div className="space-y-6">
        {/* Step header card */}
        <div className="glass-card p-5 sm:p-8 md:p-10 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4de082]/10 border border-[#4de082]/20">
              <Banknote size={20} className="text-[#4de082]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Fund Treasury
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            Acme Inc. transfers <span className="text-white font-medium">${formattedAmount}</span> in
            operating capital from their bank to their Sage treasury. With traditional ACH this takes{' '}
            <span className="text-amber-400 font-medium">2-3 business days</span> while funds sit idle.
            With SGUSD &mdash; instant settlement, earning{' '}
            <span className="text-emerald-400 font-medium">3.20% APY</span> from second one.
          </p>
        </div>

        {/* Funding toggle card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md glass-card p-5 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
                Fund Sage Treasury
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Building2 size={16} />
                <span>Chase Business &#8226;&#8226;&#8226;&#8226;4829</span>
                <ArrowRight size={14} />
                <Building2 size={16} className="text-[#4de082]" />
                <span className="text-white font-medium">Acme Inc.</span>
              </div>
            </div>

            {/* Simulated linked bank */}
            <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Building2 size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Chase Business Checking</p>
                <p className="text-xs text-slate-500">&#8226;&#8226;&#8226;&#8226;4829</p>
              </div>
              <span className="text-[10px] font-medium text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                Linked via Plaid
              </span>
            </div>

            {/* Amount display */}
            <div className="mb-8">
              <label className="text-xs font-medium text-slate-400">
                Transfer Amount
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
                Traditional ACH
              </button>
              <button
                onClick={() => setIsSageMode(true)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isSageMode
                    ? 'bg-[#4de082]/20 text-[#4de082] border border-[#4de082]/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Fund as SGUSD
              </button>
            </div>

            {/* Breakdown */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Transfer Amount</span>
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
                      <span>ACH Processing</span>
                      <span>2-3 business days</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-400">
                      <span>Yield while in transit</span>
                      <span>$0.00</span>
                    </div>
                    <div className="text-xs text-slate-500 -mt-2">
                      Funds sit idle earning nothing during ACH settlement
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isSageMode && (
                <>
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Fees</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Yield (3.20% APY)</span>
                    <span>${dailyYield.toFixed(2)}/day</span>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-sm text-slate-400">
                  {isSageMode ? 'Treasury Receives' : 'Available After'}
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-medium ${
                    isSageMode ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isSageMode ? (
                    <>
                      ${formattedAmount}.00{' '}
                      <span className="text-base text-slate-400">SGUSD</span>
                    </>
                  ) : (
                    <>
                      2-3{' '}
                      <span className="text-base text-slate-400">business days</span>
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
                <span className="text-sm font-medium">Settlement:</span>
              </div>
              <span
                className={`text-sm ${
                  isSageMode
                    ? 'text-[#4de082] font-semibold'
                    : 'text-slate-300'
                }`}
              >
                {isSageMode ? 'Instant on-network' : '2-3 business days'}
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
                      ${formattedAmount} SGUSD funded instantly
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
                        {isSageMode ? 'Fund Treasury' : 'Initiate ACH Transfer'}
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
                Traditional ACH is shown for comparison only.
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
                  Treasury funded and earning
                </h3>
                <p className="text-sm text-slate-400">
                  Capital works from the moment it arrives &mdash; no 2-3 day ACH wait
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={14} className="text-red-400" />
                    <span className="text-xs font-medium text-red-400">
                      Eliminated
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    <span className="line-through text-red-400/60">2-3 days</span>{' '}
                    <span className="text-emerald-400">&lt;2 sec</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">ACH settlement wait</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">
                      Earning Now
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    ${dailyYield.toFixed(2)}<span className="text-sm text-slate-500">/day</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">3.20% APY from second one</p>
                </div>
              </div>

              <p className="text-xs text-center text-slate-500">
                7M Sage SMBs &times; $10K avg treasury funding ={' '}
                <span className="text-emerald-400 font-medium">$70B in operating capital</span>{' '}
                earning yield from day one
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer />
    </>
  );
}
