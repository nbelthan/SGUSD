'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { useMint } from '@/lib/hooks/useMint';
import { useTreasuryAddress } from '@/lib/hooks/useTreasuryAddress';
import { useTransactionToast } from '@/components/ui/TransactionToast';
import { useConfetti } from '@/components/ui/Confetti';
import { getTxUrl } from '@/lib/basescan';

const PRESET_AMOUNTS = ['1000', '5000', '10000', '50000'];

export default function FundButton() {
  const [amount, setAmount] = useState('10000');
  const [showInput, setShowInput] = useState(false);
  const treasuryAddress = useTreasuryAddress();
  const { mint, txHash, isLoading, isConfirmed, isError, error, reset } = useMint();
  const { showToast, ToastContainer } = useTransactionToast();
  const { fireConfetti } = useConfetti();
  const toastedRef = useRef<Set<string>>(new Set());

  const handleMint = () => {
    if (!treasuryAddress) return;
    mint(treasuryAddress, amount);
  };

  useEffect(() => {
    if (isConfirmed && txHash && !toastedRef.current.has(txHash)) {
      toastedRef.current.add(txHash);
      showToast({
        type: 'mint',
        amount: Number(amount).toLocaleString(),
        txHash,
      });
      fireConfetti();
      // Reset after a short delay so user can mint again
      setTimeout(() => {
        reset();
        setShowInput(false);
      }, 2000);
    }
  }, [isConfirmed, txHash, showToast, amount, reset]);

  return (
    <>
      <div className="glass-card p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-500 rounded-full blur-3xl pointer-events-none glow-pulse-emerald" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Fund Treasury</h3>
            </div>
            <span className="text-xs text-slate-500">Mint SGUSD to Acme Inc.</span>
          </div>

          <AnimatePresence mode="wait">
            {isConfirmed && txHash ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">
                    {Number(amount).toLocaleString()} SGUSD minted
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
            ) : showInput ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Preset amounts */}
                <div className="flex gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        amount === preset
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {Number(preset).toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom amount input */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={1}
                    className="flex-1 glass-input py-2 px-3 text-sm"
                    placeholder="Custom amount"
                  />
                  <button
                    onClick={handleMint}
                    disabled={isLoading || !treasuryAddress || Number(amount) <= 0}
                    className="btn-sage px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        {txHash ? 'Confirming...' : 'Minting...'}
                      </>
                    ) : (
                      'Mint'
                    )}
                  </button>
                </div>

                {isError && (
                  <p className="text-xs text-red-400 text-center">
                    {error?.message || 'Mint failed — try again'}
                    <button onClick={reset} className="ml-2 text-indigo-400 hover:text-indigo-300">
                      Retry
                    </button>
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                  onClick={() => setShowInput(true)}
                  className="w-full btn-sage py-3 text-sm flex items-center justify-center gap-2"
                >
                  <Coins size={16} />
                  Fund Treasury (Mint SGUSD)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}
