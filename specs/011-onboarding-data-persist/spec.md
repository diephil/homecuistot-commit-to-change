# Feature Specification: Onboarding Data Persistence

**Feature Branch**: `011-onboarding-data-persist`
**Created**: 2026-01-26
**Status**: Draft
**Input**: User description: "Save onboarding data to database with completion loading state and LLM-generated recipe details"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Onboarding with Data Persistence (Priority: P1)

User finishes onboarding and sees their ingredients/recipes saved to their account.

**Why this priority**: Core feature - without persisting data, onboarding is meaningless.

**Independent Test**: Complete onboarding with dishes+ingredients, verify data appears in user's inventory and recipes.

**Acceptance Scenarios**:

1. **Given** user on Step 3 with dishes and ingredients selected, **When** user clicks "Complete Setup", **Then** system slides to Step 4 completion screen.
2. **Given** user on Step 4 completion screen, **When** data persistence completes, **Then** completion animation displays for minimum 4 seconds.
3. **Given** user on Step 4 with persistence complete and 4 seconds elapsed, **When** timer finishes, **Then** user is redirected to /app.

---

### User Story 2 - Ingredient Matching & Storage (Priority: P1)

User's fridge/pantry items are matched against ingredient database and saved to their inventory.

**Why this priority**: Critical path - enables recipe matching features.

**Independent Test**: Add "eggs" and "milk" in onboarding, verify userInventory has matching ingredient records.

**Acceptance Scenarios**:

1. **Given** user with "Eggs" in ingredients list, **When** persistence runs, **Then** system finds "eggs" in ingredients table and creates userInventory record.
2. **Given** user with "Artisanal Cheese Blend" (no exact match), **When** persistence runs, **Then** system logs to unrecognizedItems for future resolution.
3. **Given** user with "chicken breast" and "Chicken Breast" (case variation), **When** persistence runs, **Then** system matches case-insensitively and creates single record.

---

### User Story 3 - Recipe Generation via LLM (Priority: P1)

Dish names are enriched with descriptions and ingredient lists via LLM.

**Why this priority**: Transforms raw dish names into useful recipe data.

**Independent Test**: Add "Pasta Carbonara" as dish, verify recipe saved with description and 1-6 ingredients.

**Acceptance Scenarios**:

1. **Given** user with "Scrambled Eggs" in dishes, **When** LLM processes, **Then** system generates description (max 15 words, 1 sentence) and ingredient names list (1-6 items).
2. **Given** LLM returns ingredient "eggs", **When** saving recipeIngredients, **Then** system looks up ingredient ID and creates link with ingredientType "anchor".
3. **Given** user with 5 dishes, **When** persistence runs, **Then** all 5 recipes are created with unique descriptions.

---

### User Story 4 - Completion Screen UX (Priority: P2)

User sees celebratory completion screen with animation during data save.

**Why this priority**: Good UX but not blocking if animation is simple.

**Independent Test**: Trigger completion, verify animation displays and minimum 4-second duration enforced.

**Acceptance Scenarios**:

1. **Given** user clicks "Complete Setup", **When** Step 4 displays, **Then** user sees message "Congrats! We're preparing your Home cook gears, one moment please."
2. **Given** data saves in 1 second, **When** checking redirect timing, **Then** redirect occurs at exactly 4 seconds (not earlier).
3. **Given** data saves in 6 seconds, **When** checking redirect timing, **Then** redirect occurs immediately after save (not artificially delayed).

---

### Edge Cases

- What happens when no ingredients match the database? System logs all to unrecognizedItems, creates recipes without ingredient links.
- What happens when LLM call fails? Retry once, on second failure save recipe with name only (no description/ingredients).
- What happens when user has 0 dishes but has ingredients? Save only userInventory, skip recipe creation.
- What happens when duplicate ingredient names exist in user's list? Deduplicate before lookup, create single record.
- What happens when user refreshes during Step 4? Idempotent saves - if records exist, don't duplicate.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add Step 4 to onboarding flow as completion/loading state
- **FR-002**: System MUST display "Congrats! We're preparing your Home cook gears, one moment please" on Step 4
- **FR-003**: System MUST show decorative animation on Step 4 matching neobrutalism design
- **FR-004**: System MUST enforce minimum 4-second display on Step 4 before redirect
- **FR-005**: System MUST redirect to /app after Step 4 completes
- **FR-006**: System MUST lookup ingredient names case-insensitively against ingredients table
- **FR-007**: System MUST create userInventory records for matched ingredients
- **FR-008**: System MUST set quantityLevel=3 (full) for new userInventory records
- **FR-009**: System MUST log unmatched ingredient names to unrecognizedItems with context="onboarding"
- **FR-010**: System MUST call LLM to generate recipe details (name, description, ingredients)
- **FR-011**: System MUST constrain LLM descriptions to 1 sentence, max 15 words
- **FR-012**: System MUST constrain LLM ingredient lists to 1-6 items per recipe
- **FR-013**: System MUST create recipes records with userId and isSeeded=false
- **FR-014**: System MUST create userRecipes junction records with source="onboarding"
- **FR-015**: System MUST create recipeIngredients links for matched ingredient names
- **FR-016**: System MUST use ingredientType="anchor" for LLM-suggested recipe ingredients
- **FR-017**: System MUST save userPantryStaples for pantry items (from existing pantry selection)
- **FR-018**: System MUST handle persistence errors gracefully without crashing Step 4

### Key Entities

- **userInventory**: User's ingredient stock with quantity levels (links user to ingredients)
- **recipes**: Dish with name, description, ownership (user-created via onboarding)
- **recipeIngredients**: Links recipe to its required ingredients with type classification
- **userRecipes**: Junction tracking user's saved recipes with acquisition source
- **unrecognizedItems**: Raw text items that couldn't be matched for later admin review
- **userPantryStaples**: User's pantry staple ingredients (always-have items)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users complete onboarding persistence flow in under 10 seconds (95th percentile)
- **SC-002**: 80%+ of user-entered ingredients match existing database records
- **SC-003**: 100% of dishes receive LLM-generated descriptions
- **SC-004**: Step 4 displays for exactly 4 seconds minimum on all successful flows
- **SC-005**: Zero data loss - all user inputs are either saved or logged as unrecognized
- **SC-006**: Users arriving at /app see their onboarded recipes and inventory immediately

## Assumptions

- Ingredients table has sufficient coverage for common household ingredients
- LLM (Gemini) can reliably generate recipe descriptions in specified format
- Ingredient name matching is case-insensitive but not fuzzy (exact match only after normalization)
- Animation follows existing neobrutalism patterns: bold borders, playful rotation, high contrast
- Step 4 uses same sliding transition pattern as Steps 1-3
