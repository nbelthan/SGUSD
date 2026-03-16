'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { SAGECOIN_ABI, SAGECOIN_ADDRESS } from '@/lib/contracts';

export function useMint() {
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
    isLoading: isWritePending || isConfirming,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error: writeError || receiptError,
    reset,
  };
}
