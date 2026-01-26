# Implementation Plan: User Pantry Staples

**Branch**: `010-user-pantry-staples` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Replace isAssumed with user-specific pantry staples + remove aliases + separate pantry/fridge in UI

## Summary

Add `userPantryStaples` table for user-specific "always have" ingredients, remove `ingredientAliases` table, and update the onboarding Review & Refine view to display ingredients separated by storage location (pantry vs fridge). LLM structured output must include storage location for each detected ingredient.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16, Drizzle ORM 0.45.1, Zod, @google/genai (Gemini)
**Storage**: Supabase PostgreSQL via Drizzle
**Testing**: Manual (MVP phase per constitution)
**Target Platform**: Web (Next.js App Router)
**Project Type**: Monorepo (apps/nextjs/)
**Performance Goals**: <2s ingredient add/remove (per SC-001)
**Constraints**: MVP timeline, vibrant neobrutalism design system
**Scale/Scope**: Single user flow (onboarding step 3)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ Pass | Feature completeness focus, happy path first |
| II. Pragmatic Type Safety | ✅ Pass | Types at boundaries (Zod schema), strict internal |
| III. Essential Validation | ✅ Pass | Validate LLM output via Zod schema |
| IV. Test-Ready | ✅ Pass | Manual testing acceptable |
| V. Type Derivation | ✅ Pass | Derive types from Zod schemas |
| VI. Named Parameters | ✅ Pass | Will use object params for 3+ args |
| VII. Neobrutalism | ✅ Pass | UI follows existing neobrutalist patterns |
| Non-Negotiables | ✅ Pass | No data loss (cascade deletes), no auth bypass |

## Project Structure

### Documentation (this feature)

```text
specs/010-user-pantry-staples/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── ingredients.ts      # MODIFY: remove ingredientAliases
│   │   │   ├── user-pantry-staples.ts  # NEW: userPantryStaples table
│   │   │   └── index.ts            # MODIFY: export new table
│   │   └── migrations/             # NEW: migration for schema changes
│   ├── types/
│   │   └── onboarding.ts           # MODIFY: add storageLocation to schema
│   ├── lib/prompts/
│   │   ├── onboarding-text/
│   │   │   └── process.ts          # MODIFY: update schema for storage
│   │   └── onboarding-voice/
│   │       └── process.ts          # MODIFY: update schema for storage
│   └── app/(protected)/app/
│       └── onboarding/
│           └── page.tsx            # MODIFY: separate pantry/fridge display
```

**Structure Decision**: Monorepo with Next.js app in apps/nextjs/. Database schema in src/db/schema/, types derived from Zod in src/types/.

## Complexity Tracking

No constitution violations. All changes follow existing patterns.

---

## Phase 0: Research

### Research Tasks

1. **Drizzle migration pattern** - How to drop table + add table in single migration
2. **Zod schema for storage location** - Enum or literal union for pantry/fridge
3. **Gemini structured output** - Best prompt format for storage location classification

### Findings

See [research.md](./research.md) for detailed findings.

---

## Phase 1: Design

### Database Changes

1. **Remove** `ingredientAliases` table and relations
2. **Add** `userPantryStaples` table (schema provided by user)

### Schema Changes

1. **Update** `OnboardingUpdateSchema` to include storage location per ingredient

### UI Changes

1. **Update** Review & Refine view to show two sections: "Pantry Items" / "Fridge Items"
2. **Update** state management to track pantry vs fridge separately

### LLM Prompt Changes

1. **Update** prompts to request storage location in output
2. **Update** responseSchema for Gemini to include storage location

See [data-model.md](./data-model.md) and [contracts/](./contracts/) for details.
