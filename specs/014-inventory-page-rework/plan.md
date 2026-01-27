# Implementation Plan: Inventory Page Rework

**Branch**: `014-inventory-page-rework` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-inventory-page-rework/spec.md`

## Summary

Rework inventory page with real database integration replacing mock data. Add voice/text-based inventory updates via LLM ingredient parsing with quantity level detection. Display ingredients in two sections (Available/Pantry Staples) using IngredientBadge "dots" variant. Implement confirmation flow for bulk updates with unrecognized ingredient handling.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16, Drizzle ORM 0.45.1, @google/genai (Gemini 2.0 Flash), Zod, Opik
**Storage**: Supabase PostgreSQL via Drizzle ORM (user_inventory, ingredients tables)
**Testing**: Manual testing (MVP phase per constitution)
**Target Platform**: Web (mobile-first responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Voice-to-proposal <5s, page load <2s, quantity change <3 taps
**Constraints**: Quantity levels 0-3, 60s max voice recording, 5931 ingredient database
**Scale/Scope**: Single user inventory view, bulk updates via natural language

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First Development | ✅ PASS | Reusing existing infrastructure (voice input, Gemini, badges) |
| II. Pragmatic Type Safety | ✅ PASS | Zod schemas for LLM output validation |
| III. Essential Validation Only | ✅ PASS | Validate LLM output, DB operations; skip internal |
| IV. Test-Ready Infrastructure | ✅ PASS | Manual testing acceptable per MVP constraints |
| V. Type Derivation Over Duplication | ✅ PASS | Will derive from Zod schemas |
| VI. Named Parameters for Clarity | ✅ PASS | Apply to new functions with 3+ args |
| VII. Vibrant Neobrutalism Design | ✅ PASS | Use existing RetroUI components, dots variant |
| Non-Negotiables | ✅ PASS | No auth bypass, parameterized queries via Drizzle |

## Project Structure

### Documentation (this feature)

```text
specs/014-inventory-page-rework/
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
│   ├── (protected)/app/inventory/
│   │   └── page.tsx                    # Reworked inventory page
│   └── api/inventory/
│       ├── route.ts                    # Existing GET/POST
│       ├── process-voice/route.ts      # NEW: Voice → ingredients
│       └── process-text/route.ts       # NEW: Text → ingredients
├── components/
│   ├── inventory/                      # NEW: Feature components
│   │   ├── inventory-section.tsx       # Section wrapper (Available/Staples)
│   │   ├── inventory-update-modal.tsx  # Voice/text input modal
│   │   ├── update-confirmation.tsx     # Review proposed changes
│   │   ├── quantity-selector.tsx       # Manual quantity adjustment
│   │   └── help-modal.tsx              # Feature explanation
│   └── retroui/
│       └── IngredientBadge.tsx         # Existing (dots variant)
├── hooks/
│   └── useVoiceInput.ts                # Existing (reuse)
├── lib/prompts/
│   └── inventory-update/               # NEW: LLM prompt
│       ├── prompt.ts                   # Prompt definition (Opik-compatible)
│       └── process.ts                  # Gemini integration
├── types/
│   └── inventory.ts                    # NEW: Type definitions
└── scripts/
    └── register-inventory-prompt.ts    # NEW: Opik prompt registration
```

**Structure Decision**: Extends existing web application structure. New components in dedicated `inventory/` folder for feature isolation. Reuses existing patterns from `recipes/` folder.

**npm Scripts** (add to `package.json`):
- `prompt:inventory`: Register prompt to local Opik
- `prompt:inventory:prod`: Register prompt to production Opik
- Update `prompt:all` / `prompt:all:prod` to include inventory

## Complexity Tracking

No violations. All patterns follow existing codebase conventions.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. MVP-First | ✅ PASS | No new dependencies; reuses VoiceInput, Gemini patterns |
| II. Type Safety | ✅ PASS | Zod schemas defined in data-model.md; types derived |
| III. Validation | ✅ PASS | Validates: LLM output, ingredient names, DB ops |
| IV. Test-Ready | ✅ PASS | Manual testing checklist in quickstart.md |
| V. Type Derivation | ✅ PASS | All types derive from Zod schemas |
| VI. Named Params | ✅ PASS | Component props use object destructuring |
| VII. Neobrutalism | ✅ PASS | Uses existing RetroUI; shadows, borders, dots variant |
| Non-Negotiables | ✅ PASS | Drizzle parameterized queries; RLS via token |

**No Gate Violations** - Proceed to task generation.

---

## Artifacts Generated

| Artifact | Path | Status |
|----------|------|--------|
| Plan | `specs/014-inventory-page-rework/plan.md` | ✅ Complete |
| Research | `specs/014-inventory-page-rework/research.md` | ✅ Complete |
| Data Model | `specs/014-inventory-page-rework/data-model.md` | ✅ Complete |
| API Contracts | `specs/014-inventory-page-rework/contracts/api.md` | ✅ Complete |
| Component Contracts | `specs/014-inventory-page-rework/contracts/components.md` | ✅ Complete |
| Quickstart | `specs/014-inventory-page-rework/quickstart.md` | ✅ Complete |
| Tasks | `specs/014-inventory-page-rework/tasks.md` | ⏳ Pending (/speckit.tasks) |
