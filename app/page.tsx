'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import LoginScreen from '@/components/auth/LoginScreen';
import Header from '@/components/layout/Header';
import TreasuryDashboard from '@/components/dashboard/TreasuryDashboard';
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 space-y-8">
        <NetworkGuard>
          <ErrorBoundary>
            <TreasuryDashboard />
          </ErrorBoundary>
          <div className="flex justify-center">
            <ErrorBoundary>
              <ConnectedPayoutToggle />
            </ErrorBoundary>
          </div>
        </NetworkGuard>
      </main>
    </div>
  );
}
