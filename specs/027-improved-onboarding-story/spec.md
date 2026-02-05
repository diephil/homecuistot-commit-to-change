# Feature Specification: Improved Onboarding Story

**Feature Branch**: `027-improved-onboarding-story`
**Created**: 2026-02-05
**Status**: Draft
**Input**: Restructure the 7-scene onboarding story into an 8-scene flow with recipe voice input, merged store+kitchen scene, and user recipes scene.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recipe Voice Input Scene (Priority: P1)

A new user follows Sarah's story and is prompted to help Sarah tell HomeCuistot her carbonara recipe using voice/text input. The system extracts recipe ingredients via AI and validates that the exact required carbonara ingredients (egg, parmesan, pasta, bacon) are present before allowing progression. The extracted recipe is displayed using `RecipeAvailabilityCard` against Sarah's current kitchen inventory.

**Why this priority**: Core new interactive scene (Scene 2) that replaces passive narrative with active engagement. Introduces the recipe concept early, making the rest of the flow (store, inventory, cooking) meaningful. Without this, remaining changes lose context.

**Independent Test**: Navigate to Scene 2, speak/type a carbonara recipe, verify AI extracts correct ingredients and gate validates them.

**Acceptance Scenarios**:

1. **Given** the user is on Scene 2 (Recipe Voice), **When** they describe a carbonara recipe containing egg, parmesan, pasta, and bacon, **Then** the system extracts recipe data, displays it via `RecipeAvailabilityCard` (showing availability against Sarah's kitchen), and enables the Continue button with outro text about missing ingredients.
2. **Given** the user is on Scene 2, **When** they describe a recipe missing required ingredients (e.g., no egg), **Then** the Continue button remains disabled, the microphone stays active, and they must retry.
3. **Given** the user has failed 2 attempts on Scene 2, **When** the 2nd failed result is shown, **Then** after a brief delay the system auto-provides Sarah's carbonara recipe, disables the microphone, and enables Continue with an assisted message.
4. **Given** the user successfully passes Scene 2, **When** they proceed, **Then** the extracted recipe is stored locally and available for Scene 8's completion payload.

---

### User Story 2 - Merged Store + Kitchen Scene (Priority: P1)

After Scene 2, the user sees the store narrative (Sarah stops at the store) followed by Sarah's kitchen display (tracked ingredients and staples only — no recipe card). The scene ends with Sarah grabbing what's missing. This contextually shows what Sarah has before she shops.

**Why this priority**: Merges two previously separate scenes into one coherent narrative moment. Essential for story flow: Sarah is at the store checking what she has.

**Independent Test**: Complete Scene 2, navigate to Scene 3, verify store narrative and kitchen display (ingredient badges, staples) render correctly in sequence without recipe card.

**Acceptance Scenarios**:

1. **Given** the user arrives at Scene 3, **When** the scene loads, **Then** the store narrative appears first, followed by Sarah's kitchen (tracked ingredients + staples badges).
2. **Given** the kitchen display is shown, **Then** it does NOT include a recipe availability card — only ingredient badges.
3. **Given** the kitchen display is shown, **When** the outro renders, **Then** it says Sarah grabs what's missing (eggs and parmesan).

---

### User Story 3 - User Adds Own Recipes (Priority: P2)

After Sarah's story concludes (Scene 6), the user is invited to add their own recipes via voice/text input. The user must add at least 1 recipe before continuing to the final manifesto scene. All user recipes are included in the completion payload.

**Why this priority**: Transitions from Sarah's demo story to the user's own data. Increases personal investment and ensures the user starts with real recipe data. Depends on recipe voice infrastructure from P1.

**Independent Test**: Navigate to Scene 7, add a recipe via voice/text, verify it appears in the recipe list, confirm Continue button enables after 1+ recipes added.

**Acceptance Scenarios**:

1. **Given** the user is on Scene 7, **When** they describe a recipe via voice/text, **Then** the system extracts recipe data and displays it as a card/list item below the input.
2. **Given** the user has not yet added any recipe on Scene 7, **When** they view the Continue button, **Then** it is disabled.
3. **Given** the user has added 1+ recipes, **When** they view the Continue button, **Then** it is enabled and shows a counter (e.g., "2 recipe(s) added").
4. **Given** the user adds multiple recipes, **When** they complete onboarding (Scene 8), **Then** all recipes (Sarah's carbonara + user's own) are persisted to the database.

---

### User Story 5 - Completion Persists Recipes and Redirects to App (Priority: P1)

On onboarding completion, all recipes collected during the flow (Sarah's carbonara from Scene 2 + user's own from Scene 7) are persisted to the database. The "Get Started" action then redirects the user directly to the main app view.

**Why this priority**: Without persistence, all recipe data from onboarding is lost. Without redirect, the user has no clear path into the app after completing onboarding.

**Independent Test**: Complete the full onboarding, verify recipes exist in the database, verify redirect lands on the main app view.

**Acceptance Scenarios**:

1. **Given** the user completes the manifesto scene (Scene 8), **When** the completion endpoint is called, **Then** all recipes (Sarah's carbonara + user's own) are written to the database.
2. **Given** onboarding completion succeeds, **When** the user clicks "Get Started", **Then** they are redirected to the main app view.
3. **Given** the user added 3 recipes in Scene 7 plus Sarah's carbonara, **When** completion runs, **Then** all 4 recipes are persisted.

---

### User Story 6 - Observability Tags for Recipe AI Calls (Priority: P2)

Each recipe extraction AI call during onboarding passes scene-specific tags so that traces in the observability dashboard can be filtered and distinguished by scene (Scene 2 vs Scene 7).

**Why this priority**: Operational visibility. Without distinct tags, debugging and monitoring AI performance per scene is impossible.

**Independent Test**: Trigger recipe extraction in Scene 2 and Scene 7, check observability dashboard for distinct tags per scene.

**Acceptance Scenarios**:

1. **Given** a recipe extraction is triggered in Scene 2, **When** the AI call executes, **Then** its trace includes a tag identifying it as a Scene 2 onboarding call.
2. **Given** a recipe extraction is triggered in Scene 7, **When** the AI call executes, **Then** its trace includes a tag identifying it as a Scene 7 onboarding call.

---

### User Story 4 - Scene 1 Narrative Update and Flow Restructuring (Priority: P1)

The carbonara quote is removed from Scene 1 (Dilemma) and relocated to Scene 2 as the prompted sentence. The progress bar updates from 7 to 8 segments. Scene numbering and navigation accommodate the new 8-scene structure. The manifesto scene (now Scene 8) sends all recipes in the completion payload.

**Why this priority**: Prerequisite for Scene 2 to work and infrastructure for all other stories.

**Independent Test**: View Scene 1 and confirm carbonara quote is absent. Navigate through all 8 scenes verifying progress bar, transitions, and completion payload.

**Acceptance Scenarios**:

1. **Given** the user is on Scene 1, **When** the narrative displays, **Then** it does NOT include the line "I can cook my family's pasta carbonara with some bacon and parmesan..."
2. **Given** the user completes Scene 1, **When** they proceed, **Then** they arrive at Scene 2 (Recipe Voice).
3. **Given** the user starts onboarding, **When** the progress bar renders, **Then** it shows 8 segments.
4. **Given** the user completes all 8 scenes, **When** the manifesto triggers completion, **Then** the payload includes ingredients, pantry staples, and all recipes (Sarah's + user's).

---

### Edge Cases

- What happens when the AI extracts a recipe name different from "carbonara" but includes the required ingredients? Accept it -- the gate validates ingredients, not recipe name.
- What happens when voice recognition fails entirely in Scene 2 or Scene 7? User can type text input as fallback, same as existing Scene 4.
- What happens if the user navigates back from Scene 3 to Scene 2? The previously extracted recipe persists in local state.
- What happens if localStorage is cleared mid-onboarding? State is lost; user must restart. Same behavior as current onboarding.
- What happens if the AI returns duplicate ingredients in the extracted recipe? Deduplicate before displaying and storing.
- What happens if the user tries to add the same recipe twice in Scene 7? Allow it -- no uniqueness constraint during onboarding.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the carbonara quote from Scene 1 narrative text.
- **FR-002**: System MUST provide a new Scene 2 where users describe a recipe via voice or text input, with AI-powered ingredient extraction.
- **FR-003**: System MUST validate that Scene 2's extracted recipe contains exact ingredient names: egg, parmesan, pasta, and bacon (no alternate names accepted) before allowing progression.
- **FR-004**: System MUST display the prompted sentence as a visual guide in Scene 2, guiding the user to say the exact required ingredients.
- **FR-005**: After 2 failed validation attempts in Scene 2, system MUST auto-provide Sarah's carbonara recipe, disable voice/text input, and show an assisted message enabling continuation.
- **FR-006**: System MUST merge the store narrative and kitchen display into a single Scene 3, showing the store text first followed by tracked ingredients and staples badges (no recipe card).
- **FR-007**: Scene 2 MUST display the AI-extracted recipe using `RecipeAvailabilityCard` showing availability against Sarah's current kitchen inventory. When gate passes, show outro text about missing eggs and parmesan above the Continue button.
- **FR-008**: System MUST provide a new Scene 7 where users add their own recipes via voice or text input.
- **FR-009**: Scene 7 MUST require at least 1 recipe before enabling progression.
- **FR-010**: Scene 7 MUST display a count of added recipes and show each recipe as a card or list item.
- **FR-011**: System MUST update the progress bar from 7 to 8 segments.
- **FR-012**: The completion payload (Scene 8) MUST include all recipes: Sarah's carbonara from Scene 2 and all user recipes from Scene 7.
- **FR-013**: System MUST store recipe data in local storage during the onboarding flow (same pattern as existing inventory storage).
- **FR-014**: Both Scene 2 and Scene 7 MUST support text input as a fallback when voice input is unavailable.
- **FR-015**: Recipe extraction calls MUST pass distinguishing tags for observability traces (e.g., "onboarding-story-scene2" for Scene 2 and "onboarding-story-scene7" for Scene 7) so each scene's AI calls are identifiable in the tracing dashboard.
- **FR-016**: On onboarding completion, the system MUST persist all user-added recipes (Sarah's carbonara + user's own) to the database.
- **FR-017**: After successful onboarding completion, the "Get Started" action MUST redirect the user directly to the main app view (not an intermediate page).

### Key Entities

- **Demo Recipe**: A recipe extracted by AI during onboarding, containing a name and a list of ingredients. Can be Sarah's prompted carbonara or a user-added recipe.
- **Story State**: The onboarding flow's local state, extended with recipe data, scene gate flags, and an 8-scene progression model.
- **Recipe Extraction Result**: The AI's output from processing voice/text input, containing a recipe name and structured ingredient list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the recipe voice input (Scene 2) within 3 attempts on average.
- **SC-002**: 90%+ of users who reach Scene 2 successfully pass the ingredient validation gate.
- **SC-003**: Users can add at least 1 personal recipe in Scene 7 within 2 minutes.
- **SC-004**: 100% of completed onboarding payloads include both Sarah's carbonara recipe and user-added recipes.
- **SC-005**: The full 8-scene onboarding flow can be completed end-to-end without errors or dead ends.
- **SC-006**: Scene 3 (merged store + kitchen) renders both narrative and kitchen display without layout issues on mobile and desktop viewports.
- **SC-007**: 100% of completed onboardings result in user recipes persisted to the database.
- **SC-008**: After completion, user lands on the main app view within one navigation step (no intermediate pages).
- **SC-009**: All recipe AI calls during onboarding are distinguishable by scene in the observability dashboard.

## Assumptions

- Voice input infrastructure (VoiceTextInput component) is already stable and reusable from existing Scene 4.
- The recipe extraction AI (createRecipeManagerAgentProposal) is functional and can be called with `isOnBoarding: true`.
- Local storage persistence pattern from existing inventory storage extends for recipe data without architectural changes.
- The existing completion endpoint can accept an extended payload with a recipes array and persist them to the database.
- The recipe extraction orchestration supports passing additional tags for trace differentiation.
- Scene 2 accepts any recipe name as long as required ingredients are present (ingredient-gated, not name-gated).
- Scene 7 has no upper limit on recipes -- users can add as many as they want.
- Both voice and text input are supported in Scene 2 and Scene 7, matching existing Scene 4 behavior.
- Sarah's demo inventory is reduced to 4 tracked items (Pasta, Bacon, Parmesan, Egg) — Rice, Butter, and Milk removed for a cleaner demo.
- Scene 2 fallback after 2 failed attempts auto-provides the constant CARBONARA_RECIPE, not an AI-generated recipe.
