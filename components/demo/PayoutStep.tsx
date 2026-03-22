'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Clock,
  XCircle,
  DollarSign,
  Globe,
} from 'lucide-react';
import ConnectedPayoutToggle from '@/components/payout/ConnectedPayoutToggle';
import NetworkVisualization from '@/components/network/NetworkVisualization';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import { useConfetti } from '@/components/ui/Confetti';
import { getTxUrl, getAddressUrl } from '@/lib/basescan';
import {
  GLOBAL_LOGISTICS_ACCOUNT,
  DEFAULT_PAYOUT_AMOUNT,
  TRADITIONAL_FEES,
} from '@/lib/demo/accounts';

interface PayoutStepProps {
  onPayoutComplete?: (txHash: string) => void;
}

export default function PayoutStep({ onPayoutComplete }: PayoutStepProps) {
  const [transferTxHash, setTransferTxHash] = useState<string | undefined>();
  const completedRef = useRef(false);
  const { fireConfetti } = useConfetti();

  const receiverAddress = GLOBAL_LOGISTICS_ACCOUNT.address as `0x${string}`;

  // Receiver's ticking balance
  const {
    displayBalance: receiverDisplayBalance,
    isLoading: receiverBalanceLoading,
  } = useTickingBalance(receiverAddress);

  // Fee savings calculations
  const payoutAmount = Number(DEFAULT_PAYOUT_AMOUNT);
  const fxMarkupSaved = payoutAmount * (TRADITIONAL_FEES.fxMarkupPercent / 100);
  const wireFee = TRADITIONAL_FEES.wireFee;
  const totalSaved = wireFee + fxMarkupSaved;

  const handleTransferComplete = useCallback(
    (txHash: string) => {
      setTransferTxHash(txHash);
      if (!completedRef.current) {
        completedRef.current = true;
        fireConfetti();
        onPayoutComplete?.(txHash);
      }
    },
    [onPayoutComplete]
  );

  // Reset refs if component remounts
  useEffect(() => {
    return () => {
      completedRef.current = false;
    };
  }, []);

  // Format receiver balance
  const formatReceiverBalance = (bal: string | undefined) => {
    if (!bal) return { integer: '0', decimal: '00000000' };
    const [integer, decimal = '00000000'] = bal.split('.');
    const formattedInteger = parseInt(integer, 10).toLocaleString();
    return { integer: formattedInteger, decimal };
  };

  const receiverBal = formatReceiverBalance(receiverDisplayBalance);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="glass-card p-5 sm:p-8 md:p-10 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4de082]/10 border border-[#4de082]/20">
            <Send size={20} className="text-[#4de082]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Contractor Payout
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mb-2">
          Acme Inc. owes <span className="text-white font-medium">Rivera Design Co.</span> in
          Mexico City ${payoutAmount.toLocaleString()} for freelance design work.
          Today, this kind of contractor payout leaves Sage entirely. It gets routed through
          SWIFT: $45 wire fee, 3% FX markup, 3-5 days to arrive. With SGUSD, the payment
          stays on Sage&apos;s network. Rivera gets it in seconds with no fees, and her
          balance starts earning yield right away.
        </p>
      </div>

      {/* Payout toggle */}
      <div className="flex justify-center">
        <ConnectedPayoutToggle
          receiverAddress={receiverAddress}
          defaultAmount={payoutAmount}
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
              receiverName="Rivera Design Co."
              amount={payoutAmount}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* "You Saved" card */}
      <AnimatePresence>
        {transferTxHash && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
            className="glass-card p-5 sm:p-8"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                <DollarSign size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                You just saved{' '}
                <span className="text-emerald-400">${totalSaved.toLocaleString()}</span>{' '}
                on this transfer!
              </h3>
              <p className="text-sm text-slate-400">
                This payout stayed on Sage&apos;s network &mdash; no ACH, no wire, no FX markup
              </p>
            </div>

            {/* Fee breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Wire fee */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    Eliminated
                  </span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">${wireFee}</span>{' '}
                  <span className="text-emerald-400">$0</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Wire transfer fee</p>
              </div>

              {/* FX markup */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    Eliminated
                  </span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">${fxMarkupSaved.toLocaleString()}</span>{' '}
                  <span className="text-emerald-400">$0</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  FX markup ({TRADITIONAL_FEES.fxMarkupPercent}% on ${payoutAmount.toLocaleString()})
                </p>
              </div>
            </div>

            {/* Settlement speed */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-[#4de082]/[0.06] border border-[#4de082]/15 mb-4">
              <Clock size={16} className="text-[#4de082]" />
              <div className="text-sm">
                <span className="text-white font-medium">Settlement: </span>
                <span className="text-emerald-400 font-bold">&lt;2 seconds</span>
                <span className="text-slate-500"> vs </span>
                <span className="line-through text-red-400/60">3-5 business days</span>
              </div>
            </div>

            {/* BaseScan link */}
            <div className="text-center">
              <a
                href={getTxUrl(transferTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#4de082] hover:text-[#4de082] transition-colors"
              >
                <ExternalLink size={12} />
                <span>Verify on BaseScan</span>
                <span className="font-mono text-[#4de082]/60">
                  {transferTxHash.slice(0, 10)}...{transferTxHash.slice(-6)}
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receiver balance — Global Logistics */}
      <AnimatePresence>
        {transferTxHash && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8, ease: 'easeOut' }}
            className="glass-card p-5 sm:p-8"
          >
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
              <a
                href={getAddressUrl(GLOBAL_LOGISTICS_ACCOUNT.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
                title="View on BaseScan"
              >
                <ExternalLink size={12} className="text-slate-500 hover:text-slate-300" />
              </a>
            </div>

            {/* Receiver ticking balance */}
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

            {/* Yield message */}
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">3.20% APY</span>
              <span className="text-slate-500">&middot;</span>
              <span className="text-slate-400 text-xs">
                Rivera&apos;s funds earn yield as soon as they arrive. With her Sage Visa card, she can spend SGUSD at merchants worldwide &mdash; no local bank account needed.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
