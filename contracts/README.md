# Sagecoin (SGUSD) — Smart Contract

Rebasing ERC-20 stablecoin with linear interest accrual (5% APY) on Base Sepolia.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Deployer wallet funded with Base Sepolia ETH
  - Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Build

```bash
cd contracts
forge build
```

## Deploy to Base Sepolia

1. Copy `.env.example` to `.env.local` in the project root (if not already done):

   ```bash
   cp .env.example .env.local
   ```

2. Set `DEPLOYER_PRIVATE_KEY` in `.env.local` to a funded wallet's private key.

3. Run the deployment script from the project root:

   ```bash
   bash contracts/deploy.sh
   ```

4. Copy the deployed contract address from the output and update `.env.local`:

   ```
   NEXT_PUBLIC_SAGECOIN_ADDRESS=0x...
   ```

## Network Details

| Property       | Value                              |
| -------------- | ---------------------------------- |
| Network        | Base Sepolia Testnet               |
| Chain ID       | 84532                              |
| RPC URL        | https://sepolia.base.org           |
| Block Explorer | https://sepolia.basescan.org       |

## Contract Details

- **Name:** Sagecoin
- **Symbol:** SGUSD
- **Decimals:** 18
- **Interest Rate:** 500 basis points (5% APY, linear)
- **Mechanism:** Shares-based rebasing — `balance = shares × multiplier / PRECISION`
