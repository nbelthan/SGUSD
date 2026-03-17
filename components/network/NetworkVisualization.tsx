'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, CheckCircle2, ExternalLink } from 'lucide-react';
import { getTxUrl } from '@/lib/basescan';

interface NetworkVisualizationProps {
  /** When set, triggers the payment animation and shows confirmation */
  txHash?: string;
  /** Sender display name */
  senderName?: string;
  /** Receiver display name */
  receiverName?: string;
  /** Transfer amount for confirmation display */
  amount?: number;
}

type AnimationPhase = 'idle' | 'sending' | 'confirmed';

export default function NetworkVisualization({
  txHash,
  senderName = 'Acme Inc.',
  receiverName = 'Global Logistics',
  amount,
}: NetworkVisualizationProps) {
  const [phase, setPhase] = useState<AnimationPhase>('idle');

  useEffect(() => {
    if (!txHash) {
      setPhase('idle');
      return;
    }

    setPhase('sending');
    const timer = setTimeout(() => setPhase('confirmed'), 1800);
    return () => clearTimeout(timer);
  }, [txHash]);

  return (
    <div className="glass-card p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle background glow when confirmed */}
      <AnimatePresence>
        {phase === 'confirmed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">
        Sage Trust Network
      </h3>

      {/* Network nodes and path */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Sender node */}
        <motion.div
          className="flex flex-col items-center gap-2 flex-shrink-0"
          animate={{
            scale: phase === 'sending' ? [1, 0.95, 1] : 1,
          }}
          transition={{ duration: 0.6 }}
        >
          <div
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-colors duration-500 ${
              phase === 'confirmed'
                ? 'bg-emerald-500/20 border-emerald-500/30'
                : 'bg-indigo-500/20 border-indigo-500/30'
            }`}
          >
            <Building2
              size={20}
              className={
                phase === 'confirmed' ? 'text-emerald-400' : 'text-indigo-400'
              }
            />
          </div>
          <span className="text-[10px] sm:text-xs text-slate-300 font-medium text-center max-w-[64px] sm:max-w-[80px] truncate">
            {senderName}
          </span>
          <span className="text-[10px] text-slate-500">Sender</span>
        </motion.div>

        {/* Connection path */}
        <div className="flex-1 relative h-12 flex items-center">
          {/* Static line */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 rounded-full" />

          {/* Idle pulsing placeholder */}
          {phase === 'idle' && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
              <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
            </div>
          )}

          {/* Animated payment pulse */}
          <AnimatePresence>
            {phase === 'sending' && (
              <motion.div
                initial={{ left: '0%', opacity: 0 }}
                animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              >
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirmed: full green line */}
          <AnimatePresence>
            {phase === 'confirmed' && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-500/60 rounded-full origin-left"
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          {/* Amount label */}
          {amount && phase !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-0 -top-1 flex justify-center"
            >
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  phase === 'confirmed'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-indigo-300 bg-indigo-500/10'
                }`}
              >
                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </motion.div>
          )}
        </div>

        {/* Receiver node */}
        <motion.div
          className="flex flex-col items-center gap-2 flex-shrink-0"
          animate={{
            scale: phase === 'confirmed' ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-colors duration-500 ${
              phase === 'confirmed'
                ? 'bg-emerald-500/20 border-emerald-500/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <Globe
              size={20}
              className={
                phase === 'confirmed' ? 'text-emerald-400' : 'text-slate-400'
              }
            />
          </div>
          <span className="text-[10px] sm:text-xs text-slate-300 font-medium text-center max-w-[64px] sm:max-w-[80px] truncate">
            {receiverName}
          </span>
          <span className="text-[10px] text-slate-500">Receiver</span>
        </motion.div>
      </div>

      {/* Confirmation toast */}
      <AnimatePresence>
        {phase === 'confirmed' && txHash && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="text-emerald-400 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-300">
                  Transaction settled 100% within the Sage Trust Network.
                </p>
                <a
                  href={getTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors"
                >
                  <ExternalLink size={12} />
                  <span className="font-mono truncate">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </span>
                  <span>on BaseScan</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
