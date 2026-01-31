# Implementation Plan: Onboarding Steps 2 & 3 Revamp

**Branch**: `019-onboarding-revamp` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-onboarding-revamp/spec.md`

## Summary

Revamp onboarding steps 2-3 with cooking skill selection (Basic/Advanced), 17-ingredient multi-select, and refined voice/text ingredient detection returning structured add/remove arrays. Static dishes/ingredients with anchor/optional markers enable pre-populated recipe creation on completion.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16, Drizzle ORM 0.45.1, @google/genai (Gemini 2.0 Flash), Zod, opik-gemini
**Storage**: Supabase PostgreSQL via Drizzle (user_inventory, ingredients, unrecognized_items, user_recipes, recipe_ingredients)
**Testing**: Manual testing (MVP phase per constitution)
**Target Platform**: Web (mobile-first responsive)
**Project Type**: Web application (monorepo: apps/nextjs/)
**Performance Goals**: Voice processing <5s, toast <500ms
**Constraints**: 60s max recording, 17 static ingredients, 8+8 static recipes
**Scale/Scope**: Single user onboarding flow, 5931 existing ingredients in DB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | Focus on happy paths; edge cases documented but deferred unless critical |
| II. Pragmatic Type Safety | ✅ PASS | Zod schemas at boundaries; internal types derived |
| III. Essential Validation | ✅ PASS | Validate DB inputs (ingredients, recipes); skip internal calls |
| IV. Test-Ready | ✅ PASS | Manual testing acceptable per MVP phase |
| V. Type Derivation | ✅ PASS | Derive from Zod schemas (OnboardingUpdateSchema, static dish types) |
| VI. Named Parameters | ✅ PASS | Follow existing patterns (3+ args → object params) |
| VII. Neobrutalism Design | ✅ PASS | Follow existing vibrant neobrutalism (thick borders, shadows, bright colors) |
| Non-Negotiables | ✅ PASS | No data loss, parameterized queries, env vars for secrets |

## Project Structure

### Documentation (this feature)

```text
specs/019-onboarding-revamp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── app/
│   ├── (protected)/app/onboarding/
│   │   └── page.tsx              # MODIFY: Step 2 skill selection, step 3 revamp
│   └── api/onboarding/
│       ├── process-voice/route.ts  # MODIFY: New structured response
│       ├── process-text/route.ts   # MODIFY: New structured response
│       └── persist/route.ts        # MODIFY: Use static recipes, ingredient matching
├── components/
│   └── shared/                   # NEW: Reusable onboarding components
│       ├── IngredientChip.tsx    # NEW: Shared ingredient display
│       └── VoiceTextInput.tsx    # NEW: Mic + text fallback input (reusable)
├── constants/
│   └── onboarding.ts             # MODIFY: Add static ingredients, static dishes with ingredients
├── hooks/
│   └── useVoiceInput.ts          # EXISTING: Reuse unchanged
├── lib/
│   ├── prompts/
│   │   ├── onboarding-voice/
│   │   │   ├── prompt.ts         # MODIFY: Update for add/remove ingredient-only extraction
│   │   │   └── process.ts        # EXISTING: Minor update to schema
│   │   └── onboarding-text/
│   │       ├── prompt.ts         # MODIFY: Same as voice
│   │       └── process.ts        # EXISTING: Minor update to schema
│   └── services/
│       └── ingredient-matcher.ts # NEW: Shared helper for DB matching
└── types/
    └── onboarding.ts             # MODIFY: Add new types for static dishes
```

**Structure Decision**: Web application using existing Next.js App Router structure. New reusable components in `components/shared/`, new service in `lib/services/`.

## Complexity Tracking

No constitution violations requiring justification.

## Post-Design Constitution Re-Check

| Principle | Status | Design Verification |
|-----------|--------|---------------------|
| I. MVP-First | ✅ PASS | Static recipes eliminate LLM generation complexity; manual testing sufficient |
| II. Pragmatic Type Safety | ✅ PASS | Zod schemas for API boundaries; TypeScript interfaces for static data |
| III. Essential Validation | ✅ PASS | DB inputs validated via Zod; case-insensitive matching handles user typos |
| IV. Test-Ready | ✅ PASS | Checklist in quickstart.md; test infrastructure exists |
| V. Type Derivation | ✅ PASS | `IngredientExtractionResponse` derived from Zod schema |
| VI. Named Parameters | ✅ PASS | `matchIngredients({ names, userId })` pattern used |
| VII. Neobrutalism Design | ✅ PASS | IngredientChip follows existing border/shadow patterns |
| Non-Negotiables | ✅ PASS | Transaction wraps multi-table inserts; parameterized queries for matching |

## Unresolved Questions

None. All clarifications resolved in research.md.
