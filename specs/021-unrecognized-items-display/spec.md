# Feature Specification: Unrecognized Items Display

**Feature Branch**: `021-unrecognized-items-display`
**Created**: 2026-01-31
**Status**: Draft
**Input**: User description: "On the inventory page, I want to see my list of unrecognized items. However, I want them to be listed at the end of the tracked ingredients list. I want unrecognized items to be grayed out so I cannot change their quantities and cannot click on them. I also cannot mark unrecognized items as a pantry staple; the only action available should be to delete them. We need to explain in the help model that the system does not recognize those items yet and might recognize them in the future. deleting them removes them from the user_inventory but do not remove them from the unrecognized_items table. I also want to refactor the star icon and change it to the infinity symbol instead. I also want to put a hint below the pantry staples section that says that a pantry staple is a food that is considered a basic or important food that you have a supply of it in your kitchen and should be considered always available."

## Clarifications

### Session 2026-01-31

- Q: How should help/documentation for unrecognized items be presented to users? → A: Add to existing help modal accessed via "?" button
- Q: When deleting an unrecognized item fails (network error, server error), what user feedback should be provided? → A: Error message only - Display error toast/notification stating "Failed to delete item" with no action
- Q: What specific visual styling should distinguish unrecognized items from regular ingredients? → A: Reduced opacity with muted text - Combine reduced opacity with gray/muted text color

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Unrecognized Items (Priority: P1)

Users who added items during onboarding or recipe editing need to see which items the system could not match to its ingredient database. These unrecognized items appear on the inventory page, clearly separated from recognized ingredients, allowing users to understand what the system couldn't process and manage these items accordingly.

**Why this priority**: Core visibility feature - without this, users won't know which items failed recognition and will be confused about missing inventory items. This is the minimum viable functionality.

**Independent Test**: Can be fully tested by adding an unrecognized item to user_inventory (via database or onboarding flow) and verifying it appears at the end of the inventory list with visual distinction from regular ingredients. Delivers immediate value by making unrecognized items visible.

**Acceptance Scenarios**:

1. **Given** user has both recognized ingredients and unrecognized items in inventory, **When** user views inventory page, **Then** unrecognized items appear at the end of the list, after all recognized ingredients
2. **Given** user has only unrecognized items in inventory, **When** user views inventory page, **Then** unrecognized items appear in the list with visual distinction (reduced opacity and muted text color)
3. **Given** user has no unrecognized items in inventory, **When** user views inventory page, **Then** only recognized ingredients appear with no special section or visual indicators

---

### User Story 2 - Limited Interaction with Unrecognized Items (Priority: P2)

Users attempting to interact with unrecognized items need clear feedback that these items have restricted functionality. Unlike recognized ingredients, unrecognized items cannot have their quantities adjusted or be marked as pantry staples, providing a consistent experience that guides users toward the only available action: deletion.

**Why this priority**: Prevents user confusion and errors when trying to manage unrecognized items. Essential for user experience but can be tested independently after P1 visibility is working.

**Independent Test**: Can be tested by clicking on an unrecognized item and verifying that quantity controls and pantry staple checkbox are disabled/non-interactive, while delete action remains available. Delivers value by preventing failed actions and user frustration.

**Acceptance Scenarios**:

1. **Given** user views an unrecognized item, **When** user attempts to change quantity level, **Then** quantity controls are non-interactive (grayed out, disabled, or not rendered)
2. **Given** user views an unrecognized item, **When** user looks for pantry staple option, **Then** pantry staple checkbox/control is not available or is disabled
3. **Given** user views an unrecognized item, **When** user attempts to click on the item, **Then** no detail view or edit modal opens (item is non-clickable)
4. **Given** user views an unrecognized item, **When** user looks for available actions, **Then** only delete action is visible and interactive

---

### User Story 3 - Delete Unrecognized Items (Priority: P3)

Users who want to clean up unrecognized items from their inventory need the ability to remove them. Deletion removes the item from the user's visible inventory while preserving the unrecognized item record for potential future matching or system improvement.

**Why this priority**: Provides cleanup mechanism for unrecognized items. Lower priority because users can still function with unrecognized items visible, though deletion improves overall inventory hygiene.

**Independent Test**: Can be tested by deleting an unrecognized item and verifying it disappears from inventory page but remains in unrecognized_items table. Delivers value by allowing users to manage their inventory and remove unwanted unrecognized entries.

**Acceptance Scenarios**:

1. **Given** user has unrecognized item in inventory, **When** user triggers delete action, **Then** item is removed from user_inventory table
2. **Given** user deletes an unrecognized item, **When** deletion completes, **Then** unrecognized_items table record remains unchanged (not deleted)
3. **Given** user deletes an unrecognized item, **When** user refreshes inventory page, **Then** deleted item no longer appears in the list
4. **Given** user deletes their last unrecognized item, **When** inventory page reloads, **Then** no unrecognized items section appears

---

### User Story 4 - Help Documentation (Priority: P4)

Users who encounter unrecognized items for the first time need contextual help explaining what these items are, why they exist, and what they can do about them. Help documentation provides clarity that the system may recognize these items in future updates and explains the limited interaction model.

**Why this priority**: Educational enhancement that improves understanding but not blocking for core functionality. Users can still use the feature without this explanation, though it improves overall experience.

**Independent Test**: Can be tested by opening help content (modal, tooltip, or info section) and verifying it contains explanation of unrecognized items, future recognition possibility, and deletion behavior. Delivers value by reducing user confusion and support burden.

**Acceptance Scenarios**:

1. **Given** user clicks "?" button to open help modal, **When** help content displays, **Then** explanation states system does not currently recognize these items
2. **Given** user reads help content in modal, **When** viewing future recognition section, **Then** content explains items might be recognized in future system updates
3. **Given** user reads deletion help in modal, **When** viewing deletion explanation, **Then** content clarifies deletion removes from visible inventory but preserves unrecognized item record
4. **Given** user is on inventory page, **When** user clicks "?" button, **Then** help modal opens with section explaining unrecognized items

---

### User Story 5 - Pantry Staple UI Improvements (Priority: P4)

Users who interact with pantry staples need clear visual indicators and explanations to understand what pantry staples represent and how they function within the inventory system. An infinity symbol better represents the concept of "always available" items, and contextual help text reduces confusion for first-time users.

**Why this priority**: UI/UX enhancement that improves clarity and consistency. Not blocking for unrecognized items feature but improves overall inventory experience. Same priority as general help documentation.

**Independent Test**: Can be tested by viewing pantry staples section and verifying infinity icon appears instead of star icon, and hint text explaining pantry staples is visible below the section. Delivers value by improving user understanding of pantry staples concept.

**Acceptance Scenarios**:

1. **Given** user views inventory page with pantry staples, **When** pantry staple items are displayed, **Then** infinity symbol (∞) icon appears instead of star icon
2. **Given** user views pantry staples section, **When** looking below the section header, **Then** hint text explains pantry staples are basic/important foods with regular supply that should be considered always available
3. **Given** user has no pantry staples, **When** viewing inventory page, **Then** hint text is not displayed (only shows when pantry staples section is present)
4. **Given** user marks an item as pantry staple, **When** item updates, **Then** infinity icon appears next to the item

---

### Edge Cases

- What happens when user has hundreds of unrecognized items (performance, scrolling, pagination)?
- How does the system handle unrecognized items with very long raw text names (display truncation, wrapping)?
- What happens when an unrecognized item is simultaneously deleted by user (optimistic UI update vs server state)?
- How does the system behave when unrecognized_items table record is manually deleted or corrupted (orphaned user_inventory reference)?
- What feedback does user receive when delete action fails (network error, database constraint violation)? → Display error toast/notification with failure message, no retry action

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display unrecognized items at the end of the inventory list, after all recognized ingredients
- **FR-002**: System MUST visually distinguish unrecognized items from recognized ingredients using reduced opacity (50-60%) combined with muted text color
- **FR-003**: System MUST prevent quantity level changes for unrecognized items (controls disabled or not rendered)
- **FR-004**: System MUST prevent marking unrecognized items as pantry staples (control disabled or not rendered)
- **FR-005**: System MUST prevent clicking/selecting unrecognized items to view details or edit
- **FR-006**: System MUST provide delete action for unrecognized items
- **FR-007**: System MUST remove unrecognized item from user_inventory table when deleted
- **FR-008**: System MUST preserve unrecognized_items table record when user deletes from inventory
- **FR-009**: System MUST provide help/documentation in existing help modal (accessed via "?" button) explaining unrecognized items, future recognition, and deletion behavior
- **FR-010**: System MUST display unrecognized item's raw text as the display name
- **FR-011**: System MUST display infinity symbol (∞) icon for pantry staple items instead of star icon
- **FR-012**: System MUST display hint text below pantry staples section explaining that pantry staples are basic/important foods with regular supply that should be considered always available
- **FR-013**: System MUST hide pantry staple hint text when no pantry staples exist in inventory
- **FR-014**: System MUST display error toast/notification when delete action fails, stating failure without retry action

### Key Entities

- **User Inventory Entry**: Represents an item in user's inventory, can reference either a recognized ingredient or an unrecognized item via XOR constraint (ingredientId OR unrecognizedItemId)
- **Unrecognized Item**: Persistent record of items the system could not match to ingredient database, contains raw text input and optional context
- **Recognized Ingredient**: Standard ingredient from system's ingredient database with full metadata and taxonomy

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all unrecognized items in their inventory within 2 seconds of loading inventory page
- **SC-002**: Users successfully delete unrecognized items with 100% success rate (no accidental deletions of recognized ingredients)
- **SC-003**: 90% of users understand unrecognized items are not fully supported after reading help documentation (measurable via user testing or support ticket reduction)
- **SC-004**: Zero instances of users successfully changing quantity or pantry staple status of unrecognized items (interaction controls are fully disabled)
- **SC-005**: Inventory page loads and displays correctly with up to 500 total items (recognized + unrecognized) in under 3 seconds

### User Experience

- **UX-001**: Unrecognized items are visually distinct and clearly separated from regular inventory items
- **UX-002**: Users immediately understand which actions are available for unrecognized items (only delete)
- **UX-003**: Help content is easily discoverable and provides clear explanation without requiring external documentation

## Assumptions

- User inventory page already exists and displays recognized ingredients
- Delete action pattern already exists in the UI (reusable component or established pattern)
- Help modal accessed via "?" button already exists in the application
- Unrecognized items are already being created and stored via onboarding or other flows
- Sorting and ordering logic for inventory list is already implemented
- Performance is acceptable for up to 500 total inventory items (combined recognized + unrecognized)

## Out of Scope

- Re-matching or re-processing unrecognized items to recognize them (future feature)
- Editing or modifying unrecognized item raw text
- Merging or combining unrecognized items
- Exporting or sharing unrecognized items
- Notifications when unrecognized items become recognized in future updates
- Bulk deletion of multiple unrecognized items
- Filtering or searching specifically for unrecognized items
- Analytics or tracking of which items are frequently unrecognized
