'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Header() {
  const { isAuthenticated, walletAddress, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full border-b border-white/10 backdrop-blur-xl bg-white/[0.02]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <ShieldCheck size={20} className="text-indigo-400" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            SageBridge
          </span>
        </div>

        {/* Wallet + Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {walletAddress && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm">
              <Wallet size={14} className="text-indigo-400" />
              <span className="font-mono text-slate-300">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
