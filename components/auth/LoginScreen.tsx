'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-12 text-center relative overflow-hidden w-full max-w-md"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck size={32} className="text-indigo-400" />
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            SageBridge
          </h1>
          <p className="text-slate-400 mb-8">
            Programmable stablecoin treasury for instant, zero-fee global payouts
          </p>

          <button
            onClick={() => login()}
            className="btn-sage w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg"
          >
            Enter SageBridge
          </button>

          <p className="text-xs text-slate-500 mt-4">
            Sign in with email &mdash; no wallet or seed phrase needed
          </p>
        </div>
      </motion.div>
    </main>
  );
}
