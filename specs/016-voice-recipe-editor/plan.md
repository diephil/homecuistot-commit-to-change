# Implementation Plan: Voice Recipe Editor

**Branch**: `016-voice-recipe-editor` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-voice-recipe-editor/spec.md`

## Summary

Add voice/text editing to recipe update form. Reuse existing `QuickInputSection` component. Create new `recipe-updater` LLM prompt that receives current recipe state + user input, outputs complete updated recipe. Validate ingredients against DB. Preview changes before save. Trace via Opik with `recipe-updater` tags.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16, @google/genai (Gemini 2.0 Flash), Zod, opik-gemini
**Storage**: Supabase PostgreSQL via Drizzle (existing recipes, ingredients tables)
**Testing**: Manual testing (MVP phase)
**Target Platform**: Web (Next.js App Router)
**Project Type**: web (monorepo)
**Performance Goals**: <3s LLM response time
**Constraints**: Voice <60s, audio/webm format, Gemini JSON schema (no enums)
**Scale/Scope**: Single feature, ~8 files modified/created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ Pass | Ship working feature, manual testing |
| II. Pragmatic Type Safety | ✅ Pass | Strict at API boundaries, Zod schemas |
| III. Essential Validation | ✅ Pass | Validate user input (currentRecipe, audio/text) |
| IV. Test-Ready Infrastructure | ✅ Pass | No tests required for MVP |
| V. Type Derivation | ✅ Pass | Use existing `RecipeExtraction` schema, derive types |
| VI. Named Parameters | ✅ Pass | All functions use named params |
| VII. Vibrant Neobrutalism | ✅ Pass | Reuse existing UI components |

**Non-Negotiable Safeguards**:
- ✅ No user data loss - validate before save
- ✅ No auth bypass - routes use existing auth
- ✅ No SQL injection - Drizzle ORM parameterized
- ✅ No exposed secrets - env vars for API keys

## Project Structure

### Documentation (this feature)

```text
specs/016-voice-recipe-editor/
├── plan.md              # This file
├── research.md          # Phase 0 output (complete)
├── data-model.md        # Phase 1 output (complete)
├── quickstart.md        # Phase 1 output (complete)
├── contracts/           # Phase 1 output (complete)
│   └── api.yaml
└── tasks.md             # Phase 2 output (run /speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── lib/prompts/
│   ├── recipe-editor/        # Existing (creation)
│   │   ├── prompt.ts
│   │   └── process.ts
│   └── recipe-updater/       # NEW (update)
│       ├── prompt.ts         # LLM prompt definition
│       └── process.ts        # processVoiceRecipeUpdate, processTextRecipeUpdate
├── app/api/recipes/
│   ├── process-voice/        # Existing
│   ├── process-text/         # Existing
│   ├── update-voice/         # NEW
│   │   └── route.ts
│   └── update-text/          # NEW
│       └── route.ts
├── lib/prompts/recipe-editor/
│   └── prompt.ts             # Add "creation" tag + mode metadata
├── types/
│   └── recipes.ts            # Add RecipeState schema
└── components/recipes/
    └── recipe-form.tsx       # Modify for edit mode voice/text
```

**Structure Decision**: Web application with existing Next.js App Router structure. No new directories beyond `recipe-updater/`.

## Complexity Tracking

No violations - feature follows existing patterns.

## Implementation Phases

### Phase 1: LLM Prompt & Process Functions

1. Create `src/lib/prompts/recipe-updater/prompt.ts`
   - Define `RECIPE_UPDATER_PROMPT` with name, tags, metadata
   - Tags: `["recipe", "update", "voice-input", "gemini"]`
   - Metadata includes `mode: "update"`

1b. Update `src/lib/prompts/recipe-editor/prompt.ts`
   - Add `"creation"` to tags: `["recipe", "creation", "voice-input", "gemini"]`
   - Add `mode: "creation"` to metadata

2. Create `src/lib/prompts/recipe-updater/process.ts`
   - `processVoiceRecipeUpdate({ currentRecipe, audioBase64 })`
   - `processTextRecipeUpdate({ currentRecipe, text })`
   - Use `trackGemini()` for Opik tracing
   - Call `trackedGenAI.flush()` after generation

### Phase 2: API Routes

3. Create `src/app/api/recipes/update-voice/route.ts`
   - POST handler
   - Validate request body (currentRecipe + audioBase64)
   - Call `processVoiceRecipeUpdate()`
   - Return updated recipe state

4. Create `src/app/api/recipes/update-text/route.ts`
   - POST handler
   - Validate request body (currentRecipe + text)
   - Call `processTextRecipeUpdate()`
   - Return updated recipe state

### Phase 3: Types & Schemas

5. Update `src/types/recipes.ts`
   - Add `recipeStateSchema` (input to LLM)
   - Add `recipeUpdateRequestSchema` (API request)
   - Export types via inference

### Phase 4: UI Integration

6. Modify `src/components/recipes/recipe-form.tsx`
   - Add `stage` state: `"form" | "processing" | "preview"`
   - Enable `QuickInputSection` for edit mode (remove `!isEditMode` condition)
   - Add `handleVoiceComplete` for edit mode → POST to `/api/recipes/update-voice`
   - Add `handleTextSubmit` for edit mode → POST to `/api/recipes/update-text`
   - Add preview state showing proposed changes
   - Add save/dismiss actions from preview

### Phase 5: Validation & Polish

7. Integrate ingredient validation
   - After LLM response, call `validateIngredients()`
   - Show toast for unrecognized ingredients
   - Map matched ingredients with IDs

## Dependencies Between Phases

```
Phase 1 (prompt) → Phase 2 (routes) → Phase 4 (UI)
                ↘                   ↗
                  Phase 3 (types)
```

Phase 5 depends on Phase 4.

## Acceptance Criteria Mapping

| Spec Requirement | Implementation |
|-----------------|----------------|
| FR-001: Voice input | `QuickInputSection` + `/api/recipes/update-voice` |
| FR-002: Text input | `QuickInputSection` + `/api/recipes/update-text` |
| FR-003: Toggle modes | `QuickInputSection` built-in toggle |
| FR-004: Send current state | `currentRecipe` in API request |
| FR-005: Modify only mentioned | LLM prompt instruction |
| FR-006: Preserve unmentioned | LLM prompt instruction |
| FR-007: Validate ingredients | Existing `validateIngredients()` |
| FR-008: Display unrecognized | Toast notification |
| FR-009: Maintain optional flags | LLM preserves unless changed |
| FR-010: Loading state | `stage === "processing"` skeleton |
| FR-011: Error messages | Toast on API errors |
| FR-012: Prevent zero ingredients | Form validation before save |
| FR-013: Opik registration | Prompt with tags: `"update"` in recipe-updater, `"creation"` in recipe-editor |

## Unresolved Questions

None - all technical decisions resolved in research.md.
