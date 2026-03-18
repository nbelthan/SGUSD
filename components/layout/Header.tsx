'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LogOut,
  Wallet,
  Copy,
  Check,
  Menu,
  X,
  LayoutDashboard,
  Play,
  ExternalLink,
} from 'lucide-react';
import SageBridgeLogo from '@/components/ui/SageBridgeLogo';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAddressUrl } from '@/lib/basescan';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/demo', label: 'Guided Demo', icon: Play },
];

export default function Header() {
  const { isAuthenticated, walletAddress, logout } = useAuth();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) return null;

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full border-b border-white/10 backdrop-blur-xl bg-white/[0.02] sticky top-0 z-40"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center transition-shadow duration-300 hover:shadow-[0_0_12px_rgba(99,102,241,0.3)]">
              <SageBridgeLogo size={22} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              Sage Intacct
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Wallet + Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wallet address (copyable + link to BaseScan) */}
          {walletAddress && (
            <div className="hidden sm:flex items-center gap-0 rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={handleCopy}
                title={`Click to copy: ${walletAddress}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm hover:bg-white/5 transition-all group"
              >
                <Wallet size={13} className="text-indigo-400" />
                <span className="font-mono text-slate-300 text-xs group-hover:text-white transition-colors">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                {copied ? (
                  <Check size={10} className="text-emerald-400" />
                ) : (
                  <Copy size={10} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
                )}
              </button>
              <a
                href={getAddressUrl(walletAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 border-l border-white/10 hover:bg-white/5 transition-all"
                title="View on BaseScan"
              >
                <ExternalLink size={10} className="text-slate-500 hover:text-indigo-400 transition-colors" />
              </a>
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden border-t border-white/10 bg-neutral-950/95 backdrop-blur-xl"
          ref={menuRef}
        >
          <div className="px-4 py-3 space-y-1">
            {/* Nav links */}
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}

            {/* Wallet address (mobile) */}
            {walletAddress && (
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Wallet size={16} />
                <span className="font-mono text-xs">
                  {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}
                </span>
                {copied ? (
                  <Check size={12} className="text-emerald-400 ml-auto" />
                ) : (
                  <Copy size={12} className="text-slate-600 ml-auto" />
                )}
              </button>
            )}

            {/* Sign out */}
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/5 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
