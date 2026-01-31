# Feature Specification: Onboarding Steps 2 & 3 Revamp

**Feature Branch**: `019-onboarding-revamp`
**Created**: 2026-01-31
**Status**: Draft
**Input**: Revamp onboarding steps 2 and 3 with cooking skills selection, common ingredients multi-select, and refined voice-based ingredient detection (add/remove)

## Clarifications

### Session 2026-01-31

- Q: Where should the user's cooking skill selection be stored? → A: Not stored; used transiently to determine which recipe set (basic vs advanced) to pre-fill during onboarding.
- Q: How should the LLM detect ingredients? → A: LLM returns structured arrays (ingredients_to_add, ingredients_to_remove); separate helper function handles DB matching and returns {ingredients, unrecognized_items, unrecognized_items_to_create}.
- Q: What happens after "Complete Setup" during persistence? → A: Keep existing loading/preparation component unchanged; shown while recipes are generated and data is persisted.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Cooking Skill Level (Priority: P1)

New user selects their cooking skill level to receive appropriately-matched recipe suggestions.

**Why this priority**: Core decision that determines recipe difficulty suggestions; gates access to ingredient selection section.

**Independent Test**: User can select Basic or Advanced, see visual feedback, and unlock the ingredients section.

**Acceptance Scenarios**:

1. **Given** user is on step 2, **When** page loads, **Then** only the cooking skills section is visible; ingredients section is hidden; hint text is hidden
2. **Given** no skill selected, **When** user clicks "Basic", **Then** "Basic" is selected, "Advanced" is grayed out, and ingredients section appears
3. **Given** "Basic" selected, **When** user clicks "Advanced", **Then** selection switches to "Advanced", "Basic" becomes grayed out
4. **Given** skill selected but no ingredients selected, **When** user views page, **Then** hint text remains hidden
5. **Given** skill selected AND 1+ ingredients selected, **When** selection complete, **Then** hint text appears explaining recipes will be suggested based on skill but user can manage recipes/ingredients later

---

### User Story 2 - Select Common Ingredients (Priority: P1)

User multi-selects from a predefined list of 17 common ingredients they have at home.

**Why this priority**: Essential for populating initial inventory; required before proceeding to step 3.

**Independent Test**: User can select multiple ingredients, see selections highlighted, and click "Next Step" when at least one is selected.

**Acceptance Scenarios**:

1. **Given** cooking skill selected, **When** ingredients section appears, **Then** list displays exactly 17 ingredients: pasta, rice, salt, egg, garlic, bread, tomato, honey, noodle, bacon, milk, cheese, chicken, cream, onion, olive oil, butter
2. **Given** no ingredients selected, **When** user views CTA, **Then** "Next Step" button is disabled and hint is hidden
3. **Given** user selects 1+ ingredients, **When** selection changes, **Then** "Next Step" becomes enabled and hint appears near CTA
4. **Given** 3 ingredients selected, **When** user clicks an already-selected ingredient, **Then** it becomes deselected (toggle behavior)
5. **Given** 1+ ingredients selected, **When** user clicks "Next Step", **Then** user advances to step 3 with selected ingredients preserved

---

### User Story 3 - Review Ingredients List on Step 3 (Priority: P1)

User sees their previously selected ingredients displayed as a read-only list on step 3.

**Why this priority**: Provides context for what ingredients are already tracked before adding more.

**Independent Test**: Navigate to step 3 and verify all step 2 selections appear as non-selectable display items.

**Acceptance Scenarios**:

1. **Given** user completed step 2 with 5 ingredients, **When** step 3 loads, **Then** all 5 ingredients appear in the list with distinct non-selectable styling
2. **Given** user is on step 3, **When** viewing ingredient list, **Then** design clearly indicates items are display-only (different from step 2 selectable styling)
3. **Given** user is on step 3 with 1+ ingredients, **When** page loads, **Then** "Complete Setup" CTA is enabled

---

### User Story 4 - Add Ingredients via Voice (Priority: P2)

User speaks to enumerate additional ingredients they have, and the system detects and adds them to the list.

**Why this priority**: Primary method for expanding ingredient list; reuses existing voice component.

**Independent Test**: User activates microphone, speaks ingredient names, and sees new ingredients appear in the list.

**Acceptance Scenarios**:

1. **Given** user on step 3, **When** user activates microphone and says "I have eggs, milk, and flour", **Then** system processes audio, LLM extracts ingredient names, and helper function matches them against DB
2. **Given** LLM returned ingredient names, **When** helper function finds matches in ingredients table, **Then** matched ingredients appear in the list
3. **Given** LLM returned an unknown item name, **When** helper function finds no match, **Then** item still appears in the list (will become unrecognized_item on persist)
4. **Given** recording in progress, **When** max duration (60s) reached, **Then** recording auto-stops and processes
5. **Given** ingredients added successfully, **When** list updates, **Then** toast message appears saying "Ingredient list has been updated"

---

### User Story 5 - Remove Ingredients via Voice (Priority: P2)

User speaks to indicate an ingredient is no longer available, and the system removes it from the list.

**Why this priority**: Enables correction of initial selections without manual UI interaction.

**Independent Test**: User says an ingredient is no longer available; it disappears from the list.

**Acceptance Scenarios**:

1. **Given** "butter" is in the list, **When** user says "I no longer have butter", **Then** "butter" is removed from the list
2. **Given** "eggs" and "milk" in list, **When** user says "I have cheese but ran out of eggs", **Then** "cheese" is added and "eggs" is removed
3. **Given** user mentions removing an item not in list, **When** processed, **Then** no error occurs; system ignores the removal silently
4. **Given** ingredients removed successfully, **When** list updates, **Then** toast message appears saying "Ingredient list has been updated"

---

### User Story 6 - Add Ingredients via Text (Priority: P2)

User types ingredients as alternative to voice input.

**Why this priority**: Fallback for users who cannot or prefer not to use voice.

**Independent Test**: User switches to text mode, types ingredients, submits, and sees them added.

**Acceptance Scenarios**:

1. **Given** user on step 3, **When** user clicks "Prefer to type instead?", **Then** text input field appears
2. **Given** text input visible, **When** user types "tomatoes, onion, garlic" and submits, **Then** system processes and adds detected ingredients
3. **Given** text input visible, **When** user types "remove rice, add pasta", **Then** "rice" removed and "pasta" added
4. **Given** ingredients added/removed via text, **When** list updates, **Then** toast message appears saying "Ingredient list has been updated"

---

### User Story 7 - Complete Onboarding with Persistence (Priority: P1)

User clicks "Complete Setup" and all ingredients (recognized + unrecognized) plus skill-based recipes are persisted to database.

**Why this priority**: Final step that commits user data; critical for app functionality.

**Independent Test**: Click "Complete Setup" and verify database contains all ingredients and recipes with correct references.

**Acceptance Scenarios**:

1. **Given** user has recognized ingredients in list, **When** "Complete Setup" clicked, **Then** recognized ingredients added to user_inventory with quantity_level=3 and ingredient_id reference
2. **Given** user has unrecognized ingredients in list, **When** "Complete Setup" clicked, **Then** system checks if unrecognized item exists in user's unrecognized_items table
3. **Given** unrecognized item does NOT exist, **When** persisting, **Then** new entry created in unrecognized_items, then referenced in user_inventory with quantity_level=3
4. **Given** unrecognized item already exists for user, **When** persisting, **Then** existing unrecognized_item ID used in user_inventory (no duplicate created)
5. **Given** user selected "Basic" skill, **When** "Complete Setup" clicked, **Then** system adds 8 basic recipes: scrambled egg, pasta carbonara, pancake, mushroom omelette, spaghetti aglio e olio, grilled chicken and rice, roasted potato, roasted vegetable
6. **Given** user selected "Advanced" skill, **When** "Complete Setup" clicked, **Then** system adds all 8 basic recipes PLUS 8 advanced recipes: teriyaki chicken, caesar salad, cheese quesadilla, miso soup, cheeseburger, moussaka, grilled salmon and lemon, veal blanquette
7. **Given** "Complete Setup" clicked, **When** persistence starts, **Then** existing loading/preparation component is displayed
8. **Given** all items persisted successfully, **When** complete, **Then** user advances to completion screen and onboarding is marked complete

---

### Edge Cases

- What happens when user selects a cooking skill then navigates back to step 1? Selection preserved when returning to step 2.
- How does system handle voice/text input with no detected ingredients? Returns empty add/remove lists; no changes to ingredient list; toast shown saying "No updates were detected".
- What if user tries to remove all ingredients on step 3? "Complete Setup" button becomes disabled; user must have at least 1 ingredient to complete.
- What if LLM times out during voice/text processing? Show error message; allow retry; preserve current list.
- What if same ingredient name exists in both ingredients table and unrecognized_items? Helper function prioritizes ingredients table match (FR-029).

## Requirements *(mandatory)*

### Functional Requirements

**Step 2 - Cooking Skills Section**
- **FR-001**: System MUST display cooking skills question with exactly two options: "Basic" and "Advanced"
- **FR-002**: System MUST allow only single selection (radio behavior) for cooking skill
- **FR-003**: System MUST gray out unselected option after user makes a choice
- **FR-004**: System MUST hide hint text until BOTH cooking skill is selected AND at least one ingredient is selected
- **FR-005**: System MUST hide ingredients section until cooking skill is selected

**Step 2 - Ingredients Section**
- **FR-006**: System MUST display exactly 17 common ingredients: pasta, rice, salt, egg, garlic, bread, tomato, honey, noodle, bacon, milk, cheese, chicken, cream, onion, olive oil, butter (all singular form)
- **FR-007**: System MUST enable "Next Step" CTA only when at least one ingredient is selected
- **FR-008**: System MUST show hint near CTA only when CTA is enabled (skill + 1+ ingredients)
- **FR-009**: System MUST preserve selected ingredients when advancing to step 3

**Step 3 - Ingredients Display**
- **FR-010**: System MUST display all previously selected ingredients in a read-only list
- **FR-011**: System MUST use visually distinct styling for read-only items (different from step 2 selectable styling)
- **FR-012**: System MUST display title "Add more ingredients" (replacing "Review & Refine")
- **FR-013**: System MUST enable "Complete Setup" CTA only when ingredients list has at least 1 item
- **FR-014**: System MUST disable "Complete Setup" CTA when ingredients list is empty

**Step 3 - Toast Notifications**
- **FR-015**: System MUST display toast message "Ingredient list has been updated" when ingredients are added
- **FR-016**: System MUST display toast message "Ingredient list has been updated" when ingredients are removed
- **FR-037**: System MUST display toast message "No updates were detected" when LLM returns empty add/remove arrays

**Step 3 - Voice/Text Instructions**
- **FR-017**: System MUST display updated instructions with examples for adding ingredients
- **FR-018**: Instructions MUST include example: adding ingredients (e.g., "I have eggs, butter, and cheese")
- **FR-019**: Instructions MUST include example: adding ingredients while removing one (e.g., "I bought tomatoes and onions, but I ran out of milk")
- **FR-020**: System MUST provide "Prefer to type instead?" fallback option

**Step 3 - LLM Extraction (Structured Response)**
- **FR-021**: LLM MUST receive the current ingredient list as input context
- **FR-022**: LLM MUST return a structured response with two arrays: `add` (string[], ingredients to add) and `rm` (string[], ingredients to remove) - short field names for token efficiency
- **FR-038**: System MUST use cursor pointer on all clickable elements during onboarding
- **FR-039**: Disabled buttons MUST appear visually disabled (reduced opacity, no hover effects)
- **FR-023**: LLM MUST extract only ingredient names (no dishes)
- **FR-024**: LLM MUST normalize ingredient names to singular form

**Step 3 - Ingredient Matching Helper Function**
- **FR-025**: Helper function MUST accept a list of ingredient names (strings) as input
- **FR-026**: Helper function MUST match names against the `ingredients` table (case-insensitive)
- **FR-027**: Helper function MUST match names against the user's `unrecognized_items` table (case-insensitive)
- **FR-028**: Helper function MUST return structured output: `{ingredients: IngredientSchema[], unrecognized_items: UnrecognizedItemSchema[], unrecognized_items_to_create: string[]}`
- **FR-029**: Helper function MUST prioritize `ingredients` table match over `unrecognized_items` match when same name exists in both
- **FR-030**: System MUST display all ingredients (recognized and unrecognized) with same visual treatment

**Step 3 - Persistence (Ingredients)**
- **FR-031**: System MUST add recognized ingredients to user_inventory with ingredient_id and quantity_level=3
- **FR-032**: System MUST create new unrecognized_items entries for items in `unrecognized_items_to_create`
- **FR-033**: System MUST add ALL unrecognized ingredients (existing + newly created) to user_inventory with unrecognized_item_id and quantity_level=3
- **FR-040**: System MUST include newly created unrecognized items in recipe_ingredients if they appear in static recipe definitions

**Step 3 - Persistence (Recipes based on Skill)**
- **FR-034**: System MUST add 8 basic recipes for "Basic" skill: scrambled egg, pasta carbonara, pancake, mushroom omelette, spaghetti aglio e olio, grilled chicken and rice, roasted potato, roasted vegetable
- **FR-035**: System MUST add all 8 basic recipes PLUS 8 advanced recipes for "Advanced" skill: teriyaki chicken, caesar salad, cheese quesadilla, miso soup, cheeseburger, moussaka, grilled salmon and lemon, veal blanquette
- **FR-036**: System MUST display existing loading/preparation component during persistence (unchanged from current implementation)

### Key Entities

- **Cooking Skill**: Transient user selection (Basic/Advanced) used only during onboarding to determine which recipe set to pre-fill; not persisted to database
- **Common Ingredients**: Fixed list of 17 frequently-owned household ingredients (singular form)
- **Recognized Ingredient**: Ingredient name matched against ingredients table (5,931 items)
- **Unrecognized Ingredient**: Ingredient name not found in ingredients table; stored in unrecognized_items
- **User Inventory Entry**: Links user to either ingredient_id OR unrecognized_item_id (XOR constraint) with quantity_level
- **Ingredient Match Result**: Helper function output containing matched ingredients, matched unrecognized_items, and names requiring new unrecognized_items creation
- **Basic Recipe Set**: 8 beginner-friendly dishes added for all users
- **Advanced Recipe Set**: 8 additional complex dishes added only for advanced skill users

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users complete step 2 (skill + ingredients selection) in under 60 seconds on average
- **SC-002**: 95% of users successfully advance from step 2 to step 3 on first attempt
- **SC-003**: Voice input successfully detects and processes spoken ingredients within 5 seconds of recording stop
- **SC-004**: 90% of common ingredient names spoken by users are correctly recognized
- **SC-005**: Users can complete full onboarding (steps 1-4) in under 3 minutes
- **SC-006**: Zero data loss - all selected/spoken ingredients persist to database on "Complete Setup"
- **SC-007**: Unrecognized ingredients appear in user's inventory and are available for future resolution
- **SC-008**: Toast notifications appear within 500ms of list update

## Assumptions

- Common ingredients list is finalized (17 items provided by product owner)
- Recipe names are finalized (8 basic + 8 advanced provided by product owner)
- Recipe generation will use existing LLM flow to create recipe_ingredients entries
- Cooking skill selection is transient (not persisted); used only to determine recipe set during onboarding
- Existing voice input hook (`useVoiceInput`) and component structure will be reused
- Existing Gemini 2.0 Flash integration will return structured add/remove arrays; separate helper function handles DB matching
- Step 1 (welcome), step 4 (completion), and loading/preparation component remain unchanged
