'use client';

import { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import { useTreasuryAddress } from '@/lib/hooks/useTreasuryAddress';
import { getAddressUrl } from '@/lib/basescan';
import TickingDigit from './TickingDigit';

/* ── Yield-comparison data ── */
const YIELD_BARS = [
  { name: 'Big Bank', rate: 0.01 },
  { name: 'Avg Savings', rate: 0.45 },
  { name: 'Sage Dollar', rate: 3.20 },
];
const MAX_RATE = 4.0;

export default function TreasuryDashboard() {
  const { walletAddress } = useAuth();
  const treasuryAddress = useTreasuryAddress();
  const balanceAddress = treasuryAddress || walletAddress;
  const { displayBalance, isLoading, isError, refetch } =
    useTickingBalance(balanceAddress);
  const [copied, setCopied] = useState(false);

  /* ── copy handler ── */
  const handleCopyAddress = () => {
    if (!balanceAddress) return;
    navigator.clipboard.writeText(balanceAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasBalance =
    displayBalance !== undefined && parseFloat(displayBalance) > 0;

  /* ── format balance into integer + decimal parts ── */
  const formatBalance = (bal: string | undefined) => {
    if (!bal) return { integer: '0', decimal: '00000000' };
    const [integer, decimal = '00000000'] = bal.split('.');
    const formattedInteger = parseInt(integer, 10).toLocaleString();
    return { integer: formattedInteger, decimal };
  };
  const { integer, decimal } = formatBalance(displayBalance);

  const basescanUrl = balanceAddress ? getAddressUrl(balanceAddress) : '#';

  return (
    <div className="glass-card p-5 sm:p-8 md:p-12">
      {/* ── Account header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight font-headline">
            Acme Inc.
          </h2>
          <p className="text-sm text-slate-400 mt-1">SMB Treasury</p>
        </div>

        {balanceAddress && (
          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group cursor-pointer"
              title={balanceAddress}
            >
              <Wallet size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-mono group-hover:text-slate-300 transition-colors">
                {balanceAddress.slice(0, 6)}...{balanceAddress.slice(-4)}
              </span>
              {copied ? (
                <Check size={10} className="text-emerald-400" />
              ) : (
                <Copy
                  size={10}
                  className="text-slate-600 group-hover:text-slate-400 transition-colors"
                />
              )}
            </button>

            {/* BaseScan link */}
            <a
              href={basescanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all"
              title="View on BaseScan"
            >
              <ExternalLink size={12} className="text-slate-500 hover:text-slate-300" />
            </a>
          </div>
        )}
      </div>

      {/* ── Balance display ── */}
      <div className="mb-8">
        <p className="uppercase tracking-widest text-[10px] font-semibold text-slate-400 mb-3">
          SGUSD Balance
        </p>

        {isLoading ? (
          <div className="h-12 sm:h-16 flex items-baseline gap-1 flex-wrap">
            <div className="h-6 sm:h-8 w-5 sm:w-6 bg-white/5 rounded animate-pulse" />
            <div className="h-8 sm:h-12 w-32 sm:w-48 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-5 sm:h-6 w-20 sm:w-32 bg-white/5 rounded animate-pulse ml-1" />
            <div className="h-5 w-14 bg-[#4de082]/10 rounded-full animate-pulse ml-2 sm:ml-3" />
          </div>
        ) : isError ? (
          <div className="h-12 sm:h-16 flex items-center gap-3">
            <p className="text-sm text-red-400">Unable to load balance</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 text-xs text-[#4de082] hover:text-[#3cd072] transition-colors"
            >
              <RotateCcw size={12} />
              Retry
            </button>
          </div>
        ) : (
          <div className="flex items-baseline gap-0.5 sm:gap-1 flex-wrap">
            <span className="text-slate-400 text-2xl sm:text-3xl md:text-4xl font-light">
              $
            </span>
            <span className="text-balance-ticker text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              {integer}
            </span>
            <span className="text-balance-ticker text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-slate-400">
              .
            </span>
            <span className="text-balance-ticker text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-slate-400 inline-flex">
              {decimal.split('').map((d, i) => (
                <TickingDigit
                  key={i}
                  digit={d}
                  className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium text-slate-400"
                />
              ))}
            </span>
            <Badge className="ml-2 sm:ml-3 bg-[#4de082]/10 text-[#4de082] border-[#4de082]/20 hover:bg-[#4de082]/15">
              SGUSD
            </Badge>
          </div>
        )}

        {/* Yield indicator line */}
        {!isLoading && !isError && hasBalance && (
          <div className="flex items-center gap-2 text-sm mt-3">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-emerald-400 font-medium">3.20% APY</span>
            <span className="text-slate-500">&middot; Earning yield in real-time</span>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/[0.06] mb-6" />

      {/* ── Yield Comparison ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white tracking-tight font-headline">
            Yield Comparison
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4de082]" />
            <span className="text-xs text-slate-400">Sage Dollar Performance</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#1c1b1b] border border-[#353534]/15 p-4 sm:p-5 space-y-4">
          {YIELD_BARS.map((item) => {
            const isSage = item.name === 'Sage Dollar';

            return (
              <div key={item.name} className="flex items-center gap-4">
                <span className={`text-sm font-medium w-28 shrink-0 ${isSage ? 'text-[#4de082]' : 'text-slate-400'}`}>
                  {item.name}
                </span>
                <div className={`flex-1 h-10 rounded-lg flex items-center px-4 ${
                  isSage
                    ? 'bg-[#4de082]/15 border border-[#4de082]/25'
                    : 'bg-white/[0.06]'
                }`}>
                  <span className={`text-sm font-semibold tabular-nums ${isSage ? 'text-[#4de082]' : 'text-slate-300'}`}>
                    {item.rate.toFixed(2)}% APY
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-500 text-center mt-4 italic">
          Data updated as of 12:00 PM UTC. Based on institutional treasury benchmarks.
        </p>
      </div>
    </div>
  );
}
