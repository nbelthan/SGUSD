'use client';

import { useState, useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

interface WriteContractConfig {
  address: `0x${string}`;
  abi: readonly unknown[];
  functionName: string;
  args: readonly unknown[];
}

/**
 * Gas-sponsored contract write hook.
 *
 * Uses Privy Smart Wallets (ERC-4337) when available for gasless transactions.
 * Falls back to standard wagmi useWriteContract when smart wallet is not ready
 * (e.g. Privy paymaster not configured in dashboard).
 */
export function useSponsoredWrite() {
  const { client: smartWalletClient } = useSmartWallets();

  // Smart wallet transaction state
  const [smartHash, setSmartHash] = useState<`0x${string}` | undefined>();
  const [smartPending, setSmartPending] = useState(false);
  const [smartError, setSmartError] = useState<Error | null>(null);

  // Wagmi fallback
  const {
    data: wagmiHash,
    writeContract: wagmiWrite,
    isPending: wagmiPending,
    isError: wagmiIsError,
    error: wagmiError,
    reset: wagmiReset,
  } = useWriteContract();

  const hash = smartHash || wagmiHash;

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const writeContract = useCallback(
    (config: WriteContractConfig) => {
      if (smartWalletClient) {
        // Gas-sponsored path via Privy Smart Wallet (ERC-4337)
        setSmartPending(true);
        setSmartError(null);
        setSmartHash(undefined);

        const data = encodeFunctionData({
          abi: config.abi,
          functionName: config.functionName,
          args: [...config.args],
        });

        smartWalletClient
          .sendTransaction({
            to: config.address,
            data,
          })
          .then((txHash: `0x${string}`) => {
            setSmartHash(txHash);
            setSmartPending(false);
          })
          .catch((err: unknown) => {
            setSmartError(
              err instanceof Error ? err : new Error('Transaction failed')
            );
            setSmartPending(false);
          });
      } else {
        // Fallback: standard wagmi write (user pays gas)
        wagmiWrite({
          address: config.address,
          abi: config.abi,
          functionName: config.functionName,
          args: [...config.args],
        });
      }
    },
    [smartWalletClient, wagmiWrite]
  );

  const reset = useCallback(() => {
    setSmartHash(undefined);
    setSmartPending(false);
    setSmartError(null);
    wagmiReset();
  }, [wagmiReset]);

  const isPending = smartPending || wagmiPending;
  const isError = !!smartError || wagmiIsError || isReceiptError;
  const error = smartError || wagmiError || receiptError || null;

  return {
    data: hash,
    writeContract,
    isPending,
    isError,
    error,
    reset,
    isConfirming,
    isConfirmed,
    isGasSponsored: !!smartWalletClient,
  };
}
