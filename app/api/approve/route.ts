import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseUnits, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from '@/lib/chains';
import { SAGECOIN_ABI } from '@/lib/contracts/sagecoin-abi';

const SAGECOIN_ADDRESS = process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS as `0x${string}`;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

/**
 * Server-side approve: The deployer (treasury) sets an ERC-20 allowance.
 * In the demo the deployer acts as both treasury owner and agent caller,
 * so we approve the deployer's own address (self-allowance). This lets
 * the deployer call transferFrom(self, vendor, amount) in agent-spend.
 * The on-chain Approval event is real and verifiable on BaseScan.
 *
 * The `spender` param from the frontend is stored for display purposes
 * (the AI agent's conceptual wallet address).
 */
export async function POST(request: NextRequest) {
  try {
    const { spender, amount } = await request.json();

    if (!spender || !isAddress(spender)) {
      return NextResponse.json({ error: 'Invalid spender address' }, { status: 400 });
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

    const nonce = await publicClient.getTransactionCount({
      address: account.address,
      blockTag: 'pending',
    });

    // Approve the deployer's own address so transferFrom(self, vendor, amt) works
    const hash = await walletClient.writeContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'approve',
      args: [account.address, parsedAmount],
      nonce,
    });

    // Return the next nonce so a subsequent call can chain without stale nonce
    return NextResponse.json({
      hash,
      owner: account.address,
      spender,
      amount,
      nextNonce: nonce + 1,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Approve failed';
    console.error('Approve API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
