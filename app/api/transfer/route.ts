import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseUnits, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from '@/lib/chains';
import { SAGECOIN_ABI } from '@/lib/contracts/sagecoin-abi';

const SAGECOIN_ADDRESS = process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS as `0x${string}`;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

const MAX_NONCE_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

/**
 * Server-side transfer: The deployer wallet executes the transfer on behalf
 * of the sender. In the demo, "Acme Inc." funds were minted to the deployer,
 * so the deployer transfers to the recipient. This avoids gas prompts entirely.
 *
 * For a production app, this would use proper authorization and the user's
 * own smart wallet. For the demo, the deployer acts as the treasury.
 */
export async function POST(request: NextRequest) {
  try {
    const { from, to, amount } = await request.json();

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

    // Check deployer has sufficient balance
    const balance = await publicClient.readContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });

    if ((balance as bigint) < parsedAmount) {
      return NextResponse.json(
        { error: 'Insufficient SGUSD balance in treasury' },
        { status: 400 }
      );
    }

    // Retry with back-off when the RPC node returns a stale nonce.
    // This happens on Base Sepolia when a prior tx (e.g. mint) was just
    // confirmed but the node's pending count hasn't caught up yet.
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_NONCE_RETRIES; attempt++) {
      try {
        const hash = await walletClient.writeContract({
          address: SAGECOIN_ADDRESS,
          abi: SAGECOIN_ABI,
          functionName: 'transfer',
          args: [to as `0x${string}`, parsedAmount],
        });
        return NextResponse.json({ hash, from, to, amount });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('nonce too low') && attempt < MAX_NONCE_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        lastError = err;
        break;
      }
    }

    const message = lastError instanceof Error ? lastError.message : 'Transfer failed';
    console.error('Transfer API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Transfer failed';
    console.error('Transfer API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
