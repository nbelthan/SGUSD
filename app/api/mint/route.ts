import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseUnits, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from '@/lib/chains';
import { SAGECOIN_ABI } from '@/lib/contracts/sagecoin-abi';

const SAGECOIN_ADDRESS = process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS as `0x${string}`;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

export async function POST(request: NextRequest) {
  try {
    const { to, amount } = await request.json();

    if (!to || !isAddress(to)) {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 });
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!DEPLOYER_KEY || !DEPLOYER_KEY.startsWith('0x')) {
      return NextResponse.json({ error: 'Server not configured for minting' }, { status: 500 });
    }

    if (!SAGECOIN_ADDRESS || SAGECOIN_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json({ error: 'Contract address not configured' }, { status: 500 });
    }

    const account = privateKeyToAccount(DEPLOYER_KEY as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    const parsedAmount = parseUnits(amount, 18);

    // Mint to the deployer (treasury) — the deployer is "Acme Inc." in the demo.
    // This ensures the deployer has SGUSD to transfer later.
    const treasuryAddress = account.address;

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    // Explicitly fetch the pending nonce to avoid stale nonce errors
    // when multiple transactions are sent in quick succession.
    const nonce = await publicClient.getTransactionCount({
      address: account.address,
      blockTag: 'pending',
    });

    const hash = await client.writeContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'mint',
      args: [treasuryAddress, parsedAmount],
      nonce,
    });

    return NextResponse.json({ hash, to: treasuryAddress, amount, treasury: treasuryAddress });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Mint failed';
    console.error('Mint API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
