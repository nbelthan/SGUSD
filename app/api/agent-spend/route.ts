import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseUnits, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from '@/lib/chains';
import { SAGECOIN_ABI } from '@/lib/contracts/sagecoin-abi';

const SAGECOIN_ADDRESS = process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS as `0x${string}`;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

/**
 * Server-side agent spend: Simulates an AI agent using transferFrom to spend
 * from the treasury's allowance. The deployer executes transferFrom(treasury, vendor, amount).
 *
 * In a real system the agent would hold its own key and call transferFrom directly.
 * In the demo, the deployer acts as both treasury and agent — calling transferFrom
 * on itself to show the allowance mechanics. The on-chain Approval event and
 * allowance reduction are real and verifiable on BaseScan.
 */
export async function POST(request: NextRequest) {
  try {
    const { to, amount, nonce: hintNonce } = await request.json();

    if (!to || !isAddress(to)) {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 });
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

    // The treasury (deployer) is the source — the agent spends from its allowance
    const treasuryAddress = account.address;

    // Check allowance before attempting transferFrom
    const allowance = await publicClient.readContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'allowance',
      args: [treasuryAddress, account.address],
    });

    if ((allowance as bigint) < parsedAmount) {
      return NextResponse.json(
        { error: 'Agent spend exceeds allowance (spend cap)' },
        { status: 400 }
      );
    }

    const nonce =
      typeof hintNonce === 'number'
        ? hintNonce
        : await publicClient.getTransactionCount({
            address: account.address,
            blockTag: 'pending',
          });

    const hash = await walletClient.writeContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'transferFrom',
      args: [treasuryAddress, to as `0x${string}`, parsedAmount],
      nonce,
    });

    return NextResponse.json({ hash, from: treasuryAddress, to, amount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Agent spend failed';
    console.error('Agent-spend API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
