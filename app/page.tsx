'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import LoginScreen from '@/components/auth/LoginScreen';

export default function Home() {
  const { ready, isAuthenticated, user, walletAddress, logout } = useAuth();

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
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-12 text-center relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
            SageBridge
          </h1>
          <p className="text-lg text-slate-400 mb-6">
            SGUSD Programmable Stablecoin Demo
          </p>
          {walletAddress && (
            <p className="text-sm text-slate-500 mb-2 font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
          {user?.email?.address && (
            <p className="text-sm text-slate-400 mb-6">
              {user.email.address}
            </p>
          )}
          <button
            onClick={logout}
            className="btn-traditional px-6 py-2 rounded-xl text-sm"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </main>
  );
}
