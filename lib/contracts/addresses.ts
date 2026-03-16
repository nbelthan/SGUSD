/**
 * Contract addresses for Sagecoin (SGUSD) on Base Sepolia
 * Address is read from NEXT_PUBLIC_SAGECOIN_ADDRESS environment variable.
 */

export const SAGECOIN_ADDRESS = (process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;
