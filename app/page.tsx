'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import LoginScreen from '@/components/auth/LoginScreen';
import Header from '@/components/layout/Header';
import TreasuryDashboard from '@/components/dashboard/TreasuryDashboard';
import FundButton from '@/components/dashboard/FundButton';
import ConnectedPayoutToggle from '@/components/payout/ConnectedPayoutToggle';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkGuard from '@/components/NetworkGuard';

export default function Home() {
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <NetworkGuard>
          {/* Row 1: Merged hero card — Treasury Dashboard + Yield Comparison */}
          <ErrorBoundary>
            <TreasuryDashboard />
          </ErrorBoundary>

          {/* Row 2: Fund Treasury + Supplier Payout (side by side on desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <ErrorBoundary>
              <FundButton />
            </ErrorBoundary>
            <ErrorBoundary>
              <ConnectedPayoutToggle />
            </ErrorBoundary>
          </div>

          {/* Row 3: Demo CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 sm:mt-6"
          >
            <Link href="/demo" className="block">
              <div className="glass-card p-4 sm:p-5 flex items-center justify-between group hover:border-indigo-500/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/15 transition-colors">
                    <Play size={16} className="text-indigo-400 ml-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Run the Full Demo
                    </p>
                    <p className="text-xs text-slate-500">
                      Guided walkthrough: Consumer Payment → Watch Yield →
                      Supplier Payout → Confirmation
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
                />
              </div>
            </Link>
          </motion.div>
        </NetworkGuard>
      </main>
    </div>
  );
}
