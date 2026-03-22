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
  Wallet,
  Copy,
  Check,
} from 'lucide-react';
import { getTxUrl, getAddressUrl } from '@/lib/basescan';
import {
  AGENT_VENDOR_ACCOUNT,
  AGENT_SPEND_CAP,
  AGENT_SPEND_AMOUNT,
  TRADITIONAL_AGENT_FEES,
} from '@/lib/demo/accounts';

interface AgentWalletStepProps {
  onComplete?: (txHash: string) => void;
}

type Phase = 'setup' | 'provisioned' | 'complete';

export default function AgentWalletStep({ onComplete }: AgentWalletStepProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [agentAddress, setAgentAddress] = useState<string | undefined>();
  const [fundingTxHash, setFundingTxHash] = useState<string | undefined>();
  const [spendTxHash, setSpendTxHash] = useState<string | undefined>();
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isSpending, setIsSpending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [customSpendCap, setCustomSpendCap] = useState(AGENT_SPEND_CAP);
  const [copied, setCopied] = useState(false);
  const completedRef = useRef(false);

  const spendCap = Number(customSpendCap) || 0;
  const spendAmount = Number(AGENT_SPEND_AMOUNT);
  const remainingAllowance = spendCap - spendAmount;

  const handleCopyAddress = useCallback(async () => {
    if (!agentAddress) return;
    await navigator.clipboard.writeText(agentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [agentAddress]);

  const handleProvision = useCallback(async () => {
    setIsProvisioning(true);
    setError(undefined);
    try {
      const res = await fetch('/api/create-agent-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: customSpendCap }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Provisioning failed');

      setAgentAddress(data.agentAddress);
      setFundingTxHash(data.hash);
      setPhase('provisioned');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Provisioning failed';
      setError(message);
    } finally {
      setIsProvisioning(false);
    }
  }, [customSpendCap]);

  const handleAgentSpend = useCallback(async () => {
    setIsSpending(true);
    setError(undefined);
    try {
      // Wait for funding tx to be mined first
      if (fundingTxHash) {
        await fetch(`/api/tx-wait?hash=${fundingTxHash}`);
      }

      const res = await fetch('/api/transfer', {
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
  }, [fundingTxHash, onComplete]);

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
          Acme&apos;s treasury manager provisions an AI procurement agent with its own
          on-chain wallet funded with{' '}
          <span className="text-violet-400 font-medium">
            ${spendCap > 0 ? spendCap.toLocaleString() : '—'} SGUSD
          </span>.
          Each agent gets a unique wallet address the manager can monitor on BaseScan.
          The agent spends autonomously &mdash; no corporate card, no expense reports,
          no approval cycles.
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
              Procurement Agent
            </h4>
            <p className="text-xs text-slate-400">
              AI Agent (Acme Ops)
            </p>
          </div>
          {agentAddress && (
            <a
              href={getAddressUrl(agentAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
              title="View agent wallet on BaseScan"
            >
              <ExternalLink size={12} className="text-slate-500 hover:text-slate-300" />
            </a>
          )}
        </div>

        {/* Spend cap / funding amount */}
        <div className="p-4 rounded-xl bg-violet-500/[0.05] border border-violet-500/15 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-violet-400" />
              <span className="text-xs font-medium text-violet-400">
                {phase === 'setup' ? 'Agent Wallet Funding' : 'Wallet Balance'}
              </span>
            </div>
            {phase === 'setup' ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white">$</span>
                <input
                  type="number"
                  value={customSpendCap}
                  onChange={(e) => setCustomSpendCap(e.target.value)}
                  min="1"
                  step="100"
                  className="w-24 bg-white/[0.08] border border-violet-500/30 rounded-lg px-2 py-1 text-sm font-bold text-white text-right focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-slate-400 ml-1">SGUSD</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-white">
                ${spendCap.toLocaleString()} SGUSD
              </span>
            )}
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

        {/* Agent wallet address — visible after provisioning */}
        {agentAddress && (
          <div className="mb-5">
            <a
              href={getAddressUrl(agentAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Wallet size={14} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white">Monitor Agent Wallet</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {agentAddress}
                </p>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">BaseScan</span>
            </a>
            <button
              onClick={handleCopyAddress}
              className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors ml-14"
            >
              {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
              {copied ? 'Copied!' : 'Copy address'}
            </button>
          </div>
        )}

        {/* How it works */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Wallet size={14} className="text-violet-400 shrink-0" />
            <span>Each agent gets a unique on-chain wallet</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Lock size={14} className="text-violet-400 shrink-0" />
            <span>Spending capped by wallet balance &mdash; can&apos;t overspend</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Zap size={14} className="text-violet-400 shrink-0" />
            <span>Agent spends autonomously &mdash; no human approval per tx</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-emerald-400 font-medium">
            <DollarSign size={14} className="shrink-0" />
            <span>Yield accrues on wallet balance until agent transacts</span>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Phase: Setup — provision button */}
        {phase === 'setup' && (
          <button
            onClick={handleProvision}
            disabled={isProvisioning || spendCap <= 0 || spendCap < spendAmount}
            className="w-full py-3 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProvisioning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating wallet &amp; funding on-chain...
              </>
            ) : (
              <>
                <Wallet size={16} />
                Provision Agent Wallet &mdash; ${spendCap > 0 ? spendCap.toLocaleString() : '—'} SGUSD
              </>
            )}
          </button>
        )}

        {/* Phase: Provisioned — show funding tx, then agent spend button */}
        <AnimatePresence>
          {phase === 'provisioned' && fundingTxHash && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Funding confirmation */}
              <div className="p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-violet-400" />
                  <span className="text-xs font-medium text-violet-400">
                    Agent wallet created &amp; funded
                  </span>
                </div>
                <a
                  href={getTxUrl(fundingTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#4de082] hover:text-[#4de082] transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>Verify funding on BaseScan</span>
                  <span className="font-mono text-[#4de082]/60">
                    {fundingTxHash.slice(0, 10)}...{fundingTxHash.slice(-6)}
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
                ${remainingAllowance.toLocaleString()} remaining in agent wallet
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
              {agentAddress && (
                <a
                  href={getAddressUrl(agentAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Wallet size={12} />
                  <span>Agent wallet</span>
                  <span className="font-mono text-violet-400/60">
                    {agentAddress.slice(0, 10)}...{agentAddress.slice(-6)}
                  </span>
                </a>
              )}
              {fundingTxHash && (
                <a
                  href={getTxUrl(fundingTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Shield size={12} />
                  <span>Funding tx</span>
                  <span className="font-mono text-violet-400/60">
                    {fundingTxHash.slice(0, 10)}...{fundingTxHash.slice(-6)}
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
