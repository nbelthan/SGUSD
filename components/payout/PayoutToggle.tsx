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
    <div className="w-full max-w-md glass-card p-8 relative overflow-hidden">
      {/* Subtle background glow for Sage Mode */}
      <AnimatePresence>
        {isSageMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">
          Supplier Payout
        </h2>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Building2 size={16} />
          <span>Acme Inc.</span>
          <ArrowRight size={14} />
          <Globe size={16} />
          <span className="text-white font-medium">Global Logistics Ltd.</span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative z-10 mb-8">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Invoice Amount (USD)
        </label>
        <div className="mt-2 relative flex items-center">
          <span className="absolute left-4 text-2xl text-slate-400">$</span>
          <input
            type="number"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(Number(e.target.value))}
            min={0}
            className="w-full glass-input py-4 pl-10 pr-4 text-3xl font-light"
          />
        </div>
      </div>

      {/* The Toggle */}
      <div className="relative z-10 flex items-center justify-between p-1 bg-black/40 rounded-full mb-8 border border-white/5">
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
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          SageBridge (SGUSD)
        </button>
      </div>

      {/* Breakdown Section */}
      <div className="relative z-10 space-y-4 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Principal</span>
          <span>
            ${invoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                <span>+ ${wireFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-400">
                <span>FX Markup (3%)</span>
                <span>+ ${fxFee.toFixed(2)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isSageMode && (
          <div className="flex justify-between text-sm text-emerald-400">
            <span>Fees</span>
            <span>$0.00</span>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
          <span className="text-sm text-slate-400">Total Deducted</span>
          <motion.span
            key={totalCost}
            initial={{ scale: 0.95, color: '#94a3b8' }}
            animate={{
              scale: 1,
              color: isSageMode ? '#a5b4fc' : '#ffffff',
            }}
            className="text-3xl font-medium"
          >
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </motion.span>
        </div>
      </div>

      {/* ETA */}
      <div className="relative z-10 flex items-center justify-between mb-6 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <Clock
            size={16}
            className={isSageMode ? 'text-indigo-400' : 'text-amber-400'}
          />
          <span className="text-sm font-medium">ETA:</span>
        </div>
        <span
          className={`text-sm ${
            isSageMode
              ? 'text-indigo-300 font-semibold'
              : 'text-slate-300'
          }`}
        >
          {isSageMode ? '< 2 Seconds' : '3-5 Business Days'}
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleAuthorize}
        disabled={disabled || isLoading || invoiceAmount <= 0}
        className={`relative z-10 w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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

      {/* Traditional mode disclaimer */}
      <AnimatePresence>
        {!isSageMode && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 text-xs text-slate-500 text-center mt-3"
          >
            Traditional wire transfers are shown for comparison only.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
