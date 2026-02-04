# Research: 025-onboarding-integration

**Date**: 2026-02-04

## Decision 1: Route Restructuring Strategy

**Decision**: Swap the `/onboarding` page.tsx to render `StoryOnboarding` instead of `OnboardingPageContent`. Keep old code files untouched per user request.

**Rationale**: Minimal change — only `page.tsx` import changes. The server-side guard (`hasCompletedOnboarding`), `ErrorBoundary`, and `OnboardingGuard` are all reusable and stay in place. The `/onboarding/story/` sub-directory becomes dead code (no route references it once page.tsx is updated).

**Alternatives considered**:
- Move story files into `/onboarding/` root → unnecessary file churn, story files already work from their current location via imports
- Create redirect from `/onboarding` to `/onboarding/story` → adds a redirect hop, worse UX

## Decision 2: QuantityLevel Extraction Approach (UPDATED)

**Decision**: Reuse `inventory-update.orchestration.ts` instead of modifying `ingredient-extractor`. The orchestration already handles quantity detection via the ADK InventoryAgent and returns `ValidatedInventoryUpdate[]` with `proposedQuantity` (0-3). Add "onboarding-story" tag to differentiate traces.

**Rationale**: The `inventory-update.orchestration.ts` already does everything we need:- Voice/text transcription via `voiceTranscriptorAgent`- Ingredient extraction WITH quantity levels via ADK InventoryAgent- Returns `ValidatedInventoryUpdate` with `proposedQuantity` (0-3)- Proper Opik tracing with tags and metadata
- Validation against ingredients database
- Unrecognized item handling

No need to duplicate this functionality in `ingredient-extractor`. Just add "onboarding-story" tag to distinguish onboarding traces from regular inventory update traces.

**Alternatives considered**:
- ~~Extend ingredient-extractor LLM schema~~ → duplicates existing functionality
- ~~Client-side quantity word parsing~~ → fragile, can't handle multilingual
- ~~Separate LLM call for quantities~~ → unnecessary latency

**Architecture**:
- `process-input` route calls `createInventoryManagerAgentProposal({ ..., tags: ["onboarding-story"] })`
- Response has `ValidatedInventoryUpdate[]` with `proposedQuantity`
- Transform to `{ name, quantityLevel }[]` for frontend compatibility

## Decision 3: Schema Extension Pattern (UPDATED - NO LONGER NEEDED)

**Decision**: No new schema needed. Reusing `InventoryUpdateProposal` from `inventory-update.orchestration.ts` which already has `ValidatedInventoryUpdate[]` with `proposedQuantity`.

**Rationale**: Since we're reusing the orchestration, we get the quantity data from `ValidatedInventoryUpdate.proposedQuantity`. The process-input route will transform this to the format the frontend expects: `{ name, quantityLevel }[]`.

## Decision 4: Completion Payload Extension

**Decision**: Extend `StoryCompleteRequestSchema` to accept `ingredients` as `Array<{ name, quantityLevel }>` instead of `Array<string>`. Update `prefillDemoData` to accept and use per-item quantityLevel.

**Rationale**: The `DemoInventoryItem` type already carries `quantityLevel` through the entire story flow. Scene7 just needs to serialize it into the payload. The `prefillDemoData` service already has the insertion logic — only the hardcoded `3` values need replacing with the passed-in quantities.

**Alternatives considered**:
- Send full `DemoInventoryItem[]` → over-exposes client state shape to API boundary
- Compute quantities server-side from story constants → server would need full story simulation logic

## Decision 5: Start Onboarding Button Behavior

**Decision**: Convert `StartDemoButton` to a client-only component: clear localStorage + redirect to `/onboarding`. No server action calls. Rename to "Start Onboarding".

**Rationale**: Per clarification, no DB reset needed. The story onboarding flow handles everything. If user has existing data, story completion skips persistence (isNewUser check). This is intentional — returning users get a cosmetic walkthrough.

## Reusable Code Inventory

### Components (REUSE AS-IS)
- `StoryOnboarding.tsx` — main orchestrator, no changes needed
- `StoryProgressBar.tsx` — visual progress, no changes needed
- `Scene1Dilemma.tsx` through `Scene3Store.tsx` — narrative scenes, no changes
- `Scene5Ready.tsx`, `Scene6Cooked.tsx` — cook flow, no changes
- `OnboardingGuard.tsx` — bfcache guard, reuse in new page.tsx
- `ErrorBoundary.tsx` — error boundary wrapper, reuse
- `ConfirmationModal` — reuse for StartOnboarding button
- `VoiceTextInput` — shared voice/text input, no changes
- `InventoryItemBadge` — shared display, no changes

### Services (REUSE WITH MODIFICATION)
- `prefillDemoData` — modify to accept per-item quantityLevel
- `createInventoryManagerAgentProposal` — reuse as-is with "onboarding-story" tag

### Services (REUSE AS-IS)
- `voiceTranscriptorAgent` — voice transcription (used by orchestration)
- `createInventoryAgent` — ADK inventory agent (used by orchestration)
- `ensureRecipeIngredientsAtQuantity` — recipe ingredient inventory creation
- `isNewUser` — brand-new user detection
- `resetUserData` — server action for DB reset
- `hasCompletedOnboarding` — onboarding completion check

### Hooks (REUSE AS-IS)
- `useStoryState` — localStorage state management
- `useFadeTransition` — scene transition animations

### Types (REUSE AS-IS)
- `DemoInventoryItem` — already has quantityLevel field
- `QuantityLevel` — 0 | 1 | 2 | 3 type
- `DemoRecipe`, `DemoRecipeIngredient` — recipe types

## Dead Code After Integration

The following files will become unused (kept per user request):

### Old Onboarding Components
- `apps/nextjs/src/app/(protected)/app/onboarding/OnboardingPageContent.tsx` — old 5-step wizard (862 lines)
- `apps/nextjs/src/constants/onboarding.ts` — COMMON_INGREDIENTS, PANTRY_STAPLES, BASIC_RECIPES, ADVANCED_RECIPES

### Old API Routes
- `apps/nextjs/src/app/api/onboarding/process-voice/` — old voice processing
- `apps/nextjs/src/app/api/onboarding/process-text/` — old text processing
- `apps/nextjs/src/app/api/onboarding/process-recipe/` — old recipe processing
- `apps/nextjs/src/app/api/onboarding/complete/` — old completion route
- `apps/nextjs/src/app/api/onboarding/persist/` — old persist route

### Old Story Sub-Route
- `apps/nextjs/src/app/(protected)/app/onboarding/story/page.tsx` — story page wrapper (no longer routed)

### Potentially Unused Server Actions
- `startDemoData()` in `app/actions/user-data.ts` — no longer called by any component
- `apps/nextjs/src/db/demo-data.ts` — DEMO_INVENTORY, DEMO_RECIPES (only used by startDemoData)
