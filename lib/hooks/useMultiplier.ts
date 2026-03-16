'use client';

import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { SAGECOIN_ABI, SAGECOIN_ADDRESS } from '@/lib/contracts';

export function useMultiplier() {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: SAGECOIN_ADDRESS,
    abi: SAGECOIN_ABI,
    functionName: 'getCurrentMultiplier',
    query: {
      enabled: SAGECOIN_ADDRESS !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 10_000,
    },
  });

  const rawMultiplier = data as bigint | undefined;
  const formattedMultiplier = rawMultiplier !== undefined ? formatUnits(rawMultiplier, 18) : undefined;

  return {
    rawMultiplier,
    formattedMultiplier,
    isLoading,
    isError,
    error,
    refetch,
  };
}
