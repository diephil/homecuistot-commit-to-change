# Implementation Plan: Onboarding Integration

**Branch**: `025-onboarding-integration` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-onboarding-integration/spec.md`

## Summary

Replace old onboarding wizard with the story-based flow at `/onboarding`, fix the quantityLevel bug (hardcoded 3 → LLM-extracted values), persist correct per-ingredient quantities on completion, add Opik trace metadata for unrecognized items, and update app page buttons (reset clears localStorage, "Start Demo" becomes "Start Onboarding" with client-only redirect).

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16 App Router, Drizzle ORM 0.45.1, @google/genai (Gemini 2.5-Flash-Lite), Zod, opik-gemini, OpenAI (Whisper)
**Storage**: Supabase PostgreSQL via Drizzle (no schema changes), localStorage (story state)
**Testing**: Manual testing (MVP phase per constitution)
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js monorepo at `apps/nextjs/`)
**Performance Goals**: Voice/text processing <15s (existing timeout)
**Constraints**: No database migrations needed. Old onboarding code kept untouched.
**Scale/Scope**: 11 files modified, 0 new files, 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Minimal changes, reuses existing components |
| II. Pragmatic Type Safety | PASS | Types at boundaries (Zod schemas), strict mode |
| III. Essential Validation | PASS | Zod validation on API request/response boundaries |
| IV. Test-Ready Infrastructure | PASS | Manual testing per MVP phase |
| V. Type Derivation | PASS | New types derived from Zod schemas via z.infer |
| VI. Named Parameters | PASS | prefillDemoData already uses named params |
| VII. Neo-Brutalist Design | N/A | No new UI components, existing styles preserved |

**Non-negotiable safeguards**:
- No user data loss: quantityLevel values flow correctly through the chain
- No auth bypasses: existing auth checks preserved on all routes
- No SQL injection: Drizzle ORM parameterized queries
- TypeScript compilation: all types properly defined

**Post-design re-check**: PASS — no new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/025-onboarding-integration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research & decisions
├── data-model.md        # Phase 1: data model changes
├── quickstart.md        # Phase 1: testing guide
├── contracts/
│   ├── process-input.md # API contract: process-input response extension
│   └── story-complete.md # API contract: complete request extension
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (not created by /speckit.plan)
```

### Source Code (files to modify)

```text
apps/nextjs/src/
├── app/(protected)/app/onboarding/
│   └── page.tsx                          # MODIFY: swap to StoryOnboarding
├── app/(protected)/app/onboarding/story/
│   └── scenes/
│       ├── Scene4Voice.tsx               # MODIFY: use returned quantityLevel
│       └── Scene7Manifesto.tsx           # MODIFY: include quantityLevel in payload
├── app/api/onboarding/story/
│   ├── process-input/route.ts            # MODIFY: return quantityLevel + Opik trace fix
│   └── complete/route.ts                 # MODIFY: parse extended schema
├── lib/
│   ├── agents/ingredient-extractor/
│   │   ├── agent.ts                      # MODIFY: use new schema
│   │   └── prompt.ts                     # MODIFY: add quantity extraction rules
│   ├── services/
│   │   └── demo-data-prefill.ts          # MODIFY: use per-item quantityLevel
│   └── story-onboarding/
│       └── types.ts                      # MODIFY: extend StoryCompleteRequestSchema
├── types/
│   └── onboarding.ts                     # MODIFY: add StoryIngredientExtractionSchema
└── components/app/
    ├── ResetUserDataButton.tsx            # MODIFY: add localStorage cleanup
    └── StartDemoButton.tsx               # MODIFY: rename + client-only redirect
```

**Structure Decision**: Existing monorepo structure at `apps/nextjs/`. No new directories or files — all changes are modifications to existing files.

## Dead Code After Integration (kept per user request)

| File | Reason |
|------|--------|
| `OnboardingPageContent.tsx` | Old wizard, replaced by StoryOnboarding |
| `constants/onboarding.ts` | COMMON_INGREDIENTS, recipes for old wizard |
| `api/onboarding/process-voice/` | Old voice route |
| `api/onboarding/process-text/` | Old text route |
| `api/onboarding/process-recipe/` | Old recipe route |
| `api/onboarding/complete/` | Old completion route |
| `api/onboarding/persist/` | Old persist route |
| `api/onboarding/status/` | Status check (may still be used by OnboardingGuard) |
| `onboarding/story/page.tsx` | Story sub-route page wrapper (unreachable) |
| `startDemoData()` action | No longer called |
| `db/demo-data.ts` | Demo data constants (only used by startDemoData) |

**Note**: `api/onboarding/status/` may still be used by `OnboardingGuard.tsx` — verify before marking dead.
