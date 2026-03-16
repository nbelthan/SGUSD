# SageBridge — SGUSD Programmable Stablecoin Demo — Coding Agent Instructions

You are building SageBridge, a functional MVP demo of SGUSD (Sagecoin) — a programmable, interest-bearing stablecoin for SMB payouts with yield. The demo proves zero-fee remittance + yield-on-capital mechanics on **Base Sepolia testnet**. This file tells you exactly how to operate in each session. Follow these instructions precisely.

---

## SESSION START PROTOCOL

Every session, do these steps IN ORDER before writing any code:

1. **Run `pwd`** — confirm you are in the Intuit project root
2. **Run `bash init.sh`** — bootstraps the dev environment (installs deps if needed)
3. **Read `activity.md`** — understand what previous sessions accomplished
4. **Read `features.json`** — find the highest-priority incomplete feature
5. **Read `git log --oneline -20`** — understand recent code changes
6. **Run quick smoke test** — if Next.js app exists, run `npm run build` to check for compilation errors
7. **Pick ONE feature** — select the highest-priority (lowest `priority` number) feature whose `depends_on` are all marked `done: true`
8. **Implement that feature** — write clean, production-ready code
9. **Test the feature** — run tests, check dev server, verify with browser if applicable
10. **Commit and update** — git commit, update features.json and activity.md

---

## CRITICAL RULES

### ONE FEATURE PER SESSION
- Do NOT attempt to implement multiple features in a single session
- Do NOT try to "one-shot" the entire application
- Focus, implement, test, commit, done

### NEVER EDIT TESTS TO MAKE THEM PASS
- If a test fails, fix the implementation, not the test
- Do NOT remove features from features.json
- Do NOT change the `done` field to true unless the feature is FULLY working

### ALWAYS LEAVE CLEAN STATE
- Every commit should be merge-ready code
- No half-implemented features in a commit
- No commented-out code blocks
- No debug console.log statements left in
- Run linting/formatting before committing

### GIT DISCIPLINE
- Commit after each completed feature with a descriptive message
- Format: `feat(category): description` — e.g., `feat(contract): deploy sagecoin to base sepolia`
- Never amend previous commits — always create new ones
- If you make a mistake, fix it in a new commit
- Do NOT run git init, do NOT change git remotes, and do NOT push

### PROTECT EXISTING FILES
- Do NOT overwrite: .env.local, .env.example, features.json, activity.md, CLAUDE.md, PROMPT.md, ralph.sh, Demo/Specs/
- These files are managed separately and must not be modified by accident

---

## PROJECT CONTEXT

### What SageBridge Does
- Demonstrates a programmable, interest-bearing stablecoin (SGUSD/Sagecoin) for SMB payouts
- Real-time "ticking" balance that visualizes yield accrual with 6+ decimal precision
- Zero-fee, instant cross-border payouts between SMBs on Base network
- Traditional vs Sage "Ghost Mode" toggle showing cost/time comparison
- Frictionless onboarding — no seed phrases, no MetaMask, email-based wallets via Privy
- Sponsored gas via Paymaster (ERC-4337 Account Abstraction)
- All transactions verifiable on BaseScan (Base Sepolia testnet)

### The Demo Narrative
1. **Consumer Payment:** A consumer pays a $10,000 invoice. Acme Inc. receives SGUSD instantly.
2. **Instant Yield:** Acme Inc. watches their balance "tick" upward in real-time.
3. **Global Payout:** Acme Inc. pays $5,000 to Global Logistics (international contractor).
4. **Zero-Fee Settlement:** Funds settle in <2 seconds with zero gas fees.
5. **Receiver Experience:** Contractor receives SGUSD, which immediately begins accruing yield.

### Tech Stack
- **Blockchain:** Base Sepolia Testnet (Ethereum L2)
- **Smart Contract:** Solidity (Foundry) — Rebasing ERC-20 with time-based interest
- **Wallet/Auth:** Privy (embedded wallets, email login)
- **Gas Sponsorship:** Paymaster (ERC-4337 Account Abstraction)
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **UI Components:** shadcn/ui, Lucide React icons
- **Blockchain SDK:** viem + wagmi for contract interactions
- **Hosting:** Vercel

### Key Architecture Decisions
- **Base Sepolia Testnet ONLY** — all contract deployments, all demo transactions, all BaseScan links point to Base Sepolia
- **Shares-based rebasing** — contract stores shares, not balances. `balance = shares × multiplier`. Multiplier increases every second.
- **Off-chain interpolation** — the UI "ticking" effect uses off-chain math between on-chain reads to create smooth animation
- **Privy embedded wallets** — users log in with email, get an embedded wallet automatically. No seed phrases.
- **Paymaster for gasless transactions** — all mint/transfer/burn operations are gas-sponsored
- **Demo accounts** — pre-configured Acme Inc. (US SMB) and Global Logistics (international contractor) for the walkthrough

### Smart Contract: Sagecoin (SGUSD)
The contract is a rebasing ERC-20 with linear interest accrual. Key mechanics:
```
# Interest multiplier (linear)
getCurrentMultiplier() = baseMultiplier + (baseMultiplier × annualInterestRate × timeElapsed) / (BASIS_POINTS × SECONDS_IN_YEAR)

# Balance calculation
balanceOf(account) = shares[account] × getCurrentMultiplier() / PRECISION

# Mint: converts USD amount to shares at current multiplier
sharesToMint = (amount × PRECISION) / currentMultiplier

# Interest rate: 500 basis points = 5% APY
```

The Solidity source is in `Demo/Specs/sagecoin.sol` — use it as the reference implementation.

### UI Design Language
- **Dark glassmorphism theme** — `bg-neutral-950` background, `backdrop-blur-xl`, `bg-white/5` cards, `border-white/10` borders
- **Accent colors** — Indigo (`indigo-500/600`) for Sage mode, Amber for traditional, Red for fees
- **Framer Motion** — smooth transitions, AnimatePresence for mode switching
- **High-precision numbers** — 6+ decimal places with animated "fluttering" digits
- **Glassmorphism cards** — subtle background glows, rounded-3xl corners, shadow-2xl

Reference UI component: `Demo/Specs/payouttoggle.tsx` — use this design language throughout.

---

## REFERENCE FILES

- **`Demo/Specs/prd.md`** — Full Product Requirements Document
- **`Demo/Specs/sagecoin.sol`** — Sagecoin smart contract (reference Solidity implementation)
- **`Demo/Specs/payouttoggle.tsx`** — Payout toggle UI component (reference design)
- **`.env.example`** — All environment variables documented

When implementing a feature, ALWAYS cross-reference the PRD and spec files.

---

## FEATURE PRIORITY GUIDE

Priority levels in features.json:
- **Priority 1** — Foundation (project scaffold, deps, theme, types, env config, contract setup)
- **Priority 2** — Core blockchain (contract deployment, Privy auth, contract hooks, paymaster)
- **Priority 3** — Main UI (treasury dashboard, ticking balance, payout toggle, network viz, demo flow)
- **Priority 4** — Polish (animations, error handling, responsive, end-to-end verification)

Within the same priority level, prefer features with fewer unmet dependencies.

---

## BASE SEPOLIA TESTNET DETAILS

- **Chain ID:** 84532
- **RPC URL:** https://sepolia.base.org
- **Block Explorer:** https://sepolia.basescan.org
- **Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet (or Base Sepolia faucet)
- **Currency:** ETH (testnet)

All contract interactions, BaseScan links, and demo transactions MUST use Base Sepolia.

---

## SESSION END PROTOCOL

Before ending your session:

1. **Commit all changes** with descriptive message: `feat(category): description`
2. **Update `features.json`** — set `done: true` for completed feature, update `_meta.completed_features` count
3. **Append to `activity.md`** — add a new session entry with:
   - Session number
   - Date
   - What you implemented
   - Commands you ran
   - Any issues encountered
   - What the next session should work on
4. **Run `git status`** — ensure working tree is clean
5. **Verify the app still builds** — `npm run build` must pass (if Next.js is set up)

---

## COMMON PITFALLS TO AVOID

1. **Don't hardcode private keys** — always use `process.env.DEPLOYER_PRIVATE_KEY`
2. **Don't use mainnet** — ALL operations on Base Sepolia testnet only
3. **Don't skip error handling** — blockchain calls fail, handle gracefully
4. **Contract addresses change on redeploy** — store in env vars or config, not hardcoded
5. **Privy requires API keys** — use `process.env.NEXT_PUBLIC_PRIVY_APP_ID`
6. **The ticking effect is OFF-CHAIN** — read on-chain balance periodically, interpolate between reads for smooth animation
7. **Shares ≠ balance** — the contract uses shares internally, always use `balanceOf()` for display
8. **Gas sponsorship requires Paymaster setup** — don't skip this, it's core to the "zero friction" promise
9. **shadcn components go in components/ui/** — don't manually create what shadcn provides
10. **Framer Motion for transitions** — use AnimatePresence for mode toggles, motion.div for animated elements
11. **6+ decimal precision** — the ticking dashboard must show at least 6 decimal places
12. **BaseScan links must use sepolia.basescan.org** — not basescan.org (mainnet)
