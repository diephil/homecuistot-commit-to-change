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

### User Story 4 - View Ingredients Separated by Storage Location (Priority: P1)

As a user, I want to see my ingredients separated into "Pantry Items" and "Fridge Items" in the Review & Refine view so I can quickly understand what I have and where it's stored.

**Why this priority**: Currently ingredients are mixed under "Available Ingredients" - separating them improves scannability and matches the final view's structure.

**Independent Test**: User adds ingredients via voice/text and sees them categorized into separate Pantry and Fridge sections.

**Acceptance Scenarios**:

1. **Given** user has added pantry ingredients (flour, rice, pasta), **When** viewing Review & Refine, **Then** those items appear under "Pantry Items" section
2. **Given** user has added fridge ingredients (milk, eggs, cheese), **When** viewing Review & Refine, **Then** those items appear under "Fridge Items" section
3. **Given** user has both pantry and fridge items, **When** viewing Review & Refine, **Then** items are displayed in two distinct labeled sections
4. **Given** user has only fridge items, **When** viewing Review & Refine, **Then** only "Fridge Items" section is shown (pantry section hidden or empty state)
5. **Given** user says "I have rice, milk, and olive oil", **When** LLM extracts ingredients, **Then** output includes storage location: rice→pantry, milk→fridge, olive oil→pantry

---

### Edge Cases

- What happens when user marks the same ingredient as staple twice? → Silently ignored (idempotent)
- What happens when an ingredient is deleted from the system? → User's staple entry is cascade deleted
- What happens when user account is deleted? → All their staple entries are removed
- What is the maximum number of staples per user? → No artificial limit (reasonable practical limit ~500)
- How are ingredients categorized as pantry vs fridge? → LLM determines at extraction time based on typical storage (shelf-stable = pantry, perishable = fridge)
- What if LLM can't determine storage location? → Default to fridge (safer assumption for perishables)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to mark any ingredient as a personal pantry staple
- **FR-002**: System MUST allow users to remove ingredients from their pantry staples list
- **FR-003**: System MUST prevent duplicate staple entries for the same user-ingredient combination
- **FR-004**: System MUST cascade delete staple entries when the referenced ingredient is deleted
- **FR-005**: System MUST persist staples per user (not shared across users)
- **FR-006**: System MUST remove the ingredient aliases table and all related functionality
- **FR-007**: System MUST update any existing code that references ingredient aliases to handle removal gracefully
- **FR-008**: System MUST display ingredients in Review & Refine view separated into "Pantry Items" and "Fridge Items" sections
- **FR-009**: System MUST categorize each ingredient as either pantry or fridge based on storage type
- **FR-010**: System MUST hide empty sections (if user has no pantry items, don't show empty Pantry section)
- **FR-011**: LLM structured output MUST include storage location (pantry or fridge) for each detected ingredient
- **FR-012**: System MUST use LLM-determined storage location to categorize ingredients at extraction time

### Key Entities

- **UserPantryStaple**: Links a user to an ingredient they always have on hand
  - Attributes: user reference, ingredient reference, created timestamp
  - Unique constraint: one entry per user-ingredient combination
  - Relationship: belongs to one ingredient, belongs to one user

- **ExtractedIngredient** (LLM output structure): Represents an ingredient detected from user input
  - Attributes: ingredient name, storage location (pantry | fridge)
  - Used for: categorizing ingredients in Review & Refine view

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add an ingredient to staples in under 2 seconds (UI responsiveness)
- **SC-002**: Users can view their full staples list in a single view
- **SC-003**: Staple data persists correctly across user sessions (100% data integrity)
- **SC-004**: Removing a staple reflects immediately in the user's list
- **SC-005**: Ingredient aliases table is fully removed with zero remaining references in codebase
- **SC-006**: Review & Refine view displays ingredients in two clearly labeled sections (Pantry Items, Fridge Items)
- **SC-007**: LLM correctly identifies storage location for common ingredients (>90% accuracy for typical household items)

## Assumptions

- Users are authenticated via existing Supabase Auth
- User ID is available in the application context for database operations
- The `isAssumed` column has already been removed from the ingredients table
- Ingredient aliases feature is not in active use and can be safely removed
