'use client';

import { parseUnits } from 'viem';
import { useSponsoredWrite } from '@/lib/hooks/useSponsoredWrite';
import { SAGECOIN_ABI, SAGECOIN_ADDRESS } from '@/lib/contracts';

export function useTransfer() {
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

  const transfer = (to: `0x${string}`, amount: string) => {
    const parsedAmount = parseUnits(amount, 18);
    writeContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'transfer',
      args: [to, parsedAmount],
    });
  };

  return {
    transfer,
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
