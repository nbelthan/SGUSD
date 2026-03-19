'use client';

import SageBridgeLogo from '@/components/ui/SageBridgeLogo';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="glass-card p-12 text-center w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <SageBridgeLogo size={36} />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Sage Intacct
        </h1>
        <p className="text-slate-400 mb-8">
          Keep payments on-network. Earn yield on idle capital. Pay anyone, instantly.
        </p>

        <button
          onClick={() => login()}
          className="btn-sage w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg"
        >
          Enter Sage Intacct
        </button>

        <p className="text-xs text-slate-500 mt-4">
          Sign in with email &mdash; no wallet or seed phrase needed
        </p>
      </div>
    </main>
  );
}
