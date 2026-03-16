# SageBridge — Activity Log

## Current Status
**Last Updated:** 2026-03-16
**Tasks Completed:** 2 / 36
**Current Task:** INFRA-002 (completed)

---

## Session Log

### Session 1 — 2026-03-16
**Task:** INFRA-001 — Next.js 14 project scaffold
**What was done:**
- Manually scaffolded Next.js 14 project (create-next-app failed due to npm capital letter restriction on "Intuit" directory name)
- Created package.json with next@14.2.29, react@18, tailwindcss@3, typescript@5, eslint
- Created tsconfig.json with `@/*` import alias, excluded Demo/ and contracts/ from compilation
- Created tailwind.config.ts, postcss.config.mjs, .eslintrc.json, next.config.mjs
- Created app/layout.tsx with system font (Google Fonts unavailable in sandbox), app/page.tsx, app/globals.css with Tailwind directives
- Created public/ directory

**Commands run:**
- `npm install` — installed all dependencies
- `npm run build` — passes cleanly
- `npm run lint` — no warnings or errors
- `npx tsc --noEmit` — no type errors

**Issues:**
- `npx create-next-app@14 .` failed because directory name "Intuit" contains a capital letter (npm naming restriction). Manually created all scaffold files instead.
- Google Fonts (Inter) unavailable in sandbox — used system font-sans for now. Will be configured properly in INFRA-003 theme setup.
- Demo/Specs/payouttoggle.tsx was being compiled by TypeScript causing build failure — added Demo/ to tsconfig exclude.

**Next session:** INFRA-006 (.gitignore and project config) or SC-001 (Foundry project setup) — both have no remaining dependencies.

### Session 2 — 2026-03-16
**Task:** INFRA-002 — Install dependencies
**What was done:**
- Installed production deps: framer-motion, lucide-react, viem, wagmi, @tanstack/react-query
- Installed shadcn peer deps: tailwindcss-animate, class-variance-authority, clsx, tailwind-merge
- @radix-ui/react-slot was auto-installed as a shadcn dependency
- Created components.json for shadcn/ui configuration (dark theme, neutral base color, CSS variables)
- Created lib/utils.ts with cn() helper (clsx + tailwind-merge)
- Updated tailwind.config.ts with darkMode, shadcn CSS variable colors, border-radius tokens, and tailwindcss-animate plugin
- Updated app/globals.css with shadcn CSS variables (light + dark theme, neutral base)
- Added shadcn components: button, card, input, badge (components/ui/)

**Commands run:**
- `npm install framer-motion lucide-react viem wagmi @tanstack/react-query` — installed production deps
- `npm install tailwindcss-animate class-variance-authority clsx tailwind-merge` — installed shadcn peer deps
- `npx shadcn@latest add button card input badge --yes` — generated 4 shadcn components
- `npx tsc --noEmit` — no type errors
- `npm run build` — passes cleanly
- `npm run lint` — no warnings or errors

**Issues:**
- npm install was blocked by sandbox restrictions (403 Forbidden). Resolved by running outside sandbox.

**Next session:** INFRA-003 (dark glassmorphism theme) or INFRA-006 (.gitignore) or SC-001 (Foundry project setup).
