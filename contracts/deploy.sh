#!/usr/bin/env bash
# =============================================================================
# SageBridge — Deploy Sagecoin (SGUSD) to Base Sepolia
# =============================================================================
# Usage: bash contracts/deploy.sh
# Prerequisites:
#   1. Foundry installed (curl -L https://foundry.paradigm.xyz | bash && foundryup)
#   2. .env.local in project root with DEPLOYER_PRIVATE_KEY set
#   3. Deployer wallet funded with Base Sepolia ETH
#      Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.local"

# --- Load environment variables ---
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found."
    echo "Copy .env.example to .env.local and fill in DEPLOYER_PRIVATE_KEY."
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

if [ -z "${DEPLOYER_PRIVATE_KEY:-}" ] || [ "$DEPLOYER_PRIVATE_KEY" = "your_deployer_private_key_here" ]; then
    echo "Error: DEPLOYER_PRIVATE_KEY is not set or still has the placeholder value."
    echo "Edit .env.local and set a valid private key."
    echo ""
    echo "To get Base Sepolia ETH for deployment:"
    echo "  1. Generate a wallet or use an existing one"
    echo "  2. Visit https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
    echo "  3. Request testnet ETH for your deployer address"
    exit 1
fi

# --- Configuration ---
RPC_URL="${NEXT_PUBLIC_BASE_SEPOLIA_RPC:-https://sepolia.base.org}"
CHAIN_ID=84532

echo "=== SageBridge — Sagecoin Deployment ==="
echo "Network:  Base Sepolia (Chain ID: $CHAIN_ID)"
echo "RPC URL:  $RPC_URL"
echo ""

# --- Determine forge path ---
if command -v forge &> /dev/null; then
    FORGE_CMD="forge"
elif [ -f "$HOME/.foundry/bin/forge" ]; then
    FORGE_CMD="$HOME/.foundry/bin/forge"
else
    echo "Error: Foundry (forge) not found."
    echo "Install with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

# --- Build contracts ---
echo "Building contracts..."
cd "$SCRIPT_DIR"
$FORGE_CMD build

# --- Deploy ---
echo ""
echo "Deploying Sagecoin to Base Sepolia..."
$FORGE_CMD script script/Deploy.s.sol:DeployScript \
    --rpc-url "$RPC_URL" \
    --broadcast \
    --verify \
    --verifier blockscout \
    --verifier-url "https://base-sepolia.blockscout.com/api/" \
    -vvv

echo ""
echo "=== Deployment Complete ==="
echo "Check the output above for the deployed contract address."
echo "Then update .env.local:"
echo "  NEXT_PUBLIC_SAGECOIN_ADDRESS=<deployed_address>"
echo ""
echo "Verify on BaseScan: https://sepolia.basescan.org"
