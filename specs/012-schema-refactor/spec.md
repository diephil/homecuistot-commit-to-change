# Feature Specification: Database Schema Refactoring

**Feature Branch**: `012-schema-refactor`
**Created**: 2026-01-27
**Status**: Draft
**Input**: User description: "remove the userpantrystaples table, instead we will put a boolean isPantryStaple into the useringredients table. Let's rename recipes table into user_recipies let's remove the isSeeded column as well."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Inventory Items as Pantry Staples (Priority: P1)

Users can mark any ingredient in their inventory as a "pantry staple" - items they always keep stocked (salt, oil, flour, etc.). This consolidates pantry staple tracking into the existing inventory system instead of maintaining a separate list.

**Why this priority**: Core functionality change - pantry staples must work correctly before any other schema changes matter. Users rely on this for meal planning.

**Independent Test**: Can be fully tested by adding an ingredient to inventory and toggling its pantry staple status. Delivers immediate value by simplifying data management.

**Acceptance Scenarios**:

1. **Given** a user has an ingredient in their inventory, **When** they mark it as a pantry staple, **Then** the ingredient is flagged as a staple and persists across sessions
2. **Given** a user has a pantry staple ingredient, **When** they unmark it, **Then** the ingredient remains in inventory but is no longer flagged as a staple
3. **Given** a user has existing pantry staples in the old table, **When** the migration runs, **Then** those staples are preserved as flags on the corresponding inventory items

---

### User Story 2 - Simplified Recipe Ownership (Priority: P2)

Recipes are now exclusively user-owned. The system no longer distinguishes between "seeded" system recipes and user recipes - all recipes belong to a user.

**Why this priority**: Simplifies recipe management logic and removes complexity from recipe-related features.

**Independent Test**: Can be fully tested by creating a recipe and verifying it's associated with the user without any seeding logic.

**Acceptance Scenarios**:

1. **Given** a user creates a new recipe, **When** saved, **Then** the recipe is stored with the user's ID and no seeding-related flags
2. **Given** existing user recipes exist, **When** the migration runs, **Then** recipes retain their user associations

---

### User Story 3 - Consistent Table Naming (Priority: P3)

The `recipes` table is renamed to `user_recipes` to follow the naming convention of other user-specific tables (user_inventory, user_recipes junction table).

**Why this priority**: Naming consistency improves developer experience but doesn't change user-facing functionality.

**Independent Test**: Can be fully tested by verifying all recipe operations work correctly against the renamed table.

**Acceptance Scenarios**:

1. **Given** the migration has run, **When** any recipe operation is performed, **Then** it works correctly with the renamed table
2. **Given** existing recipe data exists, **When** the migration runs, **Then** all data is preserved in the renamed table

---

### Edge Cases

- What happens when a user has pantry staples in the old table but no corresponding inventory entry? → Create inventory entry with default quantity and pantry staple flag
- What happens to the existing `user_recipes` junction table when `recipes` is renamed to `user_recipes`? → The junction table needs a new name to avoid conflict
- How are orphaned recipe ingredients handled after removing seeded recipes? → Cascade delete removes associated recipe_ingredients

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add an `isPantryStaple` boolean column to the `user_inventory` table (default: false)
- **FR-002**: System MUST migrate existing `user_pantry_staples` data to `isPantryStaple` flags in `user_inventory`
- **FR-003**: System MUST drop the `user_pantry_staples` table after successful migration
- **FR-004**: System MUST rename the `recipes` table to `user_recipes`
- **FR-005**: System MUST rename the existing `user_recipes` junction table to avoid naming conflict (e.g., `user_saved_recipes`)
- **FR-006**: System MUST remove the `isSeeded` column from recipes
- **FR-007**: System MUST remove the `recipe_ownership` check constraint that depends on `isSeeded`
- **FR-008**: System MUST update all foreign key references to reflect renamed tables
- **FR-009**: System MUST preserve all existing data during migration
- **FR-010**: System MUST make `userId` column NOT NULL on recipes (since all recipes are now user-owned)

### Key Entities

- **User Inventory (user_inventory)**: User's ingredient inventory with quantity tracking. Now includes `isPantryStaple` boolean to indicate always-stocked items.
- **User Recipes (formerly recipes)**: User-created recipes. Simplified to remove seeding logic - all recipes belong to a user.
- **User Saved Recipes (formerly user_recipes)**: Junction table linking users to recipes they've saved/bookmarked with source tracking.
- **Recipe Ingredients (recipe_ingredients)**: Ingredients required for a recipe. Foreign key updated to reference renamed table.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing pantry staple data is preserved and accessible after migration
- **SC-002**: 100% of existing recipe data is preserved and accessible after migration
- **SC-003**: All queries for pantry staples complete without needing to join a separate table
- **SC-004**: Zero data loss during migration (verified by row counts before/after)
- **SC-005**: All existing application features continue to work correctly after schema changes

## Assumptions

- No seeded/system recipes currently exist that need to be preserved (or they can be deleted)
- The application code referencing these tables will be updated alongside the migration
- A rollback strategy exists if migration fails
- The junction table `user_recipes` will be renamed to `user_saved_recipes` to avoid conflict with the renamed `recipes` table
