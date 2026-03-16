'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { SAGECOIN_ABI, SAGECOIN_ADDRESS } from '@/lib/contracts';

export function useBurn() {
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

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
    isLoading: isWritePending || isConfirming,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error: writeError || receiptError,
    reset,
  };
}
