# Implementation Plan: Story-Based Onboarding

**Branch**: `024-story-onboarding` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/024-story-onboarding/spec.md`

## Summary

7-scene linear narrative onboarding where users role-play as "Sarah" to learn HomeCuistot's core loop: inventory tracking → recipe readiness → voice input → cook action. Scenes 1-3 are static storytelling (progressive fade-in text). Scene 4 reuses the existing voice pipeline (no DB persistence, no confirmation modal). Scene 5-6 demonstrate mark-as-cooked with inventory decrement. Scene 7 offers "Get started" (pre-fills DB for brand-new users) or "Restart demo". All state lives in localStorage during the flow; only persisted on completion via a dedicated API route.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16 App Router, Tailwind CSS v4, Drizzle ORM 0.45.1, @google/genai (Gemini), Zod
**Storage**: localStorage (during flow) + Supabase PostgreSQL via Drizzle (on completion)
**Testing**: Manual testing (MVP phase)
**Target Platform**: Web (mobile-first responsive)
**Project Type**: Web application (monorepo: `apps/nextjs/`)
**Performance Goals**: Flow completes in <2 min, voice processing <5s
**Constraints**: No DB writes until "Get started", progressive fade-in animations must feel smooth (60fps CSS transitions)
**Scale/Scope**: 7 scenes, 3 API routes, ~12 new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Focus on happy paths, manual testing |
| II. Pragmatic Type Safety | PASS | Strict at API boundaries, localStorage types can be loose |
| III. Essential Validation | PASS | Validate completion API input (DB writes), skip internal state |
| IV. Test-Ready | PASS | No tests required for MVP |
| V. Type Derivation | PASS | Reuse existing types (RecipeWithAvailability, InventoryDisplayItem, QuantityLevel) |
| VI. Named Parameters | PASS | Will follow for 3+ param functions |
| VII. Vibrant Neobrutalism | PASS | Neo-brutalist design with thick borders, bold shadows, vibrant colors |
| Non-Negotiable Safeguards | PASS | Auth required, parameterized queries via Drizzle, no exposed secrets |

## Project Structure

### Documentation (this feature)

```text
specs/024-story-onboarding/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md
└── tasks.md             # Phase 2 output (not created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── app/(protected)/app/onboarding/story/
│   ├── page.tsx                    # Route entry: /app/onboarding/story
│   ├── StoryOnboarding.tsx         # Main orchestrator component (client)
│   ├── scenes/
│   │   ├── Scene1Dilemma.tsx       # Sarah's evening dilemma
│   │   ├── Scene2Inventory.tsx     # Inventory + almost-available recipe card
│   │   ├── Scene3Store.tsx         # Sarah decides to shop
│   │   ├── Scene4Voice.tsx         # Voice input (interactive)
│   │   ├── Scene5Ready.tsx         # Recipe now READY
│   │   ├── Scene6Cooked.tsx        # Mark-as-cooked modal/decrement display
│   │   └── Scene7Manifesto.tsx     # Manifesto + CTAs
│   └── hooks/
│       ├── useStoryState.ts        # localStorage-backed state machine
│       └── useFadeTransition.ts    # Fade-in/out scene transition hook
├── app/api/onboarding/story/
│   ├── process-voice/route.ts      # Voice → ingredient extraction (no DB)
│   └── complete/route.ts           # Pre-fill DB for brand-new users
└── lib/
    └── story-onboarding/
        └── constants.ts            # Sarah's inventory, carbonara recipe, scene content
```

**Structure Decision**: Feature lives within existing Next.js app structure. New route at `/app/onboarding/story` under `(protected)` route group. Dedicated API routes under `/api/onboarding/story/` to avoid collision with existing onboarding routes. Scene components colocated in `scenes/` subfolder for organization. Shared constants extracted to `lib/story-onboarding/`.

## Routing Changes (Existing Files Modified)

Story onboarding **replaces** old onboarding as default entry for brand-new users:

| File | Current | Change |
|------|---------|--------|
| `app/(protected)/app/page.tsx:16` | `redirect('/app/onboarding')` | → `redirect('/app/onboarding/story')` |
| `app/(protected)/app/inventory/page.tsx` | No redirect | Add brand-new user check → redirect to `/app/onboarding/story` |
| `app/(protected)/app/recipes/page.tsx` | No redirect | Add brand-new user check → redirect to `/app/onboarding/story` |

Brand-new user detection: `recipeCount === 0 && inventoryCount === 0` (reuse `getUserCounts()` from `cooking-log` actions).

## Scene 7 CTAs

Two CTAs (updated from spec):
1. **"Get started →"** — Pre-fill demo data for brand-new users → redirect to `/app`
2. **"Tell us what you can cook blindfolded!"** — Redirect to `/app/recipes` (skip pre-fill, user adds own recipes)

"Restart demo" = clear localStorage only, no server call, return to Scene 1.

## Loading Screen Copy (Brand-New User Pre-Fill)

```
Setting up your kitchen...

We're adding the ingredients and recipe from Sarah's story
to your account so you can start cooking right away.

Don't worry — you can add your own recipes by voice anytime,
and update or remove these items from your inventory later.
```

## Complexity Tracking

No constitution violations to justify.
