import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from '@/lib/chains';

/**
 * Waits for a transaction to be confirmed on-chain.
 * Used by LendingStep to ensure the mint tx confirms before sending the transfer,
 * since both use the same deployer wallet (shared nonce pool).
 */
export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get('hash');

  if (!hash || !hash.startsWith('0x')) {
    return NextResponse.json({ error: 'Invalid tx hash' }, { status: 400 });
  }

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: hash as `0x${string}`,
      timeout: 60_000,
    });

    return NextResponse.json({
      status: receipt.status,
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Wait failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
