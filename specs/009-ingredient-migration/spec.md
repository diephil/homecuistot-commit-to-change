# Feature Specification: Ingredient Database Migration and Script Reorganization

**Feature Branch**: `009-ingredient-migration`
**Created**: 2026-01-26
**Status**: Draft
**Input**: User description: "use prefix 009: I want to move research/scripts/extract-ingredients.ts into @apps/nextjs/scripts. I also want to generate a migration file that will insert in ingredients the ones defined @research/en-ingredient-names.csv in batch sql statement insertions. Let's also update the TS code that references the ingredient categories so that they reflect the ones listed in @research/taxonomy.md instead"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Database Populated with Standard Ingredients (Priority: P1)

The system contains a comprehensive library of ingredient names and categories that can be used for recipe matching and meal planning. Users benefit from having ingredients automatically recognized and categorized without manual data entry.

**Why this priority**: Core data foundation for the entire meal planning feature - without ingredient data in the database, recipe parsing and meal suggestions cannot function.

**Independent Test**: Can be fully tested by querying the ingredients table after migration and verifying that all 2000+ ingredients from en-ingredient-names.csv are present with correct categories matching taxonomy.md. Delivers immediate value by enabling recipe ingredient matching.

**Acceptance Scenarios**:

1. **Given** the database is empty, **When** the migration runs, **Then** all ingredients from en-ingredient-names.csv are inserted into the ingredients table
2. **Given** the migration has run, **When** querying ingredients by category, **Then** each ingredient has a category matching the taxonomy definitions (e.g., "dairy", "meat", "vegetables")
3. **Given** duplicate ingredient names in the CSV, **When** the migration runs, **Then** only unique ingredients are inserted without errors

---

### User Story 2 - Script Organized in Proper Project Structure (Priority: P2)

Development team can easily find and maintain the ingredient extraction script as part of the Next.js application tooling rather than isolated in the research folder.

**Why this priority**: Improves maintainability and discoverability for developers, but doesn't block core functionality - the script's location doesn't affect runtime behavior.

**Independent Test**: Can be tested by running the script from its new location in apps/nextjs/scripts and verifying it executes successfully with the same functionality as before.

**Acceptance Scenarios**:

1. **Given** the script exists at research/scripts/extract-ingredients.ts, **When** the reorganization is complete, **Then** the script is located at apps/nextjs/scripts/extract-ingredients.ts
2. **Given** the script has been moved, **When** executing it from the new location, **Then** it functions identically to the original (same outputs, same behavior)
3. **Given** the script references relative paths, **When** moved to the new location, **Then** all import paths and file references are updated to work from the new location

---

### User Story 3 - Code Uses Correct Category Taxonomy (Priority: P3)

TypeScript code that references ingredient categories uses the standardized 30-category taxonomy defined in taxonomy.md, ensuring consistency across the application.

**Why this priority**: Important for maintainability and consistency, but can be addressed iteratively after core data is loaded - existing code with old categories would still function.

**Independent Test**: Can be tested by searching the codebase for ingredient category references and verifying they match the 30 categories from taxonomy.md (non_classified, e100_e199, ferments, dairy, etc.).

**Acceptance Scenarios**:

1. **Given** TypeScript code references ingredient categories, **When** the updates are complete, **Then** all category references match the 30 categories defined in taxonomy.md
2. **Given** hardcoded category values exist in the code, **When** refactoring is complete, **Then** categories are sourced from a shared constant or type definition
3. **Given** the category taxonomy is defined, **When** new code is written, **Then** TypeScript type checking enforces valid category values

---

### Edge Cases

- What happens when the migration is run multiple times? (Should be idempotent or fail gracefully if data already exists)
- How does the system handle CSV parsing errors or malformed ingredient data?
- What if the ingredients table schema changes between when the migration is created and when it's run?
- How are special characters and non-ASCII characters in ingredient names handled in SQL insertion?
- What if the CSV file contains more or fewer categories than defined in taxonomy.md?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Migration file MUST insert all ingredients from research/en-ingredient-names.csv into the ingredients database table
- **FR-002**: Migration MUST use batch SQL INSERT statements for efficient data loading (not individual row-by-row inserts)
- **FR-003**: Migration MUST map ingredient categories to the 30 standardized categories defined in research/taxonomy.md
- **FR-004**: Script extract-ingredients.ts MUST be relocated from research/scripts/ to apps/nextjs/scripts/
- **FR-005**: Relocated script MUST function identically to the original, with all import paths and dependencies updated
- **FR-006**: TypeScript code throughout the project MUST reference ingredient categories using the taxonomy.md definitions
- **FR-007**: Migration MUST be version-controlled and tracked by Drizzle's migration system
- **FR-008**: Migration MUST handle duplicate ingredient names gracefully (either skip or use ON CONFLICT clause)
- **FR-009**: Category values in TypeScript code MUST be type-safe (using enums, unions, or const assertions)
- **FR-010**: Migration MUST preserve data integrity if run on a database that already contains ingredient data

### Key Entities

- **Ingredient**: Represents a food ingredient with a name and category. Contains at minimum: name (string, required), category (one of 30 taxonomy values, required). Used for recipe parsing, meal planning, and pantry management.
- **Category**: One of 30 standardized classification types defined in taxonomy.md (e.g., dairy, meat, vegetables, ferments). Used to organize ingredients and support dietary filtering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Database contains all 2000+ unique ingredients from en-ingredient-names.csv after migration execution
- **SC-002**: Migration completes in under 5 seconds for the full ingredient dataset
- **SC-003**: 100% of ingredients have valid categories matching one of the 30 taxonomy.md definitions
- **SC-004**: Script executes successfully from apps/nextjs/scripts/ location without requiring path modifications
- **SC-005**: Zero TypeScript compilation errors related to ingredient category type mismatches
- **SC-006**: Migration can be rolled back without leaving orphaned data

## Scope *(mandatory)*

### In Scope

- Moving extract-ingredients.ts from research/scripts/ to apps/nextjs/scripts/
- Creating a Drizzle migration file to populate ingredients table with CSV data
- Updating script's import paths and file references for the new location
- Mapping CSV categories to the 30 taxonomy.md category definitions
- Refactoring TypeScript code to use taxonomy.md category values
- Implementing batch SQL INSERT statements in the migration
- Adding type safety for category values in TypeScript

### Out of Scope

- Creating new ingredient data beyond what's in en-ingredient-names.csv
- Building UI for ingredient management or browsing
- Implementing search or filtering functionality for ingredients
- Modifying the ingredients table schema
- Adding ingredient metadata (nutritional info, allergens, etc.)
- Localization or translation of ingredient names
- Creating API endpoints for ingredient access
- Setting up automated CSV import processes

## Assumptions *(mandatory)*

- **AS-001**: The ingredients table schema already exists in the database with appropriate columns (name, category at minimum)
- **AS-002**: The CSV file format (name,category) is consistent and follows standard CSV parsing rules
- **AS-003**: Drizzle ORM is properly configured for generating and running migrations
- **AS-004**: All 30 categories in taxonomy.md are valid values for the ingredients.category column
- **AS-005**: The extract-ingredients.ts script doesn't have external dependencies that would break when moved
- **AS-006**: UTF-8 encoding is used for all files (CSV, TypeScript, migration files)
- **AS-007**: The migration will run in a development environment first before production deployment

## Dependencies & Constraints *(optional)*

### Dependencies

- **DEP-001**: Drizzle ORM and drizzle-kit must be properly configured (already in place per CLAUDE.md)
- **DEP-002**: PostgreSQL database must be accessible (Supabase-hosted per CLAUDE.md)
- **DEP-003**: CSV parsing capability must be available in the migration environment
- **DEP-004**: TypeScript compilation must succeed for category type changes to be validated

### Constraints

- **CON-001**: Migration must be compatible with Drizzle's migration tracking system
- **CON-002**: SQL batch sizes should be reasonable (not loading all 2000+ rows in a single statement)
- **CON-003**: Category mappings must preserve the semantic meaning of ingredients
- **CON-004**: Script relocation must maintain version control history if possible
