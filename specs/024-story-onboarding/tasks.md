# Tasks: Story-Based Onboarding

**Input**: Design documents from `/specs/024-story-onboarding/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not requested — manual testing per quickstart.md.

**Organization**: Tasks grouped by user story. Services-first: all reusable backend services and API routes built in foundational phase before any page/scene work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Directory structure, types, constants — zero logic, just scaffolding and static data

- [x] T001 Create directory structure: `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/`, `apps/nextjs/src/app/(protected)/app/onboarding/story/hooks/`, `apps/nextjs/src/app/api/onboarding/story/process-input/`, `apps/nextjs/src/app/api/onboarding/story/complete/`, `apps/nextjs/src/lib/story-onboarding/`
- [x] T002 [P] Define client-side types (`StoryOnboardingState`, `DemoInventoryItem`, `DemoRecipe`, `DemoRecipeIngredient`, `StoryCompleteRequest`) in `apps/nextjs/src/lib/story-onboarding/types.ts` — per data-model.md shapes. Add `StoryCompleteRequestSchema` (Zod) for server validation (same as `CompleteRequestSchema` but recipe ingredients have no `id` field)
- [x] T003 [P] Define demo data constants in `apps/nextjs/src/lib/story-onboarding/constants.ts` — Sarah's 7 tracked ingredients + 3 pantry staples (with name, category, quantityLevel, isPantryStaple per data-model.md table), carbonara recipe (4 anchors + 2 optionals), `REQUIRED_ITEMS: ['egg', 'parmesan']`, scene text content as string arrays for progressive fade-in, quantity word mappings (`QUANTITY_WORDS: Record<QuantityLevel, string>` = {0:'critical', 1:'low', 2:'some', 3:'plenty'}), `LOCALSTORAGE_KEY = 'homecuistot:story-onboarding'`
- [x] T004 [P] Define data transformation utilities in `apps/nextjs/src/lib/story-onboarding/transforms.ts` — `toInventoryDisplayItem(item, index): InventoryDisplayItem` and `toRecipeWithAvailability({recipe, inventory}): RecipeWithAvailability` per data-model.md code. Export helper `hasRequiredItems(inventory): boolean` that checks eggs + parmesan present with quantityLevel > 0

---

## Phase 2: Foundational (Reusable Services + API Routes + Hooks)

**Purpose**: All backend services and client hooks that user story scenes will consume. **No scene/page components in this phase.**

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Reusable Backend Services

- [x] T005 Implement `isNewUser` service in `apps/nextjs/src/lib/services/brand-new-user.ts` — export `async function isNewUser(params: {db: DrizzleDB}): Promise<boolean>` that counts `user_inventory` rows and `user_recipes` rows, returns `true` if both are 0. Uses parameterized Drizzle queries (same pattern as `getUserCounts()` in `apps/nextjs/src/app/actions/cooking-log.ts` but accepts a `db` param for reuse in API routes)
- [x] T006 Implement `prefillDemoData` service in `apps/nextjs/src/lib/services/demo-data-prefill.ts` — export `async function prefillDemoData(params: {db: DrizzleDB, userId: string, ingredients: string[], pantryStaples: string[], recipes: StoryCompleteRequest['recipes']}): Promise<{inventoryCreated: number, recipesCreated: number, unrecognizedIngredients: number, unrecognizedRecipeIngredients: number}>`. Wraps a single Drizzle transaction: calls `matchIngredients()` to resolve names → IDs, inserts `user_inventory` (quantityLevel=3, isPantryStaple for staples), creates `unrecognized_items` for unknown names, inserts `user_recipes` + `recipe_ingredients`, calls `ensureRecipeIngredientsAtQuantity()` from `@/db/services/ensure-recipe-ingredients-at-quantity`. Follow existing pattern from `apps/nextjs/src/app/api/onboarding/complete/route.ts`

### API Routes

- [x] T007 [P] Implement unified process-input route in `apps/nextjs/src/app/api/onboarding/story/process-input/route.ts` — single endpoint for both voice and text input. Auth check via `createClient()` + `getUser()`, parse `{audioBase64?, text?, currentIngredients}`, validate at least one of audio/text provided (400 if neither). Call `ingredientExtractorAgent()` directly from `@/lib/agents/ingredient-extractor/agent` (it natively handles both `text` and `audioBase64` params). Create Opik trace via `createAgentTrace()` (same pattern as `processVoiceInput()`). Call `validateIngredientNames()` on results, return `{add, rm, transcribedText, unrecognized}`. `maxDuration=15`. Error handling: 401/400/408/500 per contracts/api.md
- [x] T008 Implement complete route in `apps/nextjs/src/app/api/onboarding/story/complete/route.ts` — auth check, parse body with `StoryCompleteRequestSchema`, call `isNewUser()`, if new → call `prefillDemoData()`, return `{success, isNewUser, inventoryCreated, recipesCreated, unrecognizedIngredients, unrecognizedRecipeIngredients}`. If returning → return `{success:true, isNewUser:false, inventoryCreated:0, ...}`. `maxDuration=30`. Revalidate `/app/onboarding` and `/app` paths on success. Error handling: 401/400/500 per contracts/api.md

### Client-Side Hooks

- [x] T009 [P] Implement `useStoryState` hook in `apps/nextjs/src/app/(protected)/app/onboarding/story/hooks/useStoryState.ts` — manages `StoryOnboardingState` in localStorage (key from constants). On mount: read + hydrate (default: scene 1, initial inventory from constants, initial recipe). Write-through on every state change. Expose: `state`, `goToScene(n)`, `updateInventory(items)`, `markVoiceDone()`, `reset()` (clears localStorage + resets React state). Per research.md R2
- [x] T010 [P] Implement `useFadeTransition` hook in `apps/nextjs/src/app/(protected)/app/onboarding/story/hooks/useFadeTransition.ts` — manages phase: `'visible' | 'fade-out' | 'hidden' | 'fade-in'`. Expose: `phase`, `triggerTransition(callback)` where callback runs during 'hidden' phase (swap scene content). Returns CSS class string for opacity transitions. Per research.md R3

**Checkpoint**: All services, API routes, and hooks ready. Scene components can now consume them.

---

## Phase 3: User Story 1 — Follow Sarah's Story (Priority: P1) 🎯 MVP

**Goal**: User taps through Scenes 1 → 2 → 3, reading Sarah's story with progressive fade-in text, inventory display, and recipe card

**Independent Test**: Open `/app/onboarding/story`, verify Scenes 1-3 render with fade-in text, inventory badges (read-only), recipe card (almost-available), and "Continue" advances each scene

### Implementation

- [ ] T011 [P] [US1] Create `Scene1Dilemma.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/` — Sarah's evening dilemma narrative. Progressive fade-in text (staggered `animation-delay` per segment from constants). "Continue" button calls `onContinue` prop. Neo-brutalist styling (thick borders, bold shadows, vibrant colors per FR-021)
- [ ] T012 [P] [US1] Create `Scene2Inventory.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/` — shows Sarah's inventory using 2 read-only `InventorySection` instances (tracked + staples, pass `undefined` for `onQuantityChange`/`onToggleStaple`/`onDelete` per research.md R5). Shows `RecipeAvailabilityCard` with `variant="almost-available"` (eggs + parmesan missing, no `onMarkAsCooked`). Uses `toInventoryDisplayItem()` and `toRecipeWithAvailability()` transforms. Progressive fade-in text for narrative. "Continue" button
- [ ] T013 [P] [US1] Create `Scene3Store.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/` — Sarah decides to stop at the store. Progressive fade-in text. "Continue" button
- [ ] T014 [US1] Create `StoryOnboarding.tsx` orchestrator in `apps/nextjs/src/app/(protected)/app/onboarding/story/` — client component (`'use client'`). Uses `useStoryState` for state, `useFadeTransition` for scene transitions. Renders current scene based on `state.currentScene`. Passes `onContinue` to each scene (triggers fade transition → `goToScene(n+1)`). For MVP: wire Scenes 1-3 only, placeholder for 4-7
- [ ] T015 [US1] Create `page.tsx` route entry in `apps/nextjs/src/app/(protected)/app/onboarding/story/` — server component, renders `<StoryOnboarding />`. Route: `/app/onboarding/story`

**Checkpoint**: Scenes 1-3 navigable with progressive text, read-only inventory, recipe card. Manual test per quickstart.md steps 1-2.

---

## Phase 4: User Story 2 — Voice Input to Update Inventory (Priority: P1)

**Goal**: Scene 4 captures voice/text input, extracts ingredients via LLM, updates demo inventory in real-time, gates progression on eggs + parmesan

**Independent Test**: Navigate to Scene 4, tap mic, say "eggs and parmesan", verify inventory updates, "Continue" enables. Test text fallback when mic denied.

**Depends on**: Phase 3 (orchestrator exists to wire Scene 4)

### Implementation

- [ ] T016 [US2] Create `Scene4Voice.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/` — interactive scene. Uses `VoiceTextInput` component (shared) for mic button + text fallback (FR-008). Calls `/api/onboarding/story/process-input` with `{audioBase64, currentIngredients}` for voice or `{text, currentIngredients}` for text fallback — single endpoint handles both. On response: update `demoInventory` via `useStoryState.updateInventory()` — add recognized items at quantityLevel=3 with `isNew: true`. Display inventory using read-only `InventorySection` (same pattern as Scene 2 but with updated items). "Continue" button disabled until `hasRequiredItems(inventory)` returns true (FR-006). Mic button label: "Add more" after first input (FR-007). Hint after 5s silence (FR-009). Error handling: show error message, allow retry. Loading state on mic button during processing
- [ ] T017 [US2] Wire Scene 4 into `StoryOnboarding.tsx` orchestrator — add Scene4Voice to scene switch, pass `state.demoInventory` + `updateInventory` + `markVoiceDone` + `onContinue`

**Checkpoint**: Voice input works end-to-end, inventory updates, progression gates on eggs + parmesan. Manual test per quickstart.md steps 3-4.

---

## Phase 5: User Story 3 — Mark Recipe as Cooked + Inventory Decrement (Priority: P1)

**Goal**: Scene 5 shows READY recipe, "I made this" triggers Scene 6 decrement modal showing before/after quantities with staples as NOT TRACKED

**Independent Test**: Navigate to Scene 5 (after voice input), verify recipe shows READY with "just added" labels, tap "I made this", verify decrement modal with correct quantity changes, tap "Got it" to advance.

**Depends on**: Phase 4 (Scene 4 must set eggs + parmesan to proceed)

### Implementation

- [ ] T018 [P] [US3] Create `Scene5Ready.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/` — shows carbonara `RecipeAvailabilityCard` with `variant="available"` (all ingredients present, FR-010). "just added" labels on eggs + parmesan (items with `isNew: true`). "I made this" button triggers `onContinue` (which applies decrement logic to demo inventory and transitions to Scene 6). Also shows updated inventory sections (read-only)
- [ ] T019 [P] [US3] Create `Scene6Cooked.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/` — decrement display modal/card. Shows each recipe ingredient with before → after quantity words (per data-model.md decrement table: non-staple anchors decrement by 1, floor at 0). Staples (Black pepper, Salt) shown as "NOT TRACKED" with explanation text "Staples never run out. No need to track them." (FR-012). "Got it" button calls `onContinue`
- [ ] T020 [US3] Wire Scenes 5-6 into `StoryOnboarding.tsx` — add to scene switch. On "I made this" (Scene 5 → 6 transition): apply decrement logic to `demoInventory` (non-staple anchors: quantityLevel = max(0, quantityLevel - 1)), store pre-decrement state for Scene 6 display

**Checkpoint**: Cook loop demo works. Recipe READY → "I made this" → decrement display → advance. Manual test per quickstart.md steps 5-6.

---

## Phase 6: User Story 4 — Manifesto and Transition to App (Priority: P2)

**Goal**: Scene 7 shows manifesto, "Get started" pre-fills brand-new users via complete API with loading screen, "Restart demo" resets flow

**Independent Test**: Navigate to Scene 7, verify manifesto text. As brand-new user: tap "Get started", see loading screen, verify redirect to /app with demo data in DB. As returning user: tap "Get started", verify direct redirect (no loading). Tap "Restart demo", verify return to Scene 1.

**Depends on**: Phase 5 (flow reaches Scene 7 naturally)

### Implementation

- [ ] T021 [US4] Create `Scene7Manifesto.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/` — manifesto text with progressive fade-in. Two CTAs: "Get started →" (calls `onComplete('app')`) and "Tell us what you can cook blindfolded!" (calls `onComplete('recipes')`). "Restart demo" link/button (calls `onRestart`). Loading screen state: when `onComplete` triggers, show loading screen with copy from plan.md ("Setting up your kitchen..." messaging per FR-018). Calls `POST /api/onboarding/story/complete` with demo inventory/recipes from state. On response: if `isNewUser: true` → show loading screen during request → redirect to `/app` or `/app/recipes`. If `isNewUser: false` → redirect immediately (FR-019). Error handling: show error with retry on failure (FR-020)
- [ ] T022 [US4] Wire Scene 7 into `StoryOnboarding.tsx` — add to scene switch. Pass `onComplete` (calls complete API + handles redirect), `onRestart` (calls `state.reset()`, triggers transition to Scene 1). Clear localStorage on successful completion redirect

**Checkpoint**: Full 7-scene flow works end-to-end. Manual test per quickstart.md steps 7-10.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Routing changes, entry point redirects, final integration

- [ ] T023 Update redirect in `apps/nextjs/src/app/(protected)/app/page.tsx` — change brand-new user redirect from `/app/onboarding` to `/app/onboarding/story` (per plan.md routing changes table)
- [ ] T024 [P] Add brand-new user redirect guard to `apps/nextjs/src/app/(protected)/app/inventory/page.tsx` — use `getUserCounts()` from `apps/nextjs/src/app/actions/cooking-log.ts`, if `recipeCount === 0 && inventoryCount === 0` → redirect to `/app/onboarding/story` (per plan.md routing changes)
- [ ] T025 [P] Add brand-new user redirect guard to `apps/nextjs/src/app/(protected)/app/recipes/page.tsx` — same logic as T024
- [ ] T026 Verify localStorage resume: refresh mid-flow → verify state restored from `useStoryState` hook, user resumes at correct scene (quickstart.md step 9)
- [ ] T027 Run full manual test per quickstart.md steps 1-10

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types + constants)
- **US1 (Phase 3)**: Depends on Phase 2 (hooks, transforms)
- **US2 (Phase 4)**: Depends on Phase 3 (orchestrator) + Phase 2 (process-input API)
- **US3 (Phase 5)**: Depends on Phase 4 (voice must set inventory)
- **US4 (Phase 6)**: Depends on Phase 5 (flow reaches Scene 7) + Phase 2 (complete API)
- **Polish (Phase 7)**: Depends on Phase 6 (full flow complete)

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only → can start after Phase 2
- **US2 (P1)**: Depends on US1 (needs orchestrator) → sequential after Phase 3
- **US3 (P1)**: Depends on US2 (inventory must have eggs + parmesan) → sequential after Phase 4
- **US4 (P2)**: Depends on US3 (flow must reach Scene 7) → sequential after Phase 5

Note: This feature has a **linear story flow** — scenes are sequential by design, so user stories have natural sequential dependencies.

### Within Each Phase

- Tasks marked [P] can run in parallel
- Services before API routes (T005-T006 before T008)
- Hooks are independent of API routes (T009-T010 parallel with T007-T008)

### Parallel Opportunities

```
Phase 1 (all parallel):
  T002 types ║ T003 constants ║ T004 transforms

Phase 2 (mixed):
  T005 isNewUser → T006 prefillDemoData → T008 complete route
  T007 process-input ║ T009 useStoryState ║ T010 useFadeTransition (all parallel)

Phase 3 (scenes parallel, then orchestrator):
  T011 Scene1 ║ T012 Scene2 ║ T013 Scene3 → T014 orchestrator → T015 page

Phase 7 (redirects parallel):
  T024 inventory redirect ║ T025 recipes redirect
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, constants, transforms)
2. Complete Phase 2: Foundational (services, API routes, hooks)
3. Complete Phase 3: US1 — Scenes 1-3 with static narrative
4. **STOP and VALIDATE**: Test Scenes 1-3 flow independently

### Incremental Delivery

1. Setup + Foundational → all backend ready
2. US1 (Scenes 1-3) → narrative works → validate
3. US2 (Scene 4) → voice input works → validate
4. US3 (Scenes 5-6) → cook demo works → validate
5. US4 (Scene 7) → completion + pre-fill works → validate
6. Polish → routing redirects + full manual test

### Service-First Rationale

All reusable services (`isNewUser`, `prefillDemoData`) and API routes are built in Phase 2 before any scene component touches them. This ensures:
- Services are independently testable via API calls
- No circular dependencies between frontend and backend work
- Services can be reused by other features (e.g., `isNewUser` for any brand-new user detection)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- No tests — manual testing per quickstart.md
- Scene text content sourced from `new-onboarding.md` at repo root
- Existing components (InventorySection, RecipeAvailabilityCard, VoiceTextInput) are NOT modified
- Commit after each phase checkpoint
- Total: 27 tasks across 7 phases
