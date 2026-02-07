# Feature Specification: Promote Unrecognized Items to First-Class Ingredients

**Feature Branch**: `030-unrecognized-items-support`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Promote unrecognized items (user-entered ingredients not in catalog) from second-class display-only items to fully functional ingredients across all app flows"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inventory Parity for Unrecognized Items (Priority: P1)

A user who added custom ingredients (not in the 5931-item catalog) during onboarding or voice input sees them in the same inventory list as recognized ingredients, with full quantity controls (0-3 slider), pantry staple toggle, and delete functionality. They appear under a "Non-Classified" category group alongside all other category groups.

**Why this priority**: Without inventory parity, unrecognized items remain inert display-only rows. This is the foundational change that all other stories depend on — users must be able to manage quantities before availability or cooking flows can work.

**Independent Test**: Can be fully tested by adding an unknown ingredient via onboarding voice input, then verifying it appears in inventory with working quantity controls and category grouping under "Non-Classified".

**Acceptance Scenarios**:

1. **Given** a user has unrecognized items in their inventory, **When** they view the inventory page, **Then** unrecognized items appear in the main inventory list under a "Non-Classified" category (not in a separate grayed-out section).
2. **Given** an unrecognized item is displayed in inventory, **When** the user changes its quantity level, **Then** the quantity updates and persists correctly (same behavior as recognized ingredients).
3. **Given** an unrecognized item is displayed in inventory, **When** the user toggles it as a pantry staple, **Then** the staple status updates and persists correctly.
4. **Given** an unrecognized item is displayed in inventory, **When** the user deletes it, **Then** it is removed from the inventory list.

---

### User Story 2 - Recipe Creation with Unrecognized Ingredients (Priority: P1)

A user creates a recipe (via voice or text) that references ingredients not in the catalog. The system matches these against the user's existing unrecognized items (by name, lowercase) and includes them in the recipe. The recipe displays all ingredient names correctly — both catalog and custom.

**Why this priority**: Equal priority with Story 1 because recipe creation is the core AI-driven flow. If unrecognized items can't be linked to recipes, they remain orphaned data.

**Independent Test**: Can be tested by creating a recipe via voice that mentions a known unrecognized item name, then verifying the recipe shows the ingredient with correct name and linkage.

**Acceptance Scenarios**:

1. **Given** a user has unrecognized item "truffle salt" in their inventory, **When** they create a recipe mentioning "truffle salt", **Then** the recipe links to the existing unrecognized item (not flagged as unknown).
2. **Given** a recipe contains both catalog and unrecognized ingredients, **When** the recipe is displayed, **Then** all ingredient names appear correctly (catalog names from ingredients table, custom names from unrecognized items' raw text).
3. **Given** a recipe is created with unrecognized ingredients, **When** the recipe is saved/persisted, **Then** the recipe_ingredients rows correctly reference either ingredientId or unrecognizedItemId (XOR pattern maintained).

---

### User Story 3 - Recipe Availability Includes Unrecognized Items (Priority: P2)

On the "Cook Now" page, recipe availability calculations include unrecognized ingredients. If a user has "truffle salt" in inventory at quantity > 0, recipes requiring "truffle salt" reflect it as available.

**Why this priority**: Availability is the primary decision-making signal on the Cook Now page. Without this, recipes with any unrecognized ingredient always show as missing ingredients, even if the user has them stocked.

**Independent Test**: Can be tested by checking a recipe's availability status on Cook Now when the user has all its unrecognized ingredients in stock vs. when they don't.

**Acceptance Scenarios**:

1. **Given** a recipe has unrecognized ingredient "truffle salt" and the user has "truffle salt" at quantity 2, **When** availability is computed, **Then** "truffle salt" counts as available.
2. **Given** a recipe has unrecognized ingredient "truffle salt" and the user has "truffle salt" at quantity 0 (and not a pantry staple), **When** availability is computed, **Then** "truffle salt" counts as missing.
3. **Given** a recipe has 3 catalog ingredients (all available) and 1 unrecognized ingredient (unavailable), **When** the availability badge is shown, **Then** it displays "almost-available" (1 missing).

---

### User Story 4 - Mark-as-Cooked Decrements Unrecognized Items (Priority: P2)

When a user marks a recipe as cooked, the ingredient quantity adjustment modal shows unrecognized ingredients alongside catalog ones. Quantity decrements apply correctly to unrecognized inventory items.

**Why this priority**: Completes the cooking lifecycle. Without this, marking a recipe as cooked silently ignores unrecognized ingredients, leading to stale inventory quantities.

**Independent Test**: Can be tested by marking a recipe with unrecognized ingredients as cooked and verifying their inventory quantities decrease.

**Acceptance Scenarios**:

1. **Given** a recipe with unrecognized ingredient "truffle salt" (user has quantity 2), **When** the mark-as-cooked modal opens, **Then** "truffle salt" appears in the ingredient list with proposed quantity decrement (2 -> 1).
2. **Given** the user confirms the mark-as-cooked action, **When** the action completes, **Then** the unrecognized item's inventory quantity updates to the confirmed value.
3. **Given** a recipe has both catalog and unrecognized ingredients, **When** mark-as-cooked is confirmed, **Then** all ingredient quantities (both types) update correctly in a single operation.

---

### User Story 5 - Recipe Editing with Unrecognized Ingredients (Priority: P3)

When editing an existing recipe, unrecognized ingredients appear in the edit form alongside catalog ingredients. Users can modify, remove, or add unrecognized ingredients during recipe edits.

**Why this priority**: Lower priority because recipe editing is less frequent than creation or cooking. However, it's needed for completeness — users shouldn't be locked out of modifying recipes that happen to contain custom ingredients.

**Independent Test**: Can be tested by opening the edit form for a recipe containing unrecognized ingredients and verifying they appear and can be modified.

**Acceptance Scenarios**:

1. **Given** a recipe has unrecognized ingredients, **When** the user opens the recipe edit form, **Then** unrecognized ingredients appear in the ingredient list (not filtered out).
2. **Given** the user removes an unrecognized ingredient from the edit form and saves, **When** the recipe reloads, **Then** the removed ingredient no longer appears.
3. **Given** the user edits a recipe and saves without changes, **When** the recipe reloads, **Then** all unrecognized ingredient links remain intact.

---

### Edge Cases

- What happens when two unrecognized items have the same raw text for the same user? Matching uses the first result; duplicates are per-user and lowercase-matched.
- What happens when a recipe references an unrecognized item that the user later deletes from inventory? The recipe_ingredients link remains; the ingredient shows as "unavailable" in availability calculations (quantity 0, not in inventory).
- What happens when a user has no unrecognized items? No behavioral change — the "Non-Classified" category group simply doesn't appear.
- What happens when an unrecognized item name partially matches a catalog ingredient? No auto-promotion. Matching is exact (lowercase). Post-hoc matching to catalog is explicitly out of scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display unrecognized inventory items in the same list as catalog ingredients, grouped under a "Non-Classified" category.
- **FR-002**: System MUST allow users to change quantity levels (0-3) on unrecognized inventory items, identical to catalog ingredient behavior.
- **FR-003**: System MUST allow users to toggle pantry staple status on unrecognized inventory items.
- **FR-004**: System MUST allow users to delete unrecognized inventory items from their inventory.
- **FR-005**: System MUST NOT display unrecognized items in a separate, visually diminished section.
- **FR-006**: System MUST match recipe ingredient names against the user's unrecognized items (lowercase, exact match) when creating or updating recipes.
- **FR-007**: System MUST persist recipe-to-unrecognized-item links using the existing XOR pattern (either ingredientId or unrecognizedItemId, never both).
- **FR-008**: System MUST display unrecognized ingredient names using their original raw text in all recipe views (recipe cards, availability cards, edit forms).
- **FR-009**: System MUST include unrecognized ingredients in recipe availability calculations, using their inventory quantity and pantry staple status.
- **FR-010**: System MUST include unrecognized ingredients in the mark-as-cooked quantity adjustment modal.
- **FR-011**: System MUST apply quantity decrements to unrecognized inventory items when a recipe is marked as cooked.
- **FR-012**: System MUST include unrecognized ingredients in the recipe edit form, allowing modification and removal.
- **FR-013**: System MUST assign all unrecognized items a default category of "non_classified".
- **FR-014**: System MUST scope unrecognized item matching to the current user only (no cross-user deduplication).
- **FR-015**: System MUST use lowercase matching when resolving ingredient names to unrecognized items.

### Key Entities

- **Unrecognized Item**: A user-entered ingredient not found in the 5931-item catalog. Key attributes: raw text (original name), owning user, category (always "non_classified"), resolution status.
- **User Inventory Entry**: A row linking a user to either a catalog ingredient OR an unrecognized item (XOR). Key attributes: quantity level (0-3), pantry staple flag.
- **Recipe Ingredient Link**: A row linking a recipe to either a catalog ingredient OR an unrecognized item (XOR). Key attributes: required/optional flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unrecognized inventory items display with functional quantity controls (no grayed-out or disabled items).
- **SC-002**: Recipes referencing unrecognized ingredients show correct availability status on the Cook Now page (matching inventory quantities).
- **SC-003**: Mark-as-cooked flow updates quantities for all ingredient types in a single operation with no silent skips.
- **SC-004**: Recipe edit form displays all ingredients (catalog and unrecognized) — zero ingredients filtered out due to type.
- **SC-005**: Users can complete the full lifecycle (add to inventory -> create recipe -> check availability -> cook -> update quantities) using only unrecognized items, with no workflow gaps.

## Assumptions

- The "Non-Classified" category label already exists or is handled by the category display system.
- Unrecognized items will never be auto-promoted to catalog ingredients as part of this feature (explicitly out of scope).
- The AI recipe agent does not need awareness of unrecognized items — matching happens post-hoc during proposal application.
- Per-user scoping means two users can independently have unrecognized items with the same raw text.
- Lowercase matching is sufficient; no fuzzy/phonetic matching is needed.

## Scope Boundaries

**In scope**:
- Full inventory controls for unrecognized items
- Recipe creation/edit/display with unrecognized ingredients
- Availability calculation including unrecognized items
- Mark-as-cooked flow for unrecognized ingredients
- Adding a category field to unrecognized items (defaulting to "non_classified")

**Out of scope**:
- Promote-to-catalog workflow (admin or automatic)
- Cross-user deduplication of unrecognized items
- Fuzzy or phonetic name matching
- AI agent awareness of unrecognized items (matching stays post-hoc)
- Ingredient search/autocomplete for unrecognized items
