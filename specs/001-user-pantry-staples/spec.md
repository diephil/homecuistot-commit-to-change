# Feature Specification: User Pantry Staples

**Feature Branch**: `001-user-pantry-staples`
**Created**: 2026-01-26
**Status**: Draft
**Input**: Replace `isAssumed` with user-specific pantry staples table and remove ingredient aliases table

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Ingredient as Pantry Staple (Priority: P1)

As a user, I want to mark certain ingredients as "always have" staples so recipe suggestions assume I have them without needing to add them to my inventory each time.

**Why this priority**: Core functionality - without staple marking, users must repeatedly add common ingredients (salt, oil, pepper) to inventory.

**Independent Test**: User can mark an ingredient as staple and verify it persists across sessions.

**Acceptance Scenarios**:

1. **Given** user is viewing an ingredient, **When** user marks it as pantry staple, **Then** the ingredient is saved to their personal staples list
2. **Given** user has marked an ingredient as staple, **When** user views their staples list, **Then** the ingredient appears in the list
3. **Given** user is not authenticated, **When** user attempts to mark a staple, **Then** user is prompted to log in

---

### User Story 2 - Remove Ingredient from Pantry Staples (Priority: P1)

As a user, I want to remove ingredients from my pantry staples when I no longer keep them on hand.

**Why this priority**: Equal priority with marking - users need full control over their staples list.

**Independent Test**: User can remove a previously marked staple and verify it no longer appears.

**Acceptance Scenarios**:

1. **Given** user has an ingredient marked as staple, **When** user removes it from staples, **Then** the ingredient no longer appears in their staples list
2. **Given** user removes a staple, **When** checking recipe suggestions, **Then** that ingredient is no longer assumed available

---

### User Story 3 - View Pantry Staples List (Priority: P2)

As a user, I want to view all my pantry staples in one place to manage what I always have on hand.

**Why this priority**: Supporting feature - enables users to audit and manage their staples efficiently.

**Independent Test**: User can navigate to staples list and see all marked ingredients.

**Acceptance Scenarios**:

1. **Given** user has multiple ingredients marked as staples, **When** user views their staples list, **Then** all staples are displayed
2. **Given** user has no staples marked, **When** user views their staples list, **Then** empty state with guidance is shown

---

### Edge Cases

- What happens when user marks the same ingredient as staple twice? → Silently ignored (idempotent)
- What happens when an ingredient is deleted from the system? → User's staple entry is cascade deleted
- What happens when user account is deleted? → All their staple entries are removed
- What is the maximum number of staples per user? → No artificial limit (reasonable practical limit ~500)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to mark any ingredient as a personal pantry staple
- **FR-002**: System MUST allow users to remove ingredients from their pantry staples list
- **FR-003**: System MUST prevent duplicate staple entries for the same user-ingredient combination
- **FR-004**: System MUST cascade delete staple entries when the referenced ingredient is deleted
- **FR-005**: System MUST persist staples per user (not shared across users)
- **FR-006**: System MUST remove the ingredient aliases table and all related functionality
- **FR-007**: System MUST update any existing code that references ingredient aliases to handle removal gracefully

### Key Entities

- **UserPantryStaple**: Links a user to an ingredient they always have on hand
  - Attributes: user reference, ingredient reference, created timestamp
  - Unique constraint: one entry per user-ingredient combination
  - Relationship: belongs to one ingredient, belongs to one user

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add an ingredient to staples in under 2 seconds (UI responsiveness)
- **SC-002**: Users can view their full staples list in a single view
- **SC-003**: Staple data persists correctly across user sessions (100% data integrity)
- **SC-004**: Removing a staple reflects immediately in the user's list
- **SC-005**: Ingredient aliases table is fully removed with zero remaining references in codebase

## Assumptions

- Users are authenticated via existing Supabase Auth
- User ID is available in the application context for database operations
- The `isAssumed` column has already been removed from the ingredients table
- Ingredient aliases feature is not in active use and can be safely removed
