'use client';

import { useState, useCallback } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';

/**
 * Mint hook that calls the server-side /api/mint endpoint.
 * The server uses the deployer wallet (contract owner) to mint SGUSD
 * to the user's address — no gas needed from the user.
 */
export function useMint() {
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });

  const mint = useCallback((to: `0x${string}`, amount: string) => {
    setIsPending(true);
    setError(null);
    setHash(undefined);

    fetch('/api/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, amount }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Mint failed');
        }
        setHash(data.hash as `0x${string}`);
        setIsPending(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error('Mint failed'));
        setIsPending(false);
      });
  }, []);

  const reset = useCallback(() => {
    setHash(undefined);
    setIsPending(false);
    setError(null);
  }, []);

  return {
    mint,
    txHash: hash,
    isLoading: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    isError: !!error,
    error,
    reset,
    isGasSponsored: true, // Always gasless — server pays
  };
}
