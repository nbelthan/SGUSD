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
        <p className="text-xs text-red-400 text-center mt-2">
          Transaction failed. Please try again.
        </p>
      )}
      <ToastContainer />
    </>
  );
}
