# Implementation Plan: Landing Page Revamp

**Branch**: `029-landing-page-revamp` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/029-landing-page-revamp/spec.md`

## Summary

Revamp the landing page (`src/app/page.tsx`) with new positioning copy, 3 new sections (anti-positioning comparison, product demo cards, Sarah story teaser), and updated how-it-works steps. Create a new reusable `LandingRecipeCard` component for the product demo section. No backend changes, no new dependencies.

**User directive**: Create reusable components first, then compose them in the landing page.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16 App Router, Tailwind CSS v4
**Storage**: N/A (static page, hardcoded mock data)
**Testing**: Manual visual testing (MVP phase)
**Target Platform**: Web (responsive, 320px-1920px)
**Project Type**: Web application (monorepo: `apps/nextjs/`)
**Performance Goals**: N/A (static server-rendered page)
**Constraints**: No new dependencies, no shared component modifications, neo-brutal design system
**Scale/Scope**: 2 files changed (1 edit, 1 create)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Pure frontend copy + 1 component, minimal scope |
| II. Pragmatic Type Safety | PASS | Simple props interface, no complex types needed |
| III. Essential Validation | PASS | No user input, no database, no validation needed |
| IV. Test-Ready Infrastructure | PASS | Manual visual testing sufficient for static page |
| V. Type Derivation | PASS | Simple interface, no duplication risk |
| VI. Named Parameters | PASS | LandingRecipeCard uses single props object |
| VII. Vibrant Neobrutalism | PASS | Extends existing design system patterns |

**Gate result**: ALL PASS. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/029-landing-page-revamp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (apps/nextjs/)

```text
apps/nextjs/src/
├── app/
│   └── page.tsx                          # EDIT: Rewrite all 7 sections
├── components/
│   ├── landing/
│   │   └── LandingRecipeCard.tsx         # CREATE: New presentation-only card
│   └── shared/
│       ├── Badge.tsx                     # EXISTING: Used in LandingRecipeCard
│       ├── Button.tsx                    # EXISTING: Used in CTAs
│       ├── Text.tsx                      # EXISTING: Used in all sections
│       ├── Header.tsx                    # EXISTING: Used as-is
│       ├── Footer.tsx                    # EXISTING: Used as-is
│       └── index.ts                     # EXISTING: No changes needed
```

**Structure Decision**: Follows existing project organization. New `landing/` domain folder for page-specific component per CLAUDE.md rules (used by 1 page = domain folder).

## Implementation Approach

Per user directive, build reusable components first, then compose:

### Step 1: Create `LandingRecipeCard` component
- Props: `{ name, description, ingredients[], status }`
- Status-based background gradient (green/yellow/gray)
- Status badge (Ready tonight / Missing N)
- Ingredient list with availability + anchor/optional indicators
- Uses existing `Badge` from shared
- No interactivity (read-only, static)

### Step 2: Rewrite `page.tsx` with all 7 sections
- Import `LandingRecipeCard` + existing shared components
- Define `LANDING_RECIPES` mock data constant
- Section 1: Hero (new copy)
- Section 2: Reframe (new copy, replaces "problem" section)
- Section 3: Anti-Positioning (NEW — two-column comparison)
- Section 4: How It Works (updated copy, same visual pattern)
- Section 5: Product Demo (NEW — 3x LandingRecipeCard)
- Section 6: Sarah Story Teaser (NEW — narrative + CTA)
- Section 7: Final CTA (updated copy)

## Complexity Tracking

> No violations. Table intentionally empty.
