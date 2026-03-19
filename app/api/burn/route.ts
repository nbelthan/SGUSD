import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseUnits, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from '@/lib/chains';
import { SAGECOIN_ABI } from '@/lib/contracts/sagecoin-abi';

const SAGECOIN_ADDRESS = process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS as `0x${string}`;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

/**
 * Server-side burn: The deployer wallet burns SGUSD from a target address.
 * This simulates the off-ramp — converting SGUSD back to fiat via a local
 * banking partner. Burned tokens leave the network, maintaining 1:1 backing.
 */
export async function POST(request: NextRequest) {
  try {
    const { from, amount } = await request.json();

    if (!from || !isAddress(from)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!DEPLOYER_KEY || !DEPLOYER_KEY.startsWith('0x')) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const account = privateKeyToAccount(DEPLOYER_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const parsedAmount = parseUnits(amount, 18);

    // Check target address has sufficient balance to burn
    const balance = await publicClient.readContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'balanceOf',
      args: [from as `0x${string}`],
    });

    if ((balance as bigint) < parsedAmount) {
      return NextResponse.json(
        { error: 'Insufficient SGUSD balance to burn' },
        { status: 400 }
      );
    }

    const hash = await walletClient.writeContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'burn',
      args: [from as `0x${string}`, parsedAmount],
    });

    return NextResponse.json({ hash, from, amount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Burn failed';
    console.error('Burn API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
