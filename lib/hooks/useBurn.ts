'use client';

import { parseUnits } from 'viem';
import { useSponsoredWrite } from '@/lib/hooks/useSponsoredWrite';
import { SAGECOIN_ABI, SAGECOIN_ADDRESS } from '@/lib/contracts';

export function useBurn() {
  const {
    data: hash,
    writeContract,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset,
    isGasSponsored,
  } = useSponsoredWrite();

  const burn = (from: `0x${string}`, amount: string) => {
    const parsedAmount = parseUnits(amount, 18);
    writeContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'burn',
      args: [from, parsedAmount],
    });
  };

  return {
    burn,
    txHash: hash,
    isLoading: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset,
    isGasSponsored,
  };
}
