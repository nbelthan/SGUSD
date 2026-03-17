'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="glass-card p-8 md:p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-5">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          An unexpected error occurred. Please try again or refresh the page.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-sm text-slate-300 transition-colors"
        >
          <RotateCcw size={14} />
          Try Again
        </button>
      </div>
    </main>
  );
}
