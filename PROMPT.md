@features.json @activity.md @CLAUDE.md

We are building SageBridge — a programmable stablecoin demo (SGUSD/Sagecoin) on Base Sepolia testnet according to the specifications in this repo.

First read activity.md to see what was recently accomplished.

## Start the Environment

Run `bash init.sh` to bootstrap the dev environment. Then:

- If Next.js app exists: `npm run build` to verify no compilation errors, then `npm run dev &`
- If Foundry project exists: verify with `cd contracts && forge build`

If a port is taken, try another port.

## Work on Tasks

Open features.json and find the single highest priority task where `"done": false` and all `depends_on` items have `"done": true`.

Work on exactly ONE task:

1. Read the PRD file `Demo/Specs/prd.md` and CLAUDE.md for specifications relevant to this task
2. Reference `Demo/Specs/sagecoin.sol` for smart contract implementation details
3. Reference `Demo/Specs/payouttoggle.tsx` for UI design language
4. Implement the change according to the task description
5. Run any available checks:
   - `npx tsc --noEmit` (TypeScript check)
   - `npm run build` (if Next.js app exists)
   - `npm run lint` (if available)
   - `cd contracts && forge build` (if Foundry project exists)
   - Test in browser if applicable

## Log Progress

Append a dated progress entry to activity.md describing:

- What you changed
- What commands you ran
- Any issues encountered and how you resolved them

## Update Task Status

When the task is confirmed working, update that task's `"done"` field in features.json from `false` to `true`. Also update `_meta.completed_features` count.

## Commit Changes

Make one git commit for that task only with a clear, descriptive message:

```
git add .
git commit -m "feat(category): brief description of what was implemented"
```

Do NOT run git init, do NOT change git remotes, and do NOT push.

## Important Rules

- ONLY work on a SINGLE task per iteration
- NEVER edit tests to make them pass — fix the implementation
- NEVER remove features from features.json
- NEVER overwrite: .env.local, .env.example, Demo/Specs/, CLAUDE.md, PROMPT.md, ralph.sh
- Always log your progress in activity.md
- Always commit after completing a task
- Always leave merge-ready code (no half-implementations, no debug prints)
- ALL blockchain operations on Base Sepolia testnet (chain ID 84532)
- ALL BaseScan links must use sepolia.basescan.org

## Key Contract Mechanics

```
# Sagecoin rebasing multiplier (linear interest)
getCurrentMultiplier() = baseMultiplier + (baseMultiplier × rate × timeElapsed) / (BASIS_POINTS × SECONDS_IN_YEAR)

# Balance = shares × multiplier / PRECISION
# Interest rate: 500 basis points = 5% APY
# Contract source: Demo/Specs/sagecoin.sol
```

## Completion

When ALL tasks in features.json have `"done": true`, output:

<promise>COMPLETE</promise>
