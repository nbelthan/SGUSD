import type { DemoAccount } from '@/types';

/**
 * Demo account: Acme Inc. — US-based SMB using Sage Invoicing.
 * Represents one of millions of SMBs processing invoices on Sage's rails.
 * Address is replaced by the connected user's embedded wallet at runtime.
 */
export const ACME_ACCOUNT: DemoAccount = {
  name: 'Acme Inc.',
  role: 'SMB on Sage Invoicing',
  address: '0x0000000000000000000000000000000000000000',
  balance: 0,
};

/**
 * Demo account: Sarah Chen — a Sage consumer who files taxes on Sage.
 * Represents the 1-in-10 US consumers who use Sage annually.
 * She pays Acme Inc.'s invoice using her Sage wallet.
 */
export const CONSUMER_ACCOUNT: DemoAccount = {
  name: 'Sarah Chen',
  role: 'Sage Consumer (Tax Filer)',
  address: '0x0000000000000000000000000000000000000000',
  balance: 0,
};

/**
 * Demo account: Rivera Design Co. — cross-border freelance contractor.
 * Represents the 10% of Sage payouts that are FX / cross-border.
 * Also a Sage consumer (files US taxes on Sage) — connecting both ecosystems.
 */
export const GLOBAL_LOGISTICS_ACCOUNT: DemoAccount = {
  name: 'Rivera Design Co.',
  role: 'Freelance Contractor (Mexico City)',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  balance: 0,
};

/** Default mint amount for the invoice payment step (in USD/SGUSD). */
export const DEFAULT_MINT_AMOUNT = '10000';

/** Default payout amount for the contractor payout step (in USD/SGUSD). */
export const DEFAULT_PAYOUT_AMOUNT = '5000';

/** Traditional banking baseline for international payout fee savings. */
export const TRADITIONAL_FEES = {
  wireFee: 45,
  fxMarkupPercent: 3,
} as const;

/** Default burn amount for the off-ramp step (in USD/SGUSD). */
export const DEFAULT_BURN_AMOUNT = '2500';

/** Off-ramp fee comparison: traditional remittance vs Sage Intacct. */
export const OFFRAMP_FEES = {
  remittanceFee: 15,
  fxSpreadPercent: 4,
} as const;

/** Simulated MXN/USD exchange rate for off-ramp display. */
export const MXN_RATE = 17.4;

/** Traditional domestic payment fees — what the SMB loses receiving card payments. */
export const DOMESTIC_FEES = {
  cardProcessingPercent: 2.9,
  cardFixedFee: 0.30,
  achDays: '2-3 business days',
  cardSettlementDays: '2-3 business days',
} as const;
