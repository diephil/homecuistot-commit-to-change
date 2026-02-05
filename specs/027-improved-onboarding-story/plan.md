# Implementation Plan: Improved Onboarding Story

**Branch**: `027-improved-onboarding-story` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)

## Summary

Restructure the 7-scene onboarding story into an 8-scene flow. Core changes: (1) new Scene 2 with recipe voice input and ingredient validation gate, (2) merged Scene 3 combining store narrative + kitchen display, (3) new Scene 7 where users add their own recipes, (4) Scene 8 manifesto persists all recipes and redirects to `/app`, (5) `additionalTags` support in recipe orchestration for Opik tracing.

Approach: reuse existing `VoiceTextInput`, `createRecipeManagerAgentProposal`, and `/api/onboarding/process-recipe` route. No new API routes. No DB schema changes. Extend story state with `demoRecipes[]` and scene gate flags.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16 App Router, Tailwind CSS v4, Drizzle ORM 0.45.1, @google/genai (Gemini 2.5-Flash-Lite), Opik, Zod
**Storage**: localStorage (during flow) + Supabase PostgreSQL via Drizzle (on completion)
**Testing**: Manual testing of 8-scene flow
**Target Platform**: Web (mobile-first responsive)
**Project Type**: Web application (Next.js monorepo)
**Performance Goals**: Recipe extraction < 15s, smooth scene transitions
**Constraints**: Reuse existing components/patterns, neo-brutalist design
**Scale/Scope**: 8 scene components, 1 API route modification, 1 orchestration modification, state/types/constants extensions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Reuses existing infra, no over-engineering |
| II. Pragmatic Type Safety | PASS | Types at boundaries (API, state), strict scene types |
| III. Essential Validation Only | PASS | Validates recipe ingredients at gate, API input via Zod |
| IV. Test-Ready Infrastructure | PASS | Manual testing, test infra already exists |
| V. Type Derivation | PASS | DemoRecipe type reused, state shape extended |
| VI. Named Parameters | PASS | All functions with 3+ params use named params already |
| VII. Neo-Brutalist Design | PASS | New scenes follow existing Scene4Voice UI patterns |
| Non-Negotiable Safeguards | PASS | No auth bypass, parameterized queries, no exposed secrets |

**Post-Phase 1 Re-check**: PASS — no new violations from design decisions.

## Project Structure

### Documentation (this feature)

```text
specs/027-improved-onboarding-story/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── process-recipe.md
│   └── story-complete.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── lib/
│   ├── orchestration/
│   │   └── recipe-update.orchestration.ts        # ADD additionalTags param
│   └── story-onboarding/
│       ├── types.ts                               # EXTEND StoryOnboardingState
│       ├── constants.ts                           # UPDATE scene text, ADD REQUIRED_RECIPE_ITEMS
│       └── transforms.ts                          # ADD hasRequiredRecipeItems()
├── app/
│   ├── api/onboarding/
│   │   └── process-recipe/route.ts                # PASS additionalTags through
│   └── (protected)/app/onboarding/story/
│       ├── StoryOnboarding.tsx                    # UPDATE scene routing (8 scenes)
│       ├── StoryProgressBar.tsx                   # UPDATE 7 → 8 segments
│       ├── hooks/
│       │   └── useStoryState.ts                   # EXTEND state shape + methods
│       └── scenes/
│           ├── Scene1Dilemma.tsx                   # NO CODE CHANGE (text via constants)
│           ├── Scene2Inventory.tsx                 # DELETE
│           ├── Scene3Store.tsx                     # DELETE
│           ├── Scene2RecipeVoice.tsx               # CREATE (mirrors Scene4Voice)
│           ├── Scene3StoreKitchen.tsx              # CREATE (merge old Scene2+Scene3)
│           ├── Scene4Voice.tsx                     # NO CHANGE
│           ├── Scene5Ready.tsx                     # NO CHANGE
│           ├── Scene6Cooked.tsx                    # NO CHANGE
│           ├── Scene7YourRecipes.tsx               # CREATE (mirrors Scene4Voice for recipes)
│           └── Scene8Manifesto.tsx                 # RENAME from Scene7Manifesto + modify
```

**Structure Decision**: Follows existing project structure. New scene components go in the `scenes/` directory alongside existing ones. Shared logic stays in `lib/story-onboarding/`. No new directories needed.

## Implementation Phases

### Phase 1: Backend — Orchestration & API (foundation)

**Goal**: Enable recipe extraction with scene-specific Opik tags.

**Changes**:

1. **`recipe-update.orchestration.ts`**: Add `additionalTags?: string[]` to `CreateRecipeProposalParams`. Destructure with default `[]`. Spread into `traceTags` array after `isOnBoarding` spread.

2. **`/api/onboarding/process-recipe/route.ts`**: Add `additionalTags: z.array(z.string()).optional()` to `requestBodySchema`. Pass through to `createRecipeManagerAgentProposal()` call.

**Dependencies**: None. This is the foundation.

---

### Phase 2: State & Types (foundation)

**Goal**: Extend state shape for 8-scene flow with recipe tracking.

**Changes**:

1. **`types.ts`**:
   - Extend `StoryOnboardingState.currentScene` union: `1 | 2 | 3 | 4 | 5 | 6 | 7 | 8`
   - Add `demoRecipes: DemoRecipe[]`
   - Add `recipeVoiceDone: boolean`
   - Add `userRecipesAdded: boolean`

2. **`constants.ts`**:
   - Remove carbonara quote from `SCENE_TEXT.scene1`
   - Add `SCENE_TEXT.scene2RecipeIntro` (narrative for Scene 2)
   - Add `SCENE_TEXT.scene2RecipeInstructions` (CTA + prompted sentence)
   - Merge store + kitchen text into `SCENE_TEXT.scene3StoreKitchen`
   - Add `SCENE_TEXT.scene7YourRecipes` (narrative for Scene 7)
   - Add `REQUIRED_RECIPE_ITEMS` constant with alternates
   - Update `TOTAL_SCENES = 8` (if used in progress bar)

3. **`transforms.ts`**:
   - Add `hasRequiredRecipeItems(recipe: DemoRecipe): boolean`
   - Validates recipe ingredients contain all required items (with alternate name matching)
   - Add `toDemoRecipeFromApiResponse()` helper to convert API response to `DemoRecipe`

4. **`useStoryState.ts`**:
   - Extend `DEFAULT_STATE` with `demoRecipes: [CARBONARA_RECIPE]`, `recipeVoiceDone: false`, `userRecipesAdded: false`
   - Add `updateDemoRecipe(recipe: DemoRecipe)` method (Scene 2 updates carbonara)
   - Add `addDemoRecipe(recipe: DemoRecipe)` method (Scene 7 appends)
   - Add `setRecipeVoiceDone()` method
   - Add `setUserRecipesAdded()` method
   - Update `demoRecipes[0]` when `updateDemoRecipe` called (keeps carbonara in sync)

**Dependencies**: None. This is the foundation alongside Phase 1.

---

### Phase 3: Scene 2 — Recipe Voice Input (core new scene)

**Goal**: Interactive scene where user describes carbonara recipe via voice/text.

**Create `Scene2RecipeVoice.tsx`** (mirror Scene4Voice pattern):

**Props**:
```
interface Scene2RecipeVoiceProps {
  demoRecipes: DemoRecipe[];
  onUpdateDemoRecipe: (recipe: DemoRecipe) => void;
  onContinue: () => void;
}
```

**UI structure**:
1. Setting text ("Sarah wants to tell HomeCuistot her recipe")
2. Narrative text with fade-in animations (from `SCENE_TEXT.scene2RecipeIntro`)
3. Instruction text with prompted sentence in pink/italic styling
4. `VoiceTextInput` component
5. Below input: extracted recipe display (name + ingredient badges) — appears after first successful extraction
6. Success banner (green) when gate passes
7. Urgency banner (pink) after 3+ failed attempts
8. Continue button (disabled until gate passes)

**Processing flow**:
1. `VoiceTextInput.onSubmit` → encode audio to base64 or use text
2. POST to `/api/onboarding/process-recipe` with `{ audioBase64/text, trackedRecipes: [], additionalTags: ["onboarding-story-scene2"] }`
3. On response: extract first recipe from `recipes[]`, convert to `DemoRecipe`
4. Call `hasRequiredRecipeItems()` on extracted recipe
5. If passes: call `onUpdateDemoRecipe()`, show success, enable Continue
6. If fails: increment attempt count, keep mic active

**Dependencies**: Phase 1 (API tags), Phase 2 (state/types).

---

### Phase 4: Scene 3 — Merged Store + Kitchen (content merge)

**Goal**: Combine store narrative and kitchen display into one scene.

**Create `Scene3StoreKitchen.tsx`**:

**Props**:
```
interface Scene3StoreKitchenProps {
  inventory: DemoInventoryItem[];
  recipe: DemoRecipe;
  onContinue: () => void;
}
```

**UI structure** (sequential with staggered fade-in):
1. Store narrative text (from `SCENE_TEXT.scene3StoreKitchen`) — setting + narrative segments
2. Kitchen display heading ("Here's what HomeCuistot shows Sarah:")
3. "SARAH'S KITCHEN" heading
4. Tracked ingredient badges (from `inventory`, non-staple items)
5. Staples badges (from `inventory`, staple items)
6. `RecipeAvailabilityCard` with AI-extracted recipe and missing ingredients highlighted
7. Outro text with highlighted missing items ({eggs}, {parmesan})
8. Continue button

**Key difference from old Scene2Inventory**: Uses `recipe` prop (AI-extracted from Scene 2) instead of hardcoded `CARBONARA_RECIPE`.

**Delete**: `Scene2Inventory.tsx`, `Scene3Store.tsx`.

**Dependencies**: Phase 2 (state), Phase 3 (Scene 2 provides recipe data).

---

### Phase 5: Scene 7 — Your Recipes (new interactive scene)

**Goal**: User adds their own recipes before manifesto.

**Create `Scene7YourRecipes.tsx`** (mirror Scene4Voice pattern for recipes):

**Props**:
```
interface Scene7YourRecipesProps {
  demoRecipes: DemoRecipe[];
  onAddRecipe: (recipe: DemoRecipe) => void;
  onContinue: () => void;
}
```

**UI structure**:
1. Narrative text with fade-in ("Now it's your turn!" etc.)
2. `VoiceTextInput` component
3. Recipe list below input — each added recipe as a card (name + ingredients)
4. Counter text: "X recipe(s) added"
5. Continue button (disabled until `demoRecipes.length > 1` — carbonara + at least 1 user recipe)

**Processing flow**:
1. `VoiceTextInput.onSubmit` → POST to `/api/onboarding/process-recipe` with `{ ..., trackedRecipes: currentDemoRecipes, additionalTags: ["onboarding-story-scene7"] }`
2. On response: convert to `DemoRecipe`, call `onAddRecipe()`
3. No ingredient validation gate — any valid recipe accepted
4. Display added recipes incrementally

**Dependencies**: Phase 1 (API tags), Phase 2 (state).

---

### Phase 6: Scene 8 Manifesto + Orchestrator Update (integration)

**Goal**: Rename manifesto to Scene 8, update payload, change redirect, wire all scenes.

**Changes**:

1. **Rename `Scene7Manifesto.tsx` → `Scene8Manifesto.tsx`**:
   - Props: accept `demoRecipes: DemoRecipe[]` instead of single `recipe: DemoRecipe`
   - Payload: `recipes: demoRecipes.map(r => ({ name, description, ingredients }))` (send all)
   - Redirect: change `router.push("/app/recipes")` → `router.push("/app")`
   - Loading text: update to mention "recipes" (plural)

2. **`StoryProgressBar.tsx`**: Change `TOTAL_SCENES` from 7 to 8.

3. **`StoryOnboarding.tsx`** (major update):
   - Import new scenes, remove deleted scenes
   - Update `handleNavigate` for 8-scene flow
   - Wire Scene 2: pass `demoRecipes`, `onUpdateDemoRecipe`, `onContinue`
   - Wire Scene 3: pass `inventory`, `recipe` (from `state.demoRecipes[0]`), `onContinue`
   - Wire Scene 7: pass `demoRecipes`, `onAddRecipe`, `onContinue`
   - Wire Scene 8: pass `inventory`, `demoRecipes`, `onRestart`
   - Update cooking logic (Scene 5 → 6): use `state.demoRecipes[0]` for decrement

4. **`constants.ts`**: Update `SCENE_TEXT.scene1` to remove carbonara quote line.

**Dependencies**: Phase 2 (state), Phase 3 (Scene 2), Phase 4 (Scene 3), Phase 5 (Scene 7).

## Complexity Tracking

No constitution violations. All changes follow existing patterns.
