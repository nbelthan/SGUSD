'use client';

import { parseUnits } from 'viem';
import { useSponsoredWrite } from '@/lib/hooks/useSponsoredWrite';
import { SAGECOIN_ABI, SAGECOIN_ADDRESS } from '@/lib/contracts';

export function useMint() {
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

  const mint = (to: `0x${string}`, amount: string) => {
    const parsedAmount = parseUnits(amount, 18);
    writeContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'mint',
      args: [to, parsedAmount],
    });
  };

  return {
    mint,
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
