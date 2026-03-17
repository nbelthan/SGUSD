'use client';

import { useState, useCallback } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';

/**
 * Transfer hook that calls the server-side /api/transfer endpoint.
 * The server uses the deployer wallet to execute transfers — no gas
 * needed from the user. In the demo, the deployer acts as the treasury.
 */
export function useTransfer() {
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });

  const transfer = useCallback((to: `0x${string}`, amount: string) => {
    setIsPending(true);
    setError(null);
    setHash(undefined);

    fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, amount }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Transfer failed');
        }
        setHash(data.hash as `0x${string}`);
        setIsPending(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error('Transfer failed'));
        setIsPending(false);
      });
  }, []);

  const reset = useCallback(() => {
    setHash(undefined);
    setIsPending(false);
    setError(null);
  }, []);

  return {
    transfer,
    txHash: hash,
    isLoading: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    isError: !!error,
    error,
    reset,
    isGasSponsored: true,
  };
}
