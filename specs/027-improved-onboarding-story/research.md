# Research: Improved Onboarding Story

## R1: Recipe Orchestration Tag Pattern

**Decision**: Add `additionalTags?: string[]` to `CreateRecipeProposalParams`, matching the inventory orchestration pattern exactly.

**Rationale**: Inventory orchestration already uses `additionalTags` (line 24, 48, 59 of `inventory-update.orchestration.ts`). Recipe orchestration uses `isOnBoarding?: boolean` which only adds `["onboarding"]`. Adding `additionalTags` gives fine-grained control for scene-level tagging.

**Alternatives considered**:
- Keep `isOnBoarding` and add scene identifier separately → inconsistent with inventory pattern
- Replace `isOnBoarding` with `additionalTags` entirely → breaking change for existing callers

**Implementation**: Add `additionalTags?: string[]` to params, spread into `traceTags` after the `isOnBoarding` spread. Callers pass `additionalTags: ["onboarding-story-scene2"]` or `["onboarding-story-scene7"]`.

## R2: Recipe Voice Input API Route

**Decision**: Reuse existing `/api/onboarding/process-recipe/route.ts` for both Scene 2 and Scene 7. No new API route needed.

**Rationale**: The existing route already:
- Calls `createRecipeManagerAgentProposal` with `isOnBoarding: true`
- Applies proposal in-memory (no DB writes)
- Returns `{ recipes, transcribedText, assistantResponse, noChangesDetected }`
- Accepts `trackedRecipes` array for context

**Alternatives considered**:
- New `/api/onboarding/story/process-recipe-input` route → duplication of existing route logic
- Inline the orchestration call in a server action → breaks API route tracing pattern

**Change needed**: Pass `additionalTags` through to the orchestration call. Add an optional `additionalTags` field to the request body schema.

## R3: Scene 2 Validation Gate

**Decision**: Create a new `hasRequiredRecipeItems()` function in `transforms.ts` that validates extracted recipe ingredients against `REQUIRED_RECIPE_ITEMS`.

**Rationale**: Mirrors `hasRequiredItems()` for inventory but operates on `DemoRecipe.ingredients` instead of `DemoInventoryItem[]`. Separate function because the data shape and matching rules differ (ingredient name matching with alternates like egg/eggs, bacon/guanciale).

**Alternatives considered**:
- Inline validation in Scene2 component → not reusable, harder to test
- Extend `hasRequiredItems()` with overloads → different data shapes make this confusing

## R4: State Shape Extension

**Decision**: Extend `StoryOnboardingState` with:
- `currentScene: 1-8` (was 1-7)
- `demoRecipes: DemoRecipe[]` (all recipes including carbonara + user's)
- `recipeVoiceDone: boolean` (Scene 2 gate flag)
- `userRecipesAdded: boolean` (Scene 7 gate flag)

**Rationale**: Follows existing pattern. `demoRecipe` (singular) stays for backward compat during cooking logic. `demoRecipes` (plural) accumulates all recipes for the completion payload.

**Alternatives considered**:
- Replace `demoRecipe` with `demoRecipes[0]` → breaks Scene 5/6 cooking logic that expects a single recipe reference

## R5: Completion Redirect Target

**Decision**: Change redirect from `/app/recipes` to `/app`.

**Rationale**: Spec FR-017 requires redirect to "main app view". `/app` is the main app route. Current redirect to `/app/recipes` was appropriate when only 1 recipe was added; with multiple recipes + inventory, the main dashboard is more appropriate.

**Alternatives considered**:
- Keep `/app/recipes` → doesn't match spec, less holistic entry point
- `/app/inventory` → partial view, not the main app

## R6: Manifesto Payload Update

**Decision**: Manifesto (now Scene 8) sends `demoRecipes` array (all recipes) instead of single `demoRecipe`. The existing `StoryCompleteRequestSchema` already accepts a `recipes` array, so no schema change needed.

**Rationale**: Completion endpoint already handles multiple recipes via `prefillDemoData`. The payload shape already supports arrays. Only the frontend needs to send all recipes instead of wrapping a single recipe.

## R7: Scene 3 Merged Content

**Decision**: Create `Scene3StoreKitchen.tsx` that combines store narrative (old Scene 3) + kitchen display (old Scene 2) into one component. Delete `Scene2Inventory.tsx` and `Scene3Store.tsx`.

**Rationale**: Spec requires store narrative first, then kitchen display. Old Scene 2 (kitchen) and old Scene 3 (store) are simple enough to merge. Kitchen display now uses AI-extracted recipe from Scene 2 state instead of hardcoded `CARBONARA_RECIPE`.

## R8: VoiceTextInput Reuse

**Decision**: Reuse `VoiceTextInput` component directly in Scene 2 and Scene 7, same as Scene 4 does. No modifications to the shared component needed.

**Rationale**: VoiceTextInput already supports all needed features: voice/text toggle, processing state, last transcription display, disabled state. Scene-specific behavior (validation, recipe display) lives in the scene component wrapper.
