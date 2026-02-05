# Tasks: Improved Onboarding Story

**Input**: Design documents from `/specs/027-improved-onboarding-story/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Not requested. Manual testing only per constitution.

**Organization**: Tasks grouped by user story. User stories map to spec.md priorities.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Exact file paths included

## Path Conventions

- All paths relative to `apps/nextjs/src/`
- Scene components: `app/(protected)/app/onboarding/story/scenes/`
- Story lib: `lib/story-onboarding/`
- Orchestration: `lib/orchestration/`
- API routes: `app/api/onboarding/`

---

## Phase 1: Foundational — Backend (Orchestration & API)

**Purpose**: Enable recipe extraction with scene-specific Opik tags. MUST complete before any scene work.

- [X] T001 [P] Add `additionalTags?: string[]` to `CreateRecipeProposalParams` interface and spread into `traceTags` in `apps/nextjs/src/lib/orchestration/recipe-update.orchestration.ts`
- [X] T002 [P] Add `additionalTags: z.array(z.string()).optional()` to request schema and pass through to `createRecipeManagerAgentProposal()` in `apps/nextjs/src/app/api/onboarding/process-recipe/route.ts`

**Checkpoint**: API accepts `additionalTags` and propagates to Opik traces.

---

## Phase 2: Foundational — State, Types & Constants

**Purpose**: Extend state shape for 8-scene flow. MUST complete before any scene work.

- [X] T003 [P] Extend `StoryOnboardingState` in `apps/nextjs/src/lib/story-onboarding/types.ts`: widen `currentScene` to `1|2|3|4|5|6|7|8`, add `demoRecipes: DemoRecipe[]`, `recipeVoiceDone: boolean`, `userRecipesAdded: boolean`
- [X] T004 [P] Update `apps/nextjs/src/lib/story-onboarding/constants.ts`: remove carbonara quote from `SCENE_TEXT.scene1`, add `SCENE_TEXT.scene2RecipeIntro`, `SCENE_TEXT.scene2RecipeInstructions`, `SCENE_TEXT.scene3StoreKitchen`, `SCENE_TEXT.scene7YourRecipes`, add `REQUIRED_RECIPE_ITEMS` constant with alternates
- [X] T005 [P] Add `hasRequiredRecipeItems()` and `toDemoRecipeFromApiResponse()` to `apps/nextjs/src/lib/story-onboarding/transforms.ts`
- [X] T006 Extend `useStoryState` hook in `apps/nextjs/src/app/(protected)/app/onboarding/story/hooks/useStoryState.ts`: update `DEFAULT_STATE` with new fields, add `updateDemoRecipe()`, `addDemoRecipe()`, `setRecipeVoiceDone()`, `setUserRecipesAdded()` methods

**Checkpoint**: State shape, constants, and transforms ready for scene components.

---

## Phase 3: User Story 1 — Recipe Voice Input Scene (Priority: P1)

**Goal**: New Scene 2 where user describes carbonara recipe via voice/text with ingredient validation gate.

**Independent Test**: Navigate to Scene 2, speak/type carbonara recipe, verify AI extracts ingredients, gate validates them, Continue enables on success.

### Implementation for User Story 1

- [X] T007 [US1] Create `Scene2RecipeVoice.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene2RecipeVoice.tsx` — mirror Scene4Voice pattern: narrative intro, instruction with prompted sentence (pink/italic), VoiceTextInput, recipe display below input, success banner (green), urgency banner (pink after 3+ fails), Continue button disabled until gate passes. Processing: POST to `/api/onboarding/process-recipe` with `additionalTags: ["onboarding-story-scene2"]`, validate via `hasRequiredRecipeItems()`, call `onUpdateDemoRecipe()` on success.

**Checkpoint**: Scene 2 functional — recipe voice input with validation gate working end-to-end.

---

## Phase 4: User Story 2 — Merged Store + Kitchen Scene (Priority: P1)

**Goal**: Combine store narrative and kitchen display into single Scene 3.

**Independent Test**: Complete Scene 2, navigate to Scene 3, verify store narrative + kitchen display with AI-extracted recipe data.

### Implementation for User Story 2

- [X] T008 [US2] Create `Scene3StoreKitchen.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene3StoreKitchen.tsx` — store narrative text first (staggered fade-in), then kitchen display: "SARAH'S KITCHEN" heading, tracked ingredient badges, staples badges, `RecipeAvailabilityCard` using AI-extracted recipe prop (not hardcoded), outro text with highlighted missing items ({eggs}, {parmesan}), Continue button. Reuse `toRecipeWithAvailability()`, `toInventoryDisplayItem()`, `InventoryItemBadge` from existing Scene2Inventory.
- [X] T009 [US2] Delete `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene2Inventory.tsx` and `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene3Store.tsx`

**Checkpoint**: Scene 3 merges store + kitchen with dynamic recipe data.

---

## Phase 5: User Story 3 — User Adds Own Recipes (Priority: P2)

**Goal**: New Scene 7 where user adds personal recipes before manifesto.

**Independent Test**: Navigate to Scene 7, add recipe via voice/text, verify it appears in list, Continue enables after 1+ recipes.

### Implementation for User Story 3

- [X] T010 [US3] Create `Scene7YourRecipes.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene7YourRecipes.tsx` — narrative text ("Now it's your turn!"), VoiceTextInput, recipe list below input (each as card with name + ingredients), counter ("X recipe(s) added"), Continue button disabled until `demoRecipes.length > 1`. Processing: POST to `/api/onboarding/process-recipe` with `trackedRecipes: currentDemoRecipes`, `additionalTags: ["onboarding-story-scene7"]`, convert response to `DemoRecipe`, call `onAddRecipe()`.

**Checkpoint**: Scene 7 functional — user can add recipes, gate enforces 1+ minimum.

---

## Phase 6: User Story 5 — Completion Persists Recipes & Redirects (Priority: P1)

**Goal**: Scene 8 manifesto sends all recipes in payload and redirects to `/app`.

**Independent Test**: Complete full onboarding, verify all recipes in DB, verify redirect to `/app`.

### Implementation for User Story 5

- [X] T011 [US5] Rename `Scene7Manifesto.tsx` → `Scene8Manifesto.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/`: update props to accept `demoRecipes: DemoRecipe[]` instead of single `recipe`, update payload to send all recipes, change `router.push("/app/recipes")` → `router.push("/app")`, update loading text to reference "recipes" (plural)

**Checkpoint**: Manifesto sends complete payload with all recipes and redirects to `/app`.

---

## Phase 7: User Story 4 — Flow Restructuring & Scene Wiring (Priority: P1)

**Goal**: Wire all 8 scenes into the orchestrator, update progress bar.

**Independent Test**: Navigate through all 8 scenes, verify progress bar (8 segments), scene transitions, completion payload.

### Implementation for User Story 4

- [X] T012 [P] [US4] Update `StoryProgressBar.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/StoryProgressBar.tsx` — change `TOTAL_SCENES` from 7 to 8
- [X] T013 [US4] Update `StoryOnboarding.tsx` in `apps/nextjs/src/app/(protected)/app/onboarding/story/StoryOnboarding.tsx` — import new scenes (Scene2RecipeVoice, Scene3StoreKitchen, Scene7YourRecipes, Scene8Manifesto), remove deleted scene imports, update scene routing for 8-scene flow, wire Scene 2 (pass `demoRecipes`, `onUpdateDemoRecipe`, `onContinue`), wire Scene 3 (pass `inventory`, `recipe` from `state.demoRecipes[0]`, `onContinue`), wire Scene 7 (pass `demoRecipes`, `onAddRecipe`, `onContinue`), wire Scene 8 (pass `inventory`, `demoRecipes`, `onRestart`), update cooking logic (Scene 5→6) to use `state.demoRecipes[0]` for decrement

**Checkpoint**: Full 8-scene flow navigable end-to-end. All scenes wired with correct props.

---

## Phase 8: User Story 6 — Observability Tags (Priority: P2)

**Goal**: Opik traces distinguishable by scene.

**Independent Test**: Trigger recipe extraction in Scene 2 and Scene 7, check Opik for distinct tags.

### Implementation for User Story 6

No additional tasks — already implemented via T001, T002 (backend), T007 (Scene 2 passes `"onboarding-story-scene2"`), T010 (Scene 7 passes `"onboarding-story-scene7"`).

**Checkpoint**: Tags verified in Opik dashboard.

---

## Phase 9: Polish & Cross-Cutting

**Purpose**: Final validation and cleanup.

- [ ] T014 Verify `pnpm build` succeeds with no TypeScript errors from `apps/nextjs/`
- [ ] T015 Manual end-to-end walkthrough: all 8 scenes, voice + text input, validation gates, completion, redirect to `/app`, recipe persistence in DB

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Backend) ─────┐
                        ├──→ Phase 3 (US1: Scene 2) ──→ Phase 4 (US2: Scene 3)
Phase 2 (State/Types) ──┘                                        │
                        ├──→ Phase 5 (US3: Scene 7) ─────────────┤
                        │                                         │
                        └──→ Phase 6 (US5: Scene 8) ─────────────┤
                                                                  │
                                                    Phase 7 (US4: Wiring) ──→ Phase 8 (US6: Tags) ──→ Phase 9 (Polish)
```

### User Story Dependencies

- **US1 (Scene 2)**: Depends on Phase 1 + Phase 2. No other story deps.
- **US2 (Scene 3)**: Depends on Phase 2. Logically after US1 (Scene 2 provides recipe data) but component can be built in parallel.
- **US3 (Scene 7)**: Depends on Phase 1 + Phase 2. No other story deps.
- **US5 (Scene 8)**: Depends on Phase 2. No other story deps.
- **US4 (Wiring)**: Depends on ALL scene components (US1, US2, US3, US5) being complete.
- **US6 (Tags)**: No additional work — covered by T001, T002, T007, T010.

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003, T004, T005 can run in parallel (different files)
- T007 (Scene 2), T008 (Scene 3), T010 (Scene 7), T011 (Scene 8) can all be built in parallel after Phase 2 completes
- T012 can run in parallel with T013

---

## Parallel Example: Phase 2 (Foundation)

```bash
# All foundation tasks in parallel (different files):
Task: T003 — types.ts
Task: T004 — constants.ts
Task: T005 — transforms.ts
# Then sequentially:
Task: T006 — useStoryState.ts (depends on types)
```

## Parallel Example: Scene Components

```bash
# After Phase 1+2 complete, all scenes in parallel:
Task: T007 — Scene2RecipeVoice.tsx
Task: T008 — Scene3StoreKitchen.tsx
Task: T010 — Scene7YourRecipes.tsx
Task: T011 — Scene8Manifesto.tsx
```

---

## Implementation Strategy

### MVP First (US1 + US4 Only)

1. Phase 1: Backend foundation (T001, T002)
2. Phase 2: State/types foundation (T003-T006)
3. Phase 3: Scene 2 recipe voice (T007)
4. Phase 7: Wire Scene 2 into orchestrator (T013, partial)
5. **VALIDATE**: Scene 2 works in the flow

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. US1 (Scene 2) → Core interactive scene working
3. US2 (Scene 3) → Merged store+kitchen scene
4. US3 (Scene 7) → User recipe input scene
5. US5 (Scene 8) → Completion with all recipes + redirect
6. US4 (Wiring) → Full 8-scene flow integrated
7. Polish → Build check + E2E walkthrough

---

## Notes

- No new API routes — reuse `/api/onboarding/process-recipe`
- No DB schema changes — existing tables handle multi-recipe persistence
- Mirror Scene4Voice UI patterns for new interactive scenes
- Neo-brutalist design: thick borders, bold shadows, vibrant colors
- Commit after each phase completes per speckit workflow

## Implementation Learnings

- **No alternate ingredient names**: Validation uses exact matches only (egg, parmesan, pasta, bacon). No `alternates` array — simpler and more predictable.
- **Assisted fallback after 2 fails**: Scene 2 auto-provides CARBONARA_RECIPE after 2 failed attempts with a 2s delay (shows user's failed result first, then replaces). Disables mic + shows amber "we got you" banner.
- **RecipeAvailabilityCard in Scene 2**: Extracted recipe displayed using existing `RecipeAvailabilityCard` against `SARAH_INITIAL_INVENTORY` (variant: "almost-available"), not plain ingredient badges.
- **Outro text above Continue**: When Scene 2 gate passes, "Sarah wants carbonara, but she's missing {eggs} and {parmesan}" renders above Continue button with highlighted tokens.
- **Scene 3 has no recipe card**: Only store narrative + kitchen inventory (tracked ingredients + staples). Recipe card was removed — the scene just shows what Sarah has, then she grabs what's missing.
- **Reduced demo inventory**: Rice, Butter, Milk removed from `SARAH_TRACKED_INGREDIENTS`. Only Pasta, Bacon, Parmesan, Egg remain for a cleaner demo.
- **Scene 6 updated**: Removed "egg fried rice" suggestion (rice no longer in inventory), replaced with generic "add more recipes" prompt.
- **Constants renamed**: `scene3StoreKitchen` split into `scene3Intro` + `scene3Outro`. Old `scene2Intro` removed (orphaned after Scene2Inventory deletion). `scene2Outro` kept (used by Scene2RecipeVoice and Scene3StoreKitchen).
