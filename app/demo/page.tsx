'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CircleDot, Eye, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import LoginScreen from '@/components/auth/LoginScreen';
import Header from '@/components/layout/Header';
import TreasuryDashboard from '@/components/dashboard/TreasuryDashboard';
import MintStep from '@/components/demo/MintStep';
import PayoutStep from '@/components/demo/PayoutStep';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkGuard from '@/components/NetworkGuard';
import { DemoProvider, useDemoState, type DemoStep } from '@/lib/demo/useDemoState';

const STEPS: { key: DemoStep; label: string; icon: typeof CircleDot }[] = [
  { key: 'mint', label: 'Consumer Payment', icon: CircleDot },
  { key: 'watch-yield', label: 'Watch Yield', icon: Eye },
  { key: 'payout', label: 'Supplier Payout', icon: Send },
  { key: 'confirmation', label: 'Confirmed', icon: CheckCircle2 },
];

function StepIndicator({ currentStep }: { currentStep: DemoStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2">
            <motion.div
              animate={{
                scale: isCurrent ? 1 : 0.95,
                opacity: isCurrent || isComplete ? 1 : 0.4,
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isCurrent
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : isComplete
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-white/[0.03] text-slate-500 border border-white/5'
              }`}
            >
              <Icon size={12} />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className="w-4 sm:w-8 h-px bg-white/10 relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isComplete ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-0 bg-emerald-500/60 origin-left shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DemoContent() {
  const { currentStep, setStep, resetDemo } = useDemoState();

  const handleMintComplete = useCallback(() => {
    setStep('watch-yield');
  }, [setStep]);

  const handleContinueToPayout = useCallback(() => {
    setStep('payout');
  }, [setStep]);

  const handlePayoutComplete = useCallback(() => {
    setStep('confirmation');
  }, [setStep]);

  const handleReset = useCallback(() => {
    resetDemo();
  }, [resetDemo]);

  return (
    <div className="space-y-8">
      {/* Step indicators */}
      <StepIndicator currentStep={currentStep} />

      {/* Step content */}
      <AnimatePresence mode="wait">
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
                Watch your balance grow in real-time.{' '}
                <span className="text-emerald-400 font-medium">5% APY</span>{' '}
                accrues every second.
              </p>
              <button
                onClick={handleContinueToPayout}
                className="btn-sage px-6 py-2.5 text-sm"
              >
                Continue to Supplier Payout
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

        {currentStep === 'confirmation' && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <TreasuryDashboard />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card p-5 sm:p-8 md:p-10 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/[0.03] pointer-events-none" />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-emerald-500 rounded-full blur-3xl pointer-events-none glow-pulse-emerald" />
              <div className="relative z-10">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-5">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Demo Complete
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-2">
                  You&apos;ve experienced the full SageBridge flow: instant SGUSD receipt,
                  real-time yield accrual, and zero-fee international payout &mdash;
                  all settled on-chain in seconds.
                </p>
                <p className="text-xs text-slate-500 mb-6">
                  Every transaction is verifiable on{' '}
                  <span className="text-indigo-400">Base Sepolia</span> via BaseScan.
                </p>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-white/15 text-sm text-slate-300 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset Demo
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
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
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
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
