'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Demo error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="glass-card p-8 md:p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-5">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Demo Error
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Something went wrong during the demo. You can retry or return to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-sm text-slate-300 transition-colors"
          >
            <RotateCcw size={14} />
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-sm text-indigo-300 transition-colors"
          >
            <Home size={14} />
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
