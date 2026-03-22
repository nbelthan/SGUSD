'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Globe,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import type { PayoutMode } from '@/types';

interface PayoutToggleProps {
  onAuthorize?: (amount: number, mode: PayoutMode) => void;
  isLoading?: boolean;
  disabled?: boolean;
  defaultAmount?: number;
}

export default function PayoutToggle({
  onAuthorize,
  isLoading = false,
  disabled = false,
  defaultAmount = 5000,
}: PayoutToggleProps) {
  const [isSageMode, setIsSageMode] = useState(true);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(defaultAmount);

  // Dynamic fee calculations
  const wireFee = isSageMode ? 0 : 45;
  const fxMarkupPercentage = isSageMode ? 0 : 0.03;
  const fxFee = invoiceAmount * fxMarkupPercentage;
  const totalCost = invoiceAmount + wireFee + fxFee;

  const handleAuthorize = useCallback(() => {
    if (disabled || isLoading) return;
    onAuthorize?.(invoiceAmount, isSageMode ? 'sage' : 'traditional');
  }, [disabled, isLoading, onAuthorize, invoiceAmount, isSageMode]);

  return (
    <div className="w-full max-w-md glass-card p-5 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            International Contractor Payout
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-400">
            Cross-Border
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Building2 size={16} />
          <span>Acme Inc. (US)</span>
          <ArrowRight size={14} />
          <Globe size={16} />
          <span className="text-white font-medium">Rivera Design Co. (MX)</span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-8">
        <label className="text-xs font-medium text-slate-400">
          Invoice Amount (SGUSD)
        </label>
        <div className="mt-2 relative flex items-center">
          <span className="absolute left-4 text-xs sm:text-sm text-slate-400 font-medium">SGUSD</span>
          <input
            type="number"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(Number(e.target.value))}
            min={0}
            className="w-full glass-input py-3 sm:py-4 pl-16 sm:pl-20 pr-4 text-2xl sm:text-3xl font-light"
          />
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
          Traditional Wire
        </button>
        <button
          onClick={() => setIsSageMode(true)}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            isSageMode
              ? 'bg-[#4de082]/20 text-[#4de082] border border-[#4de082]/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Sage Intacct (SGUSD)
        </button>
      </div>

      {/* Breakdown Section */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Principal</span>
          <span>
            {invoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} SGUSD
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {!isSageMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between text-sm text-red-400">
                <span>Wire Fee</span>
                <span>+ {wireFee.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-sm text-red-400">
                <span>FX Markup (3%)</span>
                <span>+ {fxFee.toFixed(2)} USD</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isSageMode && (
          <div className="flex justify-between text-sm text-emerald-400">
            <span>Fees</span>
            <span>0.00 SGUSD</span>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
          <span className="text-sm text-slate-400">Total Deducted</span>
          <span className="text-2xl sm:text-3xl font-medium">
            {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-base text-slate-400">SGUSD</span>
          </span>
        </div>
      </div>

      {/* ETA */}
      <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.07] transition-colors duration-200">
        <div className="flex items-center gap-2">
          <Clock
            size={16}
            className={isSageMode ? 'text-[#4de082]' : 'text-amber-400'}
          />
          <span className="text-sm font-medium">ETA:</span>
        </div>
        <span
          className={`text-sm ${
            isSageMode
              ? 'text-[#4de082] font-semibold'
              : 'text-slate-300'
          }`}
        >
          {isSageMode ? '< 2 Seconds' : '3-5 Business Days'}
        </span>
      </div>
      {isSageMode && (
        <p className="text-[10px] text-emerald-400/60 text-right -mt-4 mb-2 mr-1">
          24/7/365 &mdash; no bank holidays, no cutoff times
        </p>
      )}

      {/* Action Button */}
      <div className="group">
        <button
          onClick={handleAuthorize}
          disabled={disabled || isLoading || invoiceAmount <= 0 || !isSageMode}
          className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isSageMode
              ? 'btn-sage'
              : 'btn-traditional'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isSageMode && <ShieldCheck size={18} />}
              {isSageMode ? 'Authorize Instant Transfer' : 'Initiate Wire Transfer'}
            </>
          )}
        </button>
        {/* Traditional mode tooltip */}
        {!isSageMode && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-xs text-slate-500 whitespace-nowrap bg-black/60 px-2 py-1 rounded">
              Demo only — switch to Sage Intacct mode
            </span>
          </div>
        )}
      </div>

      {/* Traditional mode disclaimer */}
      <AnimatePresence>
        {!isSageMode && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-slate-500 text-center mt-3"
          >
            Traditional wire transfers are shown for comparison only.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
