import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseUnits, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from '@/lib/chains';
import { SAGECOIN_ABI } from '@/lib/contracts/sagecoin-abi';

const SAGECOIN_ADDRESS = process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS as `0x${string}`;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

/**
 * Server-side transfer: The deployer wallet executes the transfer on behalf
 * of the sender. In the demo, "Acme Inc." funds were minted to the deployer,
 * so the deployer transfers to the recipient. This avoids gas prompts entirely.
 *
 * Accepts an optional `nonce` field in the request body. When a mint precedes
 * this transfer (e.g. in LendingStep), the caller passes the mint's nextNonce
 * so we use the correct nonce without depending on the RPC node's potentially
 * stale getTransactionCount.
 */
export async function POST(request: NextRequest) {
  try {
    const { from, to, amount, nonce: hintNonce } = await request.json();

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

    // Use the caller-provided nonce when available (from a preceding mint's
    // nextNonce). This is the only reliable way to avoid stale-nonce errors
    // on Base Sepolia, where getTransactionCount can lag seconds behind.
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
      functionName: 'transfer',
      args: [to as `0x${string}`, parsedAmount],
      nonce,
    });

    return NextResponse.json({ hash, from, to, amount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Transfer failed';
    console.error('Transfer API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
