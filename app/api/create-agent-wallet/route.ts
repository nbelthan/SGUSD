import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseUnits } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from '@/lib/chains';
import { SAGECOIN_ABI } from '@/lib/contracts/sagecoin-abi';

const SAGECOIN_ADDRESS = process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS as `0x${string}`;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

/**
 * Creates a fresh agent wallet and funds it with SGUSD.
 *
 * 1. Generates a new random Ethereum keypair (unique per agent)
 * 2. Mints the spend-cap amount of SGUSD directly to the new wallet
 * 3. Returns the agent wallet address + funding tx hash
 *
 * The agent wallet will show real SGUSD balance on BaseScan, making it
 * easy for a treasury manager to monitor the agent's on-chain holdings.
 */
export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!DEPLOYER_KEY || !DEPLOYER_KEY.startsWith('0x')) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Generate a fresh wallet for this agent
    const agentPrivateKey = generatePrivateKey();
    const agentAccount = privateKeyToAccount(agentPrivateKey);

    // Deployer mints SGUSD to the new agent wallet
    const deployerAccount = privateKeyToAccount(DEPLOYER_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account: deployerAccount,
      chain: baseSepolia,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const parsedAmount = parseUnits(amount, 18);

    const nonce = await publicClient.getTransactionCount({
      address: deployerAccount.address,
      blockTag: 'pending',
    });

    const hash = await walletClient.writeContract({
      address: SAGECOIN_ADDRESS,
      abi: SAGECOIN_ABI,
      functionName: 'mint',
      args: [agentAccount.address, parsedAmount],
      nonce,
    });

    return NextResponse.json({
      hash,
      agentAddress: agentAccount.address,
      amount,
      nextNonce: nonce + 1,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Create agent wallet failed';
    console.error('Create agent wallet error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
