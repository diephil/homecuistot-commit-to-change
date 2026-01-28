# Implementation Plan: App Page Revamp

**Branch**: `015-app-page-revamp` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-app-page-revamp/spec.md`

## Summary

Revamp the main /app page to show recipe availability based on user inventory. Add persistent navigation header across all /app routes with active state highlighting. Implement "Mark as Cooked" modal with ingredient quantity adjustment and cooking log integration. Redirect users without recipes/inventory to onboarding.

**Key User Input Additions**:
- Neo-brutalism design for all UI components (thick borders, shadows, vibrant colors)
- Reusable shared components where applicable
- Page sections ordered: Available → Almost Available → Cooking History (table, last 10)
- Mark as Cooked modal shows inventory diff with decrement preview and adjustable quantities

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16 App Router, Tailwind CSS v4, RetroUI components, Drizzle ORM 0.45.1
**Storage**: Supabase PostgreSQL via Drizzle (cooking_log, user_inventory, recipe_ingredients tables exist)
**Testing**: Manual testing for MVP (test infrastructure ready)
**Target Platform**: Web (responsive mobile-first)
**Project Type**: Web application (Next.js monorepo)
**Performance Goals**: Page load <2s, modal interactions <500ms
**Constraints**: MVP timeline - ship working features over perfect code
**Scale/Scope**: Single user context, ~50 recipes max, ~100 inventory items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First Development | ✅ Pass | Focus on happy paths, working features |
| II. Pragmatic Type Safety | ✅ Pass | Types at boundaries (API), derive from Drizzle schema |
| III. Essential Validation Only | ✅ Pass | Validate quantity 0-3 range at API boundary |
| IV. Test-Ready Infrastructure | ✅ Pass | Manual testing acceptable |
| V. Type Derivation Over Duplication | ✅ Pass | Use Drizzle schema inference |
| VI. Named Parameters for Clarity | ✅ Pass | Apply to new functions with 3+ params |
| VII. Vibrant Neobrutalism Design | ✅ Pass | Reuse RetroUI components, thick borders, shadows |
| Non-Negotiable Safeguards | ✅ Pass | No data loss, parameterized queries via Drizzle |

**All gates pass. Proceeding to Phase 0.**

### Post-Phase 1 Re-check

| Principle | Status | Design Validation |
|-----------|--------|-------------------|
| V. Type Derivation | ✅ Pass | Types in cooking.ts derive from existing schema patterns |
| VI. Named Parameters | ✅ Pass | `markRecipeAsCooked({ recipeId, recipeName, ingredientUpdates })` |
| VII. Neobrutalism | ✅ Pass | Card patterns follow constitution examples exactly |

**Phase 1 design validated. Ready for /speckit.tasks.**

## Project Structure

### Documentation (this feature)

```text
specs/015-app-page-revamp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── app/
│   ├── (protected)/app/
│   │   ├── layout.tsx           # MODIFY: Add AppNavigation component
│   │   ├── page.tsx             # MODIFY: Revamp with 4 sections (available, almost-available, cooking history table)
│   │   ├── recipes/page.tsx     # EXISTS: No changes needed
│   │   └── inventory/page.tsx   # EXISTS: No changes needed
│   ├── actions/
│   │   ├── recipes.ts           # MODIFY: Add availability queries
│   │   └── cooking-log.ts       # CREATE: Log cooking + update inventory
│   └── api/
│       └── cooking-log/
│           └── route.ts         # CREATE: POST endpoint for cooking log
├── components/
│   ├── app/
│   │   ├── app-navigation.tsx       # CREATE: Shared nav header
│   │   ├── recipe-availability-card.tsx  # CREATE: Available/almost-available card
│   │   ├── mark-cooked-modal.tsx    # CREATE: Cooking confirmation modal
│   │   └── cooking-history-table.tsx    # CREATE: Neo-brutalist table for last 10 logs
│   └── shared/
│       └── (existing components)    # REUSE: FormModal, IngredientBadge
├── db/schema/
│   └── cooking-log.ts           # EXISTS: No schema changes needed
└── types/
    └── cooking.ts               # CREATE: Cooking-related types
```

**Structure Decision**: Web application with Next.js App Router. Extending existing component structure with new `/components/app/` directory for app-specific components.

## Complexity Tracking

No violations - all gates pass. Feature uses existing patterns and infrastructure.
