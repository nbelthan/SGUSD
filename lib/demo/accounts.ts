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

/** IRS Direct Deposit account — source for the tax refund step. */
export const IRS_ACCOUNT: DemoAccount = {
  name: 'IRS Direct Deposit',
  role: 'Federal Tax Refund',
  address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  balance: 0,
};

/** Default tax refund amount (average US federal refund, in USD/SGUSD). */
export const DEFAULT_TAX_REFUND_AMOUNT = '3100';

/** Traditional bank yield vs SGUSD yield for tax refund comparison. */
export const TAX_REFUND_YIELDS = {
  bankCheckingApy: 0.01,
  bankSavingsApy: 0.45,
  sgusdApy: 3.20,
  irsProcessingDays: '21 days (average)',
} as const;

/** Default mint amount for the invoice payment step (in USD/SGUSD). */
export const DEFAULT_MINT_AMOUNT = '10000';

/** Default payout amount for the contractor payout step (in USD/SGUSD). */
export const DEFAULT_PAYOUT_AMOUNT = '5000';

/** Banks are closed weekends + federal holidays — Sage settles 24/7/365. */
export const BANK_CLOSED_DAYS_PER_YEAR = 115;

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

// ── Payroll Streaming ──────────────────────────────────────────────

export const EMPLOYEE_ACCOUNT: DemoAccount = {
  name: 'Maria Garcia',
  role: 'Warehouse Manager (Sage Workforce)',
  address: '0x2345678901abcdef2345678901abcdef23456789' as `0x${string}`,
  balance: 0,
};

export const PAYROLL_ANNUAL_SALARY = 60000;
export const PAYROLL_DAILY_AMOUNT = '164';
export const EWA_FEE = 2;

export const TRADITIONAL_PAYROLL_FEES = {
  perEmployeePerMonth: 12,
  perPayrollRun: 39,
  ewaFeeFlat: 3.49,
  achSettlementDays: '2-3 business days',
} as const;

/** Check cashing / cash advance fees (industry averages, 2024-2025 data). */
export const CHECK_CASHING_FEES = {
  /** Average paycheck cashing fee as a percentage */
  checkCashingPercent: 3,
  /** Cash advance / payday loan fee per $100 borrowed */
  cashAdvancePer100: 15,
  /** Effective APR on a 14-day payday loan at $15/$100 */
  paydayApr: 391,
  /** Prepaid debit card reload fee */
  prepaidReloadFee: 3.74,
  /** Annual cost for a $60K/yr worker using check cashing (26 biweekly checks) */
  annualCostEstimate: 1050,
} as const;

// ── Lending Auto-Repayment ─────────────────────────────────────────

export const SAGE_CAPITAL_ACCOUNT: DemoAccount = {
  name: 'Sage Capital',
  role: 'Line of Credit (LOC-2024-7891)',
  address: '0x3456789012abcdef3456789012abcdef34567890' as `0x${string}`,
  balance: 0,
};

export const NEW_CUSTOMER_ACCOUNT: DemoAccount = {
  name: 'Brightside Coffee',
  role: 'New Customer Payment',
  address: '0x4567890123abcdef4567890123abcdef45678901' as `0x${string}`,
  balance: 0,
};

export const LOC_TOTAL = 25000;
export const LOC_OUTSTANDING = 18000;
export const NEW_PAYMENT_AMOUNT = '8000';
export const AUTO_REPAY_PERCENT = 10;
export const AUTO_REPAY_AMOUNT = '800';

export const TRADITIONAL_LENDING_FEES = {
  aprBank: 12.5,
  aprSage: 8.0,
  lateFee: 39,
  annualFee: 150,
  manualPaymentTime: '5-10 business days',
} as const;

/** Traditional domestic payment fees — what the SMB loses receiving card payments. */
export const DOMESTIC_FEES = {
  cardProcessingPercent: 2.9,
  cardFixedFee: 0.30,
  achDays: '2-3 business days',
  cardSettlementDays: '2-3 business days',
} as const;

// ── AI Agent Wallet ──────────────────────────────────────────────

export const AI_AGENT_ACCOUNT: DemoAccount = {
  name: 'Procurement Agent',
  role: 'AI Agent (Acme Ops)',
  address: '0x5678901234abcdef5678901234abcdef56789012' as `0x${string}`,
  balance: 0,
};

export const AGENT_VENDOR_ACCOUNT: DemoAccount = {
  name: 'PackageCo Supplies',
  role: 'Vendor (Autonomous Purchase)',
  address: '0x6789012345abcdef6789012345abcdef67890123' as `0x${string}`,
  balance: 0,
};

export const AGENT_SPEND_CAP = '1000';
export const AGENT_SPEND_AMOUNT = '347.50';

export const TRADITIONAL_AGENT_FEES = {
  corporateCardFee: 25,
  expenseReportCost: 18,
  approvalCycleDays: '3-5 business days',
} as const;
