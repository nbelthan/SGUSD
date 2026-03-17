'use client';

import { motion } from 'framer-motion';
import SageBridgeLogo from '@/components/ui/SageBridgeLogo';
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
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl pointer-events-none glow-pulse-indigo" />

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center"
            >
              <SageBridgeLogo size={36} />
            </motion.div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            SageBridge
          </h1>
          <p className="text-slate-400 mb-8">
            Keep payments on-network. Earn yield on idle capital. Pay anyone, instantly.
          </p>

          <motion.button
            onClick={() => login()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-sage w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg"
          >
            Enter SageBridge
          </motion.button>

          <p className="text-xs text-slate-500 mt-4">
            Sign in with email &mdash; no wallet or seed phrase needed
          </p>
        </div>
      </motion.div>
    </main>
  );
}
