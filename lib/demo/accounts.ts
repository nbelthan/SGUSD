import type { DemoAccount } from '@/types';

/**
 * Demo account: Acme Inc. — US-based SMB, the payer in the demo narrative.
 * Address is a placeholder; replaced by the connected user's embedded wallet at runtime.
 */
export const ACME_ACCOUNT: DemoAccount = {
  name: 'Acme Inc.',
  role: 'SMB Treasury',
  address: '0x0000000000000000000000000000000000000000',
  balance: 0,
};

/**
 * Demo account: Global Logistics — international contractor, the receiver.
 * Uses a fixed demo address for the payout recipient.
 */
export const GLOBAL_LOGISTICS_ACCOUNT: DemoAccount = {
  name: 'Global Logistics',
  role: 'International Contractor',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  balance: 0,
};

/** Default mint amount for the consumer payment step (in USD/SGUSD). */
export const DEFAULT_MINT_AMOUNT = '10000';

/** Default payout amount for the supplier payout step (in USD/SGUSD). */
export const DEFAULT_PAYOUT_AMOUNT = '5000';

/** Traditional banking baseline for fee savings calculation. */
export const TRADITIONAL_FEES = {
  wireFee: 45,
  fxMarkupPercent: 3,
} as const;
