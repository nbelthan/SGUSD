'use client';

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  CircleDot,
  Eye,
  Send,
  CheckCircle2,
  Globe,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Landmark,
  Receipt,
  Banknote,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import LoginScreen from '@/components/auth/LoginScreen';
import Header from '@/components/layout/Header';
import TreasuryDashboard from '@/components/dashboard/TreasuryDashboard';
import TaxRefundStep from '@/components/demo/TaxRefundStep';
import MintStep from '@/components/demo/MintStep';
import PayoutStep from '@/components/demo/PayoutStep';
import PayrollStep from '@/components/demo/PayrollStep';
import LendingStep from '@/components/demo/LendingStep';
import BurnStep from '@/components/demo/BurnStep';
import WageYieldStep from '@/components/demo/WageYieldStep';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkGuard from '@/components/NetworkGuard';
import { useTickingBalance } from '@/lib/hooks/useTickingBalance';
import { useConfetti } from '@/components/ui/Confetti';
import { DemoProvider, useDemoState, type DemoStep } from '@/lib/demo/useDemoState';
import {
  GLOBAL_LOGISTICS_ACCOUNT,
  DEFAULT_PAYOUT_AMOUNT,
  TRADITIONAL_FEES,
  TRADITIONAL_PAYROLL_FEES,
  EWA_FEE,
  TRADITIONAL_LENDING_FEES,
  LOC_OUTSTANDING,
  DEFAULT_BURN_AMOUNT,
  DEFAULT_MINT_AMOUNT,
  OFFRAMP_FEES,
  DOMESTIC_FEES,
} from '@/lib/demo/accounts';
import { ArrowDownCircle } from 'lucide-react';

const STEPS: { key: DemoStep; label: string; icon: typeof CircleDot }[] = [
  { key: 'tax-refund', label: 'Tax Refund', icon: Receipt },
  { key: 'mint', label: 'Invoice Payment', icon: Banknote },
  { key: 'watch-yield', label: 'Yield Accrual', icon: Eye },
  { key: 'payout', label: 'Contractor Payout', icon: Send },
  { key: 'payroll', label: 'Payroll', icon: Users },
  { key: 'wage-yield', label: 'Wage Yield', icon: TrendingUp },
  { key: 'lending', label: 'Auto-Repay', icon: Landmark },
  { key: 'burn', label: 'Off-Ramp', icon: ArrowDownCircle },
  { key: 'confirmation', label: 'Confirmed', icon: CheckCircle2 },
];

function StepIndicator({ currentStep, onStepClick }: { currentStep: DemoStep; onStepClick: (step: DemoStep) => void }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2">
            <motion.button
              onClick={() => onStepClick(step.key)}
              animate={{
                scale: isCurrent ? 1 : 0.95,
                opacity: isCurrent || isComplete ? 1 : 0.65,
              }}
              whileHover={{ scale: 1.05, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-[#4de082]/15 text-[#4de082] border border-[#4de082]/30'
                  : isComplete
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-white/[0.06] text-slate-400 border border-white/10 hover:bg-white/[0.1] hover:text-slate-300'
              }`}
            >
              <Icon size={12} />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </motion.button>
            {i < STEPS.length - 1 && (
              <div className="w-3 sm:w-6 h-px bg-white/10 relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isComplete ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-0 bg-[#4de082]/60 origin-left"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ConfirmationStep({ onReset }: { onReset: () => void }) {
  const receiverAddress = GLOBAL_LOGISTICS_ACCOUNT.address as `0x${string}`;
  const {
    displayBalance: receiverDisplayBalance,
    isLoading: receiverBalanceLoading,
  } = useTickingBalance(receiverAddress);
  const { fireConfetti } = useConfetti();

  const payoutAmount = Number(DEFAULT_PAYOUT_AMOUNT);
  const fxMarkupSaved = payoutAmount * (TRADITIONAL_FEES.fxMarkupPercent / 100);
  const wireFee = TRADITIONAL_FEES.wireFee;

  // Payroll savings
  const payrollSaved = TRADITIONAL_PAYROLL_FEES.perEmployeePerMonth;
  const ewaSaved = TRADITIONAL_PAYROLL_FEES.ewaFeeFlat - EWA_FEE;

  // Lending savings (annual interest diff)
  const lendingAnnualSaved = LOC_OUTSTANDING * ((TRADITIONAL_LENDING_FEES.aprBank - TRADITIONAL_LENDING_FEES.aprSage) / 100);
  const lendingLateFee = TRADITIONAL_LENDING_FEES.lateFee;

  // Off-ramp savings
  const burnAmount = Number(DEFAULT_BURN_AMOUNT);
  const offrampRemittanceFee = OFFRAMP_FEES.remittanceFee;
  const offrampFxSpread = burnAmount * (OFFRAMP_FEES.fxSpreadPercent / 100);

  // Invoice payment savings (card fee)
  const mintAmount = Number(DEFAULT_MINT_AMOUNT);
  const cardFeeSaved = mintAmount * (DOMESTIC_FEES.cardProcessingPercent / 100) + DOMESTIC_FEES.cardFixedFee;

  const totalSaved = cardFeeSaved + wireFee + fxMarkupSaved + payrollSaved + ewaSaved + offrampRemittanceFee + offrampFxSpread;

  // Fire confetti once on mount
  useEffect(() => {
    fireConfetti();
  }, [fireConfetti]);

  const formatBalance = (bal: string | undefined) => {
    if (!bal) return { integer: '0', decimal: '00000000' };
    const [integer, decimal = '00000000'] = bal.split('.');
    const formattedInteger = parseInt(integer, 10).toLocaleString();
    return { integer: formattedInteger, decimal };
  };

  const receiverBal = formatBalance(receiverDisplayBalance);

  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Acme Inc. balance (sender — reduced after payout) */}
      <TreasuryDashboard />

      {/* Rivera Design Co. balance (receiver — ticking) */}
      <div className="glass-card p-5 sm:p-8">
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
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-slate-400 mb-2">
            SGUSD Balance (Received)
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

        <div className="flex items-center gap-2 text-sm">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="text-emerald-400 font-medium">3.20% APY</span>
          <span className="text-slate-500">&middot;</span>
          <span className="text-slate-400 text-xs">
            Rivera earns yield the moment funds arrive &mdash; no bank account needed
          </span>
        </div>
      </div>

      {/* Summary + Demo Complete card */}
      <div className="glass-card p-5 sm:p-8 md:p-10 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-5">
          <CheckCircle2 size={28} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          The Loop Is Closed
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-4">
          Tax refund, invoice payment, contractor payout, payroll, loan repayment &mdash; even everyday spending.
          Every transaction stayed on Sage&apos;s network. The money that normally leaks to ACH,
          card processors, and wire services? It earned yield instead. It settled in seconds.
          And it never left.
        </p>

        {/* Savings summary */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <DollarSign size={16} className="text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">
              Total fees saved: ${totalSaved.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4de082]/10 border border-[#4de082]/20">
            <Clock size={16} className="text-[#4de082]" />
            <span className="text-sm font-bold text-[#4de082]">
              Settlement: &lt;2 seconds
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Every transaction is verifiable on{' '}
          <span className="text-[#4de082]">Base Sepolia</span> via BaseScan.
        </p>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-white/15 text-sm text-slate-300 transition-colors"
        >
          <RotateCcw size={14} />
          Reset Demo
        </button>
      </div>
    </motion.div>
  );
}

function DemoContent() {
  const { currentStep, setStep, resetDemo } = useDemoState();

  const handleTaxRefundComplete = useCallback(() => {
    setStep('mint');
  }, [setStep]);

  const handleMintComplete = useCallback(() => {
    setStep('watch-yield');
  }, [setStep]);

  const handleContinueToPayout = useCallback(() => {
    setStep('payout');
  }, [setStep]);

  const handlePayoutComplete = useCallback(() => {
    setStep('payroll');
  }, [setStep]);

  const handlePayrollComplete = useCallback(() => {
    setStep('wage-yield');
  }, [setStep]);

  const handleWageYieldContinue = useCallback(() => {
    setStep('lending');
  }, [setStep]);

  const handleLendingComplete = useCallback(() => {
    setStep('burn');
  }, [setStep]);

  const handleBurnComplete = useCallback(() => {
    setStep('confirmation');
  }, [setStep]);

  const handleReset = useCallback(() => {
    resetDemo();
  }, [resetDemo]);

  return (
    <div className="space-y-8">
      {/* Step indicators */}
      <StepIndicator currentStep={currentStep} onStepClick={setStep} />

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === 'tax-refund' && (
          <motion.div
            key="tax-refund"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            <TaxRefundStep onComplete={handleTaxRefundComplete} />
          </motion.div>
        )}

        {currentStep === 'mint' && (
          <motion.div
            key="mint"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            <MintStep onMintComplete={handleMintComplete} />
          </motion.div>
        )}

        {currentStep === 'watch-yield' && (
          <motion.div
            key="watch-yield"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <TreasuryDashboard />
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-400">
                This is the operating capital that normally sits in a checking account earning nothing.
                On Sage&apos;s network, it earns{' '}
                <span className="text-emerald-400 font-medium">3.20% APY</span>{' '}
                the second it arrives. No lockup, no action needed.
              </p>
              <button
                onClick={handleContinueToPayout}
                className="btn-sage px-6 py-2.5 text-sm"
              >
                Continue to Contractor Payout
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'payout' && (
          <motion.div
            key="payout"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <TreasuryDashboard />
            <PayoutStep onPayoutComplete={handlePayoutComplete} />
          </motion.div>
        )}

        {currentStep === 'payroll' && (
          <motion.div
            key="payroll"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <TreasuryDashboard />
            <PayrollStep onPayrollComplete={handlePayrollComplete} />
          </motion.div>
        )}

        {currentStep === 'wage-yield' && (
          <motion.div
            key="wage-yield"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <TreasuryDashboard />
            <WageYieldStep onContinue={handleWageYieldContinue} />
          </motion.div>
        )}

        {currentStep === 'lending' && (
          <motion.div
            key="lending"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <TreasuryDashboard />
            <LendingStep onLendingComplete={handleLendingComplete} />
          </motion.div>
        )}

        {currentStep === 'burn' && (
          <motion.div
            key="burn"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <TreasuryDashboard />
            <BurnStep onBurnComplete={handleBurnComplete} />
          </motion.div>
        )}

        {currentStep === 'confirmation' && (
          <ConfirmationStep onReset={handleReset} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DemoPage() {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="glass-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#4de082] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <DemoProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <NetworkGuard>
            <ErrorBoundary>
              <DemoContent />
            </ErrorBoundary>
          </NetworkGuard>
        </main>
      </div>
    </DemoProvider>
  );
}
