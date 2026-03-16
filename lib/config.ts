/**
 * Validated environment variable configuration for SageBridge.
 *
 * All public env vars are prefixed with NEXT_PUBLIC_ and available client-side.
 * Server-only vars (DEPLOYER_PRIVATE_KEY) are accessed only in deployment scripts.
 */

function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value || value.startsWith("your_")) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill in the values.`
    );
  }
  return value;
}

/** Privy App ID for embedded wallet authentication */
export const PRIVY_APP_ID = getEnvVar("NEXT_PUBLIC_PRIVY_APP_ID");

/** Sagecoin (SGUSD) contract address on Base Sepolia */
export const SAGECOIN_ADDRESS = getEnvVar(
  "NEXT_PUBLIC_SAGECOIN_ADDRESS"
) as `0x${string}`;

/** Base Sepolia RPC endpoint */
export const BASE_SEPOLIA_RPC = getEnvVar(
  "NEXT_PUBLIC_BASE_SEPOLIA_RPC",
  "https://sepolia.base.org"
);

/** Base Sepolia chain ID */
export const CHAIN_ID = 84532;
