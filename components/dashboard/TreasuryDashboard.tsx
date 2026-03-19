'use client';

import { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Building,
  Landmark,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import { useTreasuryAddress } from '@/lib/hooks/useTreasuryAddress';
import { getAddressUrl } from '@/lib/basescan';
import TickingDigit from './TickingDigit';

/* ── Yield-comparison data ── */
// Rates grounded in fact (March 2026 sources: FDIC, Bankrate, US Treasury)
const YIELD_BARS = [
  {
    name: 'Big Bank Checking',
    sub: 'Chase, BofA, Wells Fargo',
    rate: 0.01,  // Chase checking APY (chase.com)
    icon: Building,
    color: 'text-red-400',
    barGradient: 'from-red-500/80 to-red-400/60',
    per10k: '$1',
  },
  {
    name: 'Avg Savings',
    sub: 'FDIC national average',
    rate: 0.39,  // FDIC national avg savings, Feb 2026
    icon: Landmark,
    color: 'text-amber-400',
    barGradient: 'from-amber-500/80 to-amber-400/60',
    per10k: '$39',
  },
{
    name: 'Sage Dollar',
    sub: 'SGUSD — Treasury minus 100bp',
    rate: 3.20,  // US 10yr Treasury (4.20%) - 100bp spread
    icon: DollarSign,
    color: 'text-emerald-400',
    barGradient: 'from-emerald-500 to-emerald-400',
    per10k: '$320',
  },
];
const MAX_RATE = 4.5;

export default function TreasuryDashboard() {
  const { walletAddress } = useAuth();
  const treasuryAddress = useTreasuryAddress();
  const balanceAddress = treasuryAddress || walletAddress;
  const { displayBalance, numericBalance, isLoading, isError, refetch } =
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
  const balance = numericBalance ?? 0;

  /* ── format balance into integer + decimal parts ── */
  const formatBalance = (bal: string | undefined) => {
    if (!bal) return { integer: '0', decimal: '00000000' };
    const [integer, decimal = '00000000'] = bal.split('.');
    const formattedInteger = parseInt(integer, 10).toLocaleString();
    return { integer: formattedInteger, decimal };
  };
  const { integer, decimal } = formatBalance(displayBalance);

  /* ── yield comparison memos ── */
  const annualLoss = useMemo(() => {
    if (balance <= 0) return 0;
    return balance * (3.20 / 100) - balance * (0.01 / 100);
  }, [balance]);

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

      {/* ── Embedded Yield Comparison — Horizontal Bars ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Where is your money working hardest?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual yield on every $10,000
            </p>
          </div>
        </div>

        {/* Horizontal bar rows */}
        <div className="space-y-3">
          {YIELD_BARS.map((item) => {
            const Icon = item.icon;
            const isSgusd = item.name === 'SGUSD';
            const barWidth = Math.max((item.rate / MAX_RATE) * 100, 1.5);

            return (
              <div
                key={item.name}
                className={`rounded-xl p-3 ${
                  isSgusd
                    ? 'bg-emerald-500/[0.06] border border-emerald-500/15'
                    : 'bg-white/[0.02]'
                }`}
              >
                {/* Top row: icon + name + rate + earnings */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center ${
                        isSgusd
                          ? 'bg-emerald-500/15 border border-emerald-500/25'
                          : 'bg-white/[0.04] border border-white/[0.06]'
                      }`}
                    >
                      <Icon size={13} className={item.color} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${isSgusd ? 'text-white' : 'text-slate-400'}`}>
                        {item.name}
                      </p>
                      <p className="text-[9px] text-slate-600 hidden sm:block">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-bold tabular-nums ${item.color}`}>
                      {item.rate.toFixed(2)}%
                    </span>
                    <span className={`text-[10px] tabular-nums ${isSgusd ? 'text-emerald-400/70' : 'text-slate-600'}`}>
                      {item.per10k}/yr
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.barGradient}`}
                    style={{
                      width: `${barWidth}%`,
                      transition: 'width 0.4s ease-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Loss aversion callout */}
        {balance > 0 && annualLoss > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15">
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                size={14}
                className="text-red-400 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-xs text-red-300 font-medium">
                  You&apos;re leaving{' '}
                  <span className="text-red-400 font-bold">
                    $
                    {annualLoss.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  /year on the table in a checking account.
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Big bank checking (0.01% APY) vs SGUSD (3.20% APY) on your current balance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BaseScan + source footnote */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-[9px] text-slate-600">
            Rates as of March 2026 &middot; Sources: Bankrate, NerdWallet
          </p>
          {balanceAddress && (
            <a
              href={basescanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-[#4de082] hover:text-[#3cd072] transition-colors"
            >
              View on BaseScan
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
