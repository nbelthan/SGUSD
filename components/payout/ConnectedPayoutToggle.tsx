'use client';

import { useEffect, useRef, useCallback } from 'react';
import PayoutToggle from './PayoutToggle';
import { useTransfer } from '@/lib/hooks/useTransfer';
import {
  useTransactionToast,
  type TransactionType,
} from '@/components/ui/TransactionToast';
import { GLOBAL_LOGISTICS_ACCOUNT } from '@/lib/demo/accounts';
import type { PayoutMode } from '@/types';

interface ConnectedPayoutToggleProps {
  receiverAddress?: `0x${string}`;
  defaultAmount?: number;
  onTransferComplete?: (txHash: string) => void;
}

export default function ConnectedPayoutToggle({
  receiverAddress,
  defaultAmount = 5000,
  onTransferComplete,
}: ConnectedPayoutToggleProps) {
  const {
    transfer,
    txHash,
    isLoading,
    isConfirmed,
    isError,
    error,
    reset,
  } = useTransfer();

  const { showToast, ToastContainer } = useTransactionToast();

  // Track whether we've already shown the toast for this tx
  const lastToastedHash = useRef<string | null>(null);

  const recipient =
    receiverAddress || (GLOBAL_LOGISTICS_ACCOUNT.address as `0x${string}`);

  // Show toast on successful confirmation
  useEffect(() => {
    if (isConfirmed && txHash && txHash !== lastToastedHash.current) {
      lastToastedHash.current = txHash;
      showToast({
        type: 'transfer' as TransactionType,
        amount: String(defaultAmount),
        recipient,
        txHash,
      });
      onTransferComplete?.(txHash);
      // Reset write state so the button becomes usable again
      reset();
    }
  }, [isConfirmed, txHash, showToast, recipient, defaultAmount, onTransferComplete, reset]);

  const handleAuthorize = useCallback(
    (amount: number, mode: PayoutMode) => {
      if (mode !== 'sage') return;
      transfer(recipient, String(amount));
    },
    [transfer, recipient]
  );

  return (
    <>
      <PayoutToggle
        onAuthorize={handleAuthorize}
        isLoading={isLoading}
        disabled={false}
        defaultAmount={defaultAmount}
      />
      {isError && error && (
        <div className="text-center mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <p className="text-xs text-red-400 mb-2">
            {error.message?.includes('User rejected') || error.message?.includes('denied')
              ? 'Transaction was rejected by user'
              : error.message?.includes('insufficient')
              ? 'Insufficient balance for this transfer'
              : 'Transfer failed — please try again'}
          </p>
          <button
            onClick={reset}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            Try again
          </button>
        </div>
      )}
      <ToastContainer />
    </>
  );
}
