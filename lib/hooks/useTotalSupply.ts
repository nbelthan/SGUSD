'use client';

import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { SAGECOIN_ABI, SAGECOIN_ADDRESS } from '@/lib/contracts';

export function useTotalSupply() {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: SAGECOIN_ADDRESS,
    abi: SAGECOIN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: SAGECOIN_ADDRESS !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 10_000,
    },
  });

  const rawTotalSupply = data as bigint | undefined;
  const formattedTotalSupply = rawTotalSupply !== undefined ? formatUnits(rawTotalSupply, 18) : undefined;

  return {
    rawTotalSupply,
    formattedTotalSupply,
    isLoading,
    isError,
    error,
    refetch,
  };
}
