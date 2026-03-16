import { BLOCK_EXPLORER_URL } from '@/lib/chains';

export function getTxUrl(txHash: string): string {
  return `${BLOCK_EXPLORER_URL}/tx/${txHash}`;
}

export function getAddressUrl(address: string): string {
  return `${BLOCK_EXPLORER_URL}/address/${address}`;
}

export function getContractUrl(): string {
  const address = process.env.NEXT_PUBLIC_SAGECOIN_ADDRESS;
  if (!address) {
    return `${BLOCK_EXPLORER_URL}`;
  }
  return `${BLOCK_EXPLORER_URL}/address/${address}`;
}
