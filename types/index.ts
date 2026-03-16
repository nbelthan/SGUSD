export interface DemoAccount {
  name: string;
  role: string;
  address: `0x${string}`;
  balance: number;
}

export interface Transaction {
  from: `0x${string}`;
  to: `0x${string}`;
  amount: bigint;
  txHash: `0x${string}`;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ContractConfig {
  address: `0x${string}`;
  abi: readonly unknown[];
  chainId: number;
}

export type PayoutMode = 'sage' | 'traditional';
