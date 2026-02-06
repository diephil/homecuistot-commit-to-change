# Quickstart: Landing Page Revamp

**Feature**: 029-landing-page-revamp
**Date**: 2026-02-06

## Prerequisites

- Node.js + pnpm installed
- `apps/nextjs/.env.local` configured (for Supabase auth redirect on /login)

## Development

```bash
# From repo root
make dev

# Or from apps/nextjs/
pnpm dev
```

## Files to Create/Edit

| File | Action | Description |
|------|--------|-------------|
| `src/components/landing/LandingRecipeCard.tsx` | CREATE | Presentation-only recipe card with status indicators |
| `src/app/page.tsx` | EDIT | Rewrite all 7 landing page sections |

## Verification

1. Open `http://localhost:3000` in browser
2. Verify all 7 sections render in order
3. Check mobile responsiveness (320px, 375px, 768px, 1024px, 1440px)
4. Verify all CTA buttons link to `/login`
5. Verify anti-positioning: HomeCuistot column appears first on mobile
6. Verify product demo: 3 cards with green/yellow/gray backgrounds
7. Verify Sarah teaser: 3 narrative lines + CTA button

## Build Check

```bash
cd apps/nextjs && pnpm build
```

Must complete without TypeScript or build errors.
