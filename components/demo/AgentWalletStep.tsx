'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Shield,
  CheckCircle2,
  ExternalLink,
  XCircle,
  DollarSign,
  Loader2,
  Zap,
  ShoppingCart,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { getTxUrl, getAddressUrl } from '@/lib/basescan';
import {
  AI_AGENT_ACCOUNT,
  AGENT_VENDOR_ACCOUNT,
  AGENT_SPEND_CAP,
  AGENT_SPEND_AMOUNT,
  TRADITIONAL_AGENT_FEES,
} from '@/lib/demo/accounts';

interface AgentWalletStepProps {
  onComplete?: (txHash: string) => void;
}

type Phase = 'setup' | 'approved' | 'spending' | 'complete';

export default function AgentWalletStep({ onComplete }: AgentWalletStepProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [approveTxHash, setApproveTxHash] = useState<string | undefined>();
  const [spendTxHash, setSpendTxHash] = useState<string | undefined>();
  const [isApproving, setIsApproving] = useState(false);
  const [isSpending, setIsSpending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const completedRef = useRef(false);

  const spendCap = Number(AGENT_SPEND_CAP);
  const spendAmount = Number(AGENT_SPEND_AMOUNT);
  const remainingAllowance = spendCap - spendAmount;

  const handleApprove = useCallback(async () => {
    setIsApproving(true);
    setError(undefined);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spender: AI_AGENT_ACCOUNT.address,
          amount: AGENT_SPEND_CAP,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approve failed');

      setApproveTxHash(data.hash);
      setPhase('approved');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Approve failed';
      setError(message);
    } finally {
      setIsApproving(false);
    }
  }, []);

  const handleAgentSpend = useCallback(async () => {
    setIsSpending(true);
    setError(undefined);
    try {
      // Wait for approve tx to be mined first
      if (approveTxHash) {
        await fetch(`/api/tx-wait?hash=${approveTxHash}`);
      }

      const res = await fetch('/api/agent-spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: AGENT_VENDOR_ACCOUNT.address,
          amount: AGENT_SPEND_AMOUNT,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Agent spend failed');

      setSpendTxHash(data.hash);
      setPhase('complete');

      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.(data.hash);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Agent spend failed';
      setError(message);
    } finally {
      setIsSpending(false);
    }
  }, [approveTxHash, onComplete]);

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div className="glass-card p-5 sm:p-8 md:p-10 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Bot size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              AI Agent Wallet
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Acme&apos;s treasury manager provisions an AI procurement agent with a{' '}
          <span className="text-violet-400 font-medium">${spendCap.toLocaleString()} SGUSD</span>{' '}
          spend cap. The agent can autonomously purchase supplies up to the cap &mdash;
          enforced on-chain via ERC-20 allowance. No corporate card, no expense reports,
          no approval cycles. The treasury earns yield on unspent funds until the agent transacts.
        </p>
      </div>

      {/* Agent wallet card */}
      <div className="glass-card p-5 sm:p-8 max-w-lg mx-auto">
        {/* Agent identity */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Bot size={20} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">
              {AI_AGENT_ACCOUNT.name}
            </h4>
            <p className="text-xs text-slate-400">
              {AI_AGENT_ACCOUNT.role}
            </p>
          </div>
          <a
            href={getAddressUrl(AI_AGENT_ACCOUNT.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
            title="View agent wallet on BaseScan"
          >
            <ExternalLink size={12} className="text-slate-500 hover:text-slate-300" />
          </a>
        </div>

        {/* Spend cap visualization */}
        <div className="p-4 rounded-xl bg-violet-500/[0.05] border border-violet-500/15 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-violet-400" />
              <span className="text-xs font-medium text-violet-400">On-Chain Spend Cap</span>
            </div>
            <span className="text-sm font-bold text-white">
              ${spendCap.toLocaleString()} SGUSD
            </span>
          </div>

          {/* Progress bar showing spend vs cap */}
          {phase === 'complete' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Spent: ${spendAmount.toLocaleString()}</span>
                <span>Remaining: ${remainingAllowance.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(spendAmount / spendCap) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Lock size={14} className="text-violet-400 shrink-0" />
            <span>Hard cap enforced at smart contract level</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Zap size={14} className="text-violet-400 shrink-0" />
            <span>Agent spends autonomously &mdash; no human approval per tx</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-emerald-400 font-medium">
            <DollarSign size={14} className="shrink-0" />
            <span>Yield accrues on unspent balance until agent transacts</span>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Phase: Setup — approve button */}
        {phase === 'setup' && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full py-3 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isApproving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Setting spend cap on-chain...
              </>
            ) : (
              <>
                <Shield size={16} />
                Set ${spendCap.toLocaleString()} Spend Cap
              </>
            )}
          </button>
        )}

        {/* Phase: Approved — show approval tx, then agent spend button */}
        <AnimatePresence>
          {phase === 'approved' && approveTxHash && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Approval confirmation */}
              <div className="p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-violet-400" />
                  <span className="text-xs font-medium text-violet-400">
                    Spend cap set on-chain
                  </span>
                </div>
                <a
                  href={getTxUrl(approveTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#4de082] hover:text-[#4de082] transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>Verify approval on BaseScan</span>
                  <span className="font-mono text-[#4de082]/60">
                    {approveTxHash.slice(0, 10)}...{approveTxHash.slice(-6)}
                  </span>
                </a>
              </div>

              {/* Vendor purchase context */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart size={14} className="text-amber-400" />
                  <span className="text-xs font-medium text-white">
                    Agent found best price for packaging supplies
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-300">{AGENT_VENDOR_ACCOUNT.name}</span>
                  <ArrowRight size={12} className="text-slate-500" />
                  <span className="text-white font-bold">${spendAmount.toLocaleString()} SGUSD</span>
                </div>
              </div>

              <button
                onClick={handleAgentSpend}
                disabled={isSpending}
                className="w-full py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSpending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Agent executing purchase...
                  </>
                ) : (
                  <>
                    <Bot size={16} />
                    Execute Agent Purchase
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post-action: completion card */}
      <AnimatePresence>
        {phase === 'complete' && spendTxHash && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="glass-card p-5 sm:p-8"
          >
            {/* Headline */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 mx-auto mb-4">
                <Bot size={28} className="text-violet-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Agent Purchase Complete
              </h3>
              <p className="text-sm text-slate-400">
                ${spendAmount.toLocaleString()} SGUSD spent autonomously &mdash;{' '}
                ${remainingAllowance.toLocaleString()} remaining in spend cap
              </p>
            </div>

            {/* Fee comparison: Traditional vs Sage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    Eliminated
                  </span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">${TRADITIONAL_AGENT_FEES.corporateCardFee}/mo</span>{' '}
                  <span className="text-emerald-400">$0</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Corporate card fee</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    Eliminated
                  </span>
                </div>
                <p className="text-lg font-bold text-white">
                  <span className="line-through text-red-400/60">${TRADITIONAL_AGENT_FEES.expenseReportCost}</span>{' '}
                  <span className="text-emerald-400">$0</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Expense report processing</p>
              </div>
            </div>

            {/* Total saved */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/15 mb-4">
              <Zap size={16} className="text-violet-400" />
              <span className="text-sm font-bold text-violet-400">
                Instant autonomous purchase &mdash; no {TRADITIONAL_AGENT_FEES.approvalCycleDays} approval cycle
              </span>
            </div>

            {/* BaseScan links */}
            <div className="flex flex-col items-center gap-2">
              {approveTxHash && (
                <a
                  href={getTxUrl(approveTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Shield size={12} />
                  <span>Approval tx</span>
                  <span className="font-mono text-violet-400/60">
                    {approveTxHash.slice(0, 10)}...{approveTxHash.slice(-6)}
                  </span>
                </a>
              )}
              <a
                href={getTxUrl(spendTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#4de082] hover:text-[#4de082] transition-colors"
              >
                <ExternalLink size={12} />
                <span>Agent spend tx</span>
                <span className="font-mono text-[#4de082]/60">
                  {spendTxHash.slice(0, 10)}...{spendTxHash.slice(-6)}
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
