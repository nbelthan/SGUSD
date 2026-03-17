'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import ConnectedPayoutToggle from '@/components/payout/ConnectedPayoutToggle';
import NetworkVisualization from '@/components/network/NetworkVisualization';
import { GLOBAL_LOGISTICS_ACCOUNT, DEFAULT_PAYOUT_AMOUNT } from '@/lib/demo/accounts';

interface PayoutStepProps {
  onPayoutComplete?: (txHash: string) => void;
}

export default function PayoutStep({ onPayoutComplete }: PayoutStepProps) {
  const [transferTxHash, setTransferTxHash] = useState<string | undefined>();
  const completedRef = useRef(false);

  const receiverAddress = GLOBAL_LOGISTICS_ACCOUNT.address as `0x${string}`;

  const handleTransferComplete = useCallback(
    (txHash: string) => {
      setTransferTxHash(txHash);
      if (!completedRef.current) {
        completedRef.current = true;
        onPayoutComplete?.(txHash);
      }
    },
    [onPayoutComplete]
  );

  // Reset completed ref if component remounts
  useEffect(() => {
    return () => {
      completedRef.current = false;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Step header */}
      <div className="glass-card p-5 sm:p-8 md:p-10 relative overflow-hidden max-w-lg mx-auto">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Send size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                Step 2
              </p>
              <h3 className="text-lg font-semibold text-white">
                Supplier Payout
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed mb-2">
            Pay <span className="text-white font-medium">Global Logistics</span> $
            {Number(DEFAULT_PAYOUT_AMOUNT).toLocaleString()} for international services.
            Compare traditional wire costs against{' '}
            <span className="text-indigo-400 font-medium">SageBridge&apos;s zero-fee</span> instant settlement.
          </p>
        </div>
      </div>

      {/* Payout toggle */}
      <div className="flex justify-center">
        <ConnectedPayoutToggle
          receiverAddress={receiverAddress}
          defaultAmount={Number(DEFAULT_PAYOUT_AMOUNT)}
          onTransferComplete={handleTransferComplete}
        />
      </div>

      {/* Network visualization */}
      <AnimatePresence>
        {transferTxHash && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <NetworkVisualization
              txHash={transferTxHash}
              senderName="Acme Inc."
              receiverName="Global Logistics"
              amount={Number(DEFAULT_PAYOUT_AMOUNT)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
