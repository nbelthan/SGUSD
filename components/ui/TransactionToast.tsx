"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ExternalLink, X } from "lucide-react";
import { getTxUrl } from "@/lib/basescan";

export type TransactionType = "mint" | "transfer" | "burn";

interface TransactionToastProps {
  type: TransactionType;
  amount: string;
  recipient?: string;
  txHash: string;
  onDismiss: () => void;
}

const typeLabels: Record<TransactionType, string> = {
  mint: "Minted",
  transfer: "Transferred",
  burn: "Burned",
};

function truncateHash(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function TransactionToast({
  type,
  amount,
  recipient,
  txHash,
  onDismiss,
}: TransactionToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    if (!visible) {
      onDismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onAnimationComplete={handleAnimationComplete}
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
        >
          <div className="glass-card p-4 relative overflow-hidden">
            {/* Success glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {typeLabels[type]} {amount} SGUSD
                </p>

                {recipient && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    To: {truncateAddress(recipient)}
                  </p>
                )}

                <p className="text-xs text-emerald-400 mt-1">
                  Settled in &lt;2 seconds
                </p>

                <a
                  href={getTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
                >
                  <span>{truncateHash(txHash)}</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <button
                onClick={() => setVisible(false)}
                className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ToastItem {
  id: string;
  type: TransactionType;
  amount: string;
  recipient?: string;
  txHash: string;
}

export function useTransactionToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (
    toast: Omit<ToastItem, "id">
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{ transform: `translateY(-${index * 4}px)` }}
        >
          <TransactionToast
            type={toast.type}
            amount={toast.amount}
            recipient={toast.recipient}
            txHash={toast.txHash}
            onDismiss={() => dismissToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return { showToast, ToastContainer };
}
