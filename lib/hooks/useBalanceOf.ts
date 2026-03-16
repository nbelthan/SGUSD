'use client';

import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { SAGECOIN_ABI, SAGECOIN_ADDRESS } from '@/lib/contracts';

export function useBalanceOf(address: `0x${string}` | undefined) {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: SAGECOIN_ADDRESS,
    abi: SAGECOIN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && SAGECOIN_ADDRESS !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 10_000,
    },
  });

  const rawBalance = data as bigint | undefined;
  const formattedBalance = rawBalance !== undefined ? formatUnits(rawBalance, 18) : undefined;

  return {
    rawBalance,
    formattedBalance,
    isLoading,
    isError,
    error,
    refetch,
  };
}
