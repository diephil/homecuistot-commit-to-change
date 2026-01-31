# Feature Specification: Unrecognized Items Schema Migration

**Feature Branch**: `018-unrecognized-items-schema`
**Created**: 2026-01-31
**Status**: Draft
**Input**: User description: "DB migration to add unrecognized_item_id column to recipe_ingredients and user_inventory tables, with XOR constraint (either ingredient_id or unrecognized_item_id must be set, not both)"

## Clarifications

### Session 2026-01-31

- Q: What uniqueness strategy for nullable ingredient_id columns? → A: Two partial unique indexes per table: `(user_id, ingredient_id)` WHERE ingredient_id NOT NULL + `(user_id, unrecognized_item_id)` WHERE unrecognized_item_id NOT NULL

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Schema Supports Unrecognized Items in Recipe Ingredients (Priority: P1)

As a developer, I need the recipe_ingredients table to reference either a known ingredient OR an unrecognized item, so that recipes can include items that haven't been matched to the ingredient taxonomy.

**Why this priority**: Foundation for future unrecognized item handling; no features work without this schema change.

**Independent Test**: Run migration, verify recipe_ingredients table accepts rows with unrecognized_item_id instead of ingredient_id.

**Acceptance Scenarios**:

1. **Given** the migration is applied, **When** inserting a recipe_ingredient with only unrecognized_item_id set, **Then** the row is saved successfully
2. **Given** the migration is applied, **When** inserting a recipe_ingredient with only ingredient_id set, **Then** the row is saved successfully
3. **Given** the migration is applied, **When** inserting a recipe_ingredient with both NULL, **Then** the insert fails with constraint violation
4. **Given** the migration is applied, **When** inserting a recipe_ingredient with both set, **Then** the insert fails with constraint violation

---

### User Story 2 - Schema Supports Unrecognized Items in User Inventory (Priority: P1)

As a developer, I need the user_inventory table to reference either a known ingredient OR an unrecognized item, so that users can track items that haven't been matched to the ingredient taxonomy.

**Why this priority**: Same importance as P1; both tables need identical treatment.

**Independent Test**: Run migration, verify user_inventory table accepts rows with unrecognized_item_id instead of ingredient_id.

**Acceptance Scenarios**:

1. **Given** the migration is applied, **When** inserting a user_inventory row with only unrecognized_item_id set, **Then** the row is saved successfully
2. **Given** the migration is applied, **When** inserting a user_inventory row with only ingredient_id set, **Then** the row is saved successfully
3. **Given** the migration is applied, **When** inserting a user_inventory row with both NULL, **Then** the insert fails with constraint violation
4. **Given** the migration is applied, **When** inserting a user_inventory row with both set, **Then** the insert fails with constraint violation

---

### User Story 3 - TypeScript Schema Reflects Database Changes (Priority: P1)

As a developer, I need the Drizzle ORM schema files to match the new database structure, so that application code can work with unrecognized items.

**Why this priority**: Code won't compile/work without matching TypeScript definitions.

**Independent Test**: Run `pnpm build` - no TypeScript errors related to schema changes.

**Acceptance Scenarios**:

1. **Given** schema files are updated, **When** building the project, **Then** build succeeds with no type errors
2. **Given** schema files are updated, **When** running `pnpm db:generate`, **Then** migration is generated matching the schema

---

### Edge Cases

- What happens to existing rows where ingredient_id is NOT NULL? → Existing data remains valid (ingredient_id already set)
- How does the unique index on (user_id, ingredient_id) work when ingredient_id is NULL? → Use partial unique indexes: one for ingredient_id NOT NULL, one for unrecognized_item_id NOT NULL
- What about foreign key constraint on DELETE behavior? → unrecognized_item_id should use 'restrict' like ingredient_id

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add nullable `unrecognized_item_id` column to `recipe_ingredients` table referencing `unrecognized_items.id`
- **FR-002**: System MUST add nullable `unrecognized_item_id` column to `user_inventory` table referencing `unrecognized_items.id`
- **FR-003**: System MUST make `ingredient_id` nullable in both `recipe_ingredients` and `user_inventory` tables
- **FR-004**: System MUST enforce XOR constraint: exactly one of (ingredient_id, unrecognized_item_id) must be set per row
- **FR-005**: System MUST use partial unique indexes on `user_inventory`: `(user_id, ingredient_id)` WHERE ingredient_id NOT NULL + `(user_id, unrecognized_item_id)` WHERE unrecognized_item_id NOT NULL
- **FR-006**: System MUST use partial unique indexes on `recipe_ingredients`: `(recipe_id, ingredient_id)` WHERE ingredient_id NOT NULL + `(recipe_id, unrecognized_item_id)` WHERE unrecognized_item_id NOT NULL
- **FR-007**: System MUST update Drizzle ORM TypeScript schema to reflect all database changes
- **FR-008**: System MUST update Drizzle relations to include unrecognized_items references
- **FR-009**: Migration MUST preserve all existing data (no data loss)

### Key Entities

- **unrecognized_items**: Already exists - stores items user added that couldn't be matched to taxonomy (id, user_id, raw_text, context, resolved_at, created_at)
- **recipe_ingredients**: Junction table linking recipes to ingredients; now can reference unrecognized_items instead
- **user_inventory**: User's ingredient inventory; now can reference unrecognized_items instead

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Migration applies successfully to database without errors
- **SC-002**: All existing data preserved after migration (row count unchanged)
- **SC-003**: Project builds without TypeScript errors after schema updates
- **SC-004**: XOR constraint correctly rejects invalid inserts (100% of test cases pass)
- **SC-005**: Rollback migration exists and can restore previous schema state

## Assumptions

- The `unrecognized_items` table already exists and has the expected schema
- No existing application code relies on `ingredient_id` being NOT NULL (safe to make nullable)
- This is a development-only change; production migration strategy handled separately
- Foreign key ON DELETE behavior for unrecognized_item_id follows same pattern as ingredient_id ('restrict')

## Out of Scope

- UI changes to display unrecognized items
- API endpoints for managing unrecognized items
- Business logic for resolving unrecognized items to known ingredients
- Any feature implementation beyond schema migration
