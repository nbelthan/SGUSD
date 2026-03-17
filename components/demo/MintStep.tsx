'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, ArrowDown, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-5 sm:p-8 md:p-10 relative overflow-hidden max-w-lg mx-auto"
      >
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo" />

        <div className="relative z-10">
          {/* Step header */}
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

          {/* Narrative */}
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            A consumer pays a <span className="text-white font-medium">${formattedAmount}</span> invoice
            on Sage&apos;s invoicing rails. Today, this payment would route off-network
            via ACH (2-3 days) or card (2.9% fee). With SGUSD, funds settle{' '}
            <span className="text-emerald-400 font-medium">instantly on-network</span> and
            begin earning <span className="text-emerald-400 font-medium">5% APY</span>.
          </p>

          {/* Payment visualization */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-xs text-slate-500 mb-1">Invoice Amount</p>
              <p className="text-2xl font-bold text-white">${formattedAmount}</p>
              <p className="text-xs text-slate-500 mt-1">SGUSD</p>
            </div>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown size={16} className="text-indigo-400" />
            </motion.div>
            <div className="w-full p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-center">
              <p className="text-xs text-slate-500 mb-1">Recipient</p>
              <p className="text-sm font-medium text-white">Acme Inc.</p>
              {walletAddress && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>
          </div>

          {/* Action button */}
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
                    Payment received — ${formattedAmount} SGUSD minted
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
              <motion.div key="action" className="space-y-3">
                <button
                  onClick={handleMint}
                  disabled={isLoading || !walletAddress}
                  className="btn-sage w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{txHash ? 'Confirming...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <span>Settle Invoice in SGUSD</span>
                  )}
                </button>

                {isError && (
                  <div className="text-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-red-400 mb-2">
                      {error?.message?.includes('User rejected') || error?.message?.includes('denied')
                        ? 'Transaction was rejected by user'
                        : error?.message?.includes('insufficient')
                        ? 'Insufficient funds for this transaction'
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ToastContainer />
    </>
  );
}
