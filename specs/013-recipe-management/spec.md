# Feature Specification: Recipe Management

**Feature Branch**: `013-recipe-management`
**Created**: 2026-01-27
**Status**: Draft
**Input**: User description: "Recipe list view on /app with neo-brutalism design, recipe management page with CRUD operations, voice input for recipe creation via LLM extraction, ingredient optional marking, database validation for ingredients with unrecognized items handling"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Recipe List on App Dashboard (Priority: P1)

As a user landing on `/app`, I see a list of my saved recipes displaying only their names. The page follows neo-brutalism design principles. I can navigate from here to the full recipe management page.

**Why this priority**: Core navigation entry point; users must see their recipes to engage with the feature.

**Independent Test**: Can be tested by navigating to `/app` and verifying recipe names display with neo-brutalism styling and a visible link to recipe management.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I navigate to `/app`, **Then** I see a list of my recipe names in neo-brutalism style
2. **Given** I am on `/app`, **When** I have no recipes, **Then** I see an empty state message
3. **Given** I am on `/app`, **When** I click the navigation to recipes, **Then** I am taken to the recipe management page

---

### User Story 2 - Manage Recipes on Recipe List Page (Priority: P1)

As a user on the recipe list page, I see all my recipes and can click any recipe to view/edit its details. There is an "Add recipe" button that opens a blank recipe card for creating a new recipe.

**Why this priority**: Core CRUD functionality; users need to manage their recipes.

**Independent Test**: Can be tested by navigating to recipe list, clicking a recipe to edit, and clicking "Add recipe" to create new.

**Acceptance Scenarios**:

1. **Given** I am on the recipe list page, **When** I view the page, **Then** I see all my recipes with clickable cards
2. **Given** I am on the recipe list page, **When** I click "Add recipe", **Then** a blank recipe card opens with empty inputs
3. **Given** I am on the recipe list page, **When** I click an existing recipe, **Then** the recipe card opens in edit mode with current data populated

---

### User Story 3 - Edit Recipe Details with Ingredient Management (Priority: P1)

As a user editing a recipe, I see the recipe title, description, and list of ingredients. Each ingredient has a checkbox to mark it as optional. I can save my changes. In edit mode, I see a delete button to remove the recipe.

**Why this priority**: Core recipe editing functionality with ingredient optional marking.

**Independent Test**: Can be tested by opening a recipe, toggling ingredient optional checkboxes, and saving.

**Acceptance Scenarios**:

1. **Given** I opened an existing recipe, **When** I view the card, **Then** I see title, description, ingredients with optional checkboxes, and a delete button
2. **Given** I am adding a new recipe, **When** I view the card, **Then** I do NOT see a delete button
3. **Given** I toggled an ingredient as optional, **When** I save, **Then** the optional status persists
4. **Given** I click delete on an existing recipe, **When** I confirm deletion, **Then** the recipe is removed from my list

---

### User Story 4 - Voice Input for Recipe Creation (Priority: P2)

As a user creating or editing a recipe, I can use microphone input to describe my dish. The system calls an LLM ("Recipe editor" prompt) to extract the title, description, and 1-20 ingredients. The LLM also suggests which ingredients should be optional.

**Why this priority**: Enhances UX with voice input but requires P1 base functionality first.

**Independent Test**: Can be tested by clicking microphone, speaking a recipe description, and verifying extracted fields appear.

**Acceptance Scenarios**:

1. **Given** I am on a recipe card (new or edit), **When** I click microphone and speak, **Then** the system records my input
2. **Given** my speech is recorded, **When** the LLM processes it, **Then** title, description, and ingredients are extracted and populated
3. **Given** the LLM extracts ingredients, **When** results appear, **Then** some ingredients are pre-marked as optional based on LLM suggestion
4. **Given** the LLM suggested optional ingredients, **When** I review, **Then** I can adjust the optional status before saving

---

### User Story 5 - Ingredient Database Validation (Priority: P2)

Before saving a recipe, the system validates all detected ingredients against the database. Unrecognized ingredients are placed in an "unrecognized items" section (matching onboarding behavior) for user review.

**Why this priority**: Data integrity feature; depends on ingredient extraction working first.

**Independent Test**: Can be tested by adding a recipe with a made-up ingredient and verifying it appears in unrecognized items.

**Acceptance Scenarios**:

1. **Given** I am saving a recipe, **When** all ingredients exist in DB, **Then** the recipe saves successfully
2. **Given** I am saving a recipe, **When** some ingredients are not in DB, **Then** those are shown as "unrecognized items"
3. **Given** unrecognized items are shown, **When** I review them, **Then** I can handle them similar to onboarding flow

---

### Edge Cases

- What happens when user speaks but audio is unclear or empty?
  - System shows error message and prompts to retry
- What happens when LLM extraction returns no ingredients?
  - System shows warning that no ingredients detected, allows manual entry
- What happens when LLM returns more than 20 ingredients?
  - System caps at 20 and informs user to remove some
- What happens when recipe has 0 ingredients?
  - System prevents saving; at least 1 ingredient required
- What happens when user deletes all ingredients from an existing recipe?
  - System prevents saving with validation message

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display recipe names on `/app` page following neo-brutalism design
- **FR-002**: System MUST provide navigation from `/app` to recipe management page
- **FR-003**: System MUST display all user recipes on recipe management page
- **FR-004**: System MUST allow clicking a recipe to open edit mode with populated data
- **FR-005**: System MUST provide "Add recipe" button that opens blank recipe card
- **FR-006**: Recipe card MUST show title, description, and ingredient list
- **FR-007**: Each ingredient MUST have a checkbox to mark as optional
- **FR-008**: Edit mode MUST include a delete button; add mode MUST NOT
- **FR-009**: System MUST support microphone input for voice-based recipe description
- **FR-010**: System MUST call LLM ("Recipe editor" prompt) to extract title, description, and 1-20 ingredients
- **FR-011**: LLM MUST suggest which ingredients should be optional
- **FR-012**: User MUST be able to adjust optional status after LLM suggestion
- **FR-013**: System MUST validate ingredients against database before saving
- **FR-014**: Unrecognized ingredients MUST be placed in "unrecognized items" section
- **FR-015**: System MUST require at least 1 ingredient to save a recipe
- **FR-016**: System MUST cap ingredients at maximum of 20

### Key Entities

- **Recipe**: User-owned recipe with title, description, and linked ingredients. Belongs to one user.
- **RecipeIngredient**: Junction entity linking recipe to ingredient with `isOptional` boolean flag.
- **Ingredient**: Existing ingredient from database (5931 items in taxonomy).
- **UnrecognizedItem**: Ingredient not found in database, requiring user resolution (follows onboarding pattern).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new recipe via voice input in under 60 seconds
- **SC-002**: Users can view their recipe list on `/app` within 2 seconds of page load
- **SC-003**: 90% of voice-described recipes have correctly extracted title and at least 3 ingredients
- **SC-004**: Users can toggle ingredient optional status and save within 3 clicks
- **SC-005**: All unrecognized ingredients are surfaced to user before save completes
- **SC-006**: Recipe delete confirmation prevents accidental data loss

## Assumptions

- Neo-brutalism design tokens/components already exist in the codebase (RetroUI)
- Microphone/audio input follows existing patterns from onboarding
- LLM prompt structure follows existing @google/genai (Gemini) patterns
- "Unrecognized items" handling reuses onboarding component/logic
- User authentication already exists (Supabase Auth)
