import { NextResponse } from 'next/server';
import { privateKeyToAccount } from 'viem/accounts';

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

/** Returns the treasury (deployer) address so the frontend can show its balance. */
export async function GET() {
  if (!DEPLOYER_KEY || !DEPLOYER_KEY.startsWith('0x')) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const account = privateKeyToAccount(DEPLOYER_KEY as `0x${string}`);
  return NextResponse.json({ address: account.address });
}
