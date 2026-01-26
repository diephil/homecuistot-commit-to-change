# Feature Specification: Schema Cleanup & User Pantry Staples Table

**Feature Branch**: `010-user-pantry-staples`
**Created**: 2026-01-26
**Status**: In Progress
**Input**: Remove ingredient aliases table, add userPantryStaples table for future use

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the ingredient aliases table and all related functionality
- **FR-002**: System MUST update any existing code that references ingredient aliases to handle removal gracefully
- **FR-003**: System MUST create userPantryStaples table linking users to their staple ingredients

### Key Entities

- **UserPantryStaple** (database table, for future use): Links a user to an ingredient they always have on hand
  - Attributes: user reference, ingredient reference, created timestamp
  - Note: Table created but UI not implemented in this feature

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ingredient aliases table is fully removed with zero remaining references in codebase
- **SC-002**: userPantryStaples table created with proper indexes and foreign key constraints

## Assumptions

- Users are authenticated via existing Supabase Auth
- User ID is available in the application context for database operations
- The `isAssumed` column has already been removed from the ingredients table
- Ingredient aliases feature is not in active use and can be safely removed
