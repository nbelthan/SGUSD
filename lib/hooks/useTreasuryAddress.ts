'use client';

/**
 * Returns the treasury (deployer) address from a public env var.
 * The treasury is "Acme Inc." in the demo — all mints and transfers
 * go through this address.
 */
export function useTreasuryAddress() {
  const addr = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
  return addr ? (addr as `0x${string}`) : undefined;
}
