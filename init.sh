#!/bin/bash
# SageBridge — Dev Environment Bootstrap
# Run this at the start of every session

set -e

echo "🔧 Bootstrapping SageBridge dev environment..."

# Check Node.js
if ! command -v node &>/dev/null; then
    echo "❌ Node.js not found. Install it first."
    exit 1
fi

echo "  Node: $(node --version)"
echo "  npm:  $(npm --version)"

# Check Foundry (optional — needed for contract tasks)
if command -v forge &>/dev/null; then
    echo "  Forge: $(forge --version 2>/dev/null | head -1)"
else
    echo "  Forge: not installed (install with: curl -L https://foundry.paradigm.xyz | bash && foundryup)"
fi

# Install npm deps if package.json exists but node_modules doesn't
if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
    echo "  Installing npm dependencies..."
    npm install
fi

# Install Foundry deps if contracts/foundry.toml exists
if [ -f "contracts/foundry.toml" ] && [ ! -d "contracts/lib" ]; then
    echo "  Installing Foundry dependencies..."
    cd contracts && forge install && cd ..
fi

echo "✅ Environment ready."
