# Feature Specification: Inventory Page Rework

**Feature Branch**: `014-inventory-page-rework`
**Created**: 2026-01-27
**Status**: Draft
**Input**: User description: "Rework inventory page with quantity badges, pantry staples section, voice-based inventory updates, and LLM-powered ingredient parsing"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Inventory with Quantity Levels (Priority: P1)

Users open the inventory page to see all their ingredients organized into two sections: "Available Ingredients" (with varying quantity levels) and "Pantry Staples" (always-available items). Each ingredient displays a color-coded dot matrix badge showing remaining quantity (0-3 uses).

**Why this priority**: Core functionality - users cannot manage inventory without first seeing it. Forms the foundation all other features build upon.

**Independent Test**: Can be fully tested by loading the inventory page with user data and verifying both sections render with correct badges. Delivers immediate value by giving users visibility into what they have.

**Acceptance Scenarios**:

1. **Given** user has ingredients in their inventory, **When** they open the inventory page, **Then** they see ingredients split into "Available Ingredients" and "Pantry Staples" sections
2. **Given** an ingredient has quantity level 2, **When** displayed, **Then** the dot matrix badge shows 2 filled dots and 1 empty dot with appropriate color coding
3. **Given** user has pantry staples, **When** viewing that section, **Then** they see an explanation that pantry staples are always considered available in recipes

---

### User Story 2 - Manually Adjust Ingredient Quantity (Priority: P2)

Users tap/click an ingredient badge in the "Available Ingredients" section to manually adjust its quantity level. A quantity selector appears allowing them to set the exact number of remaining uses (0-3).

**Why this priority**: Essential for data accuracy - voice input may not always be practical and users need direct control. Quick corrections are common (e.g., "I just used one egg").

**Independent Test**: Can be tested by clicking a badge and changing quantity level, then verifying the change persists. Delivers immediate value for manual inventory corrections.

**Acceptance Scenarios**:

1. **Given** user views an ingredient with level 3, **When** they tap the badge, **Then** a quantity selector appears with options 0-3
2. **Given** user selects quantity level 1 from the selector, **When** confirmed, **Then** the badge updates to show 1 filled dot and the change is saved
3. **Given** user sets quantity to 0, **When** saved, **Then** the ingredient remains visible but badge shows empty (0 dots filled)

---

### User Story 3 - Move Ingredients Between Sections (Priority: P2)

Users move ingredients between "Available Ingredients" and "Pantry Staples" sections. A toggle or action button next to each ingredient allows this transfer. Pantry staples are always considered available for recipe matching.

**Why this priority**: Core differentiation - pantry staples vs regular ingredients affects recipe recommendations. Users need to configure this based on their shopping habits.

**Independent Test**: Can be tested by moving an ingredient from one section to another and verifying it appears in the new section with correct status. Delivers value by allowing users to set staple items.

**Acceptance Scenarios**:

1. **Given** ingredient is in "Available Ingredients", **When** user taps the move-to-staples action, **Then** ingredient moves to "Pantry Staples" section
2. **Given** ingredient is in "Pantry Staples", **When** user taps the move-to-available action, **Then** ingredient moves back with its previous quantity level restored
3. **Given** ingredient is marked as pantry staple, **When** used in recipe matching, **Then** it is considered always available regardless of quantity level

---

### User Story 4 - Voice-Based Inventory Update (Priority: P3)

Users tap "Update Inventory" button to open a modal with voice input. They describe their inventory changes naturally (e.g., "I just bought milk and eggs", "I ran out of tomatoes", "I have enough pasta for two meals"). The system interprets their speech and shows proposed changes for confirmation.

**Why this priority**: Differentiating feature enabling hands-free updates. Builds on existing voice infrastructure. More complex than manual updates but significantly improves UX for bulk changes.

**Independent Test**: Can be tested by recording inventory updates via voice, reviewing proposed changes, and confirming. Delivers value by enabling fast bulk updates after grocery shopping.

**Acceptance Scenarios**:

1. **Given** user opens Update Inventory modal, **When** they tap microphone button, **Then** voice recording begins (max 60 seconds) with visual feedback
2. **Given** user says "I just bought milk and eggs", **When** recording stops, **Then** system shows milk and eggs with quantity level 3 (max) as proposed changes
3. **Given** user says "I have enough tomatoes for two meals", **When** processed, **Then** system shows tomatoes with quantity level 2 as proposed change
4. **Given** user says "I ran out of cheese", **When** processed, **Then** system shows cheese with quantity level 0 as proposed change
5. **Given** user reviews proposed changes, **When** they see "(2 → 3)" next to an ingredient, **Then** they understand previous vs new quantity level

---

### User Story 5 - Confirm or Cancel Inventory Updates (Priority: P3)

After voice input is processed, users see a summary of proposed changes with before/after comparisons. They can confirm to apply all changes or cancel to discard. Upon saving, they return to the inventory page with updated data.

**Why this priority**: Dependent on P3 voice input. Essential for completing the voice update flow - users must review AI interpretations before committing.

**Independent Test**: Can be tested by completing voice input and then either confirming or canceling changes, verifying correct outcome in each case.

**Acceptance Scenarios**:

1. **Given** user has reviewed proposed changes, **When** they tap Save, **Then** all changes are applied and they return to inventory page
2. **Given** user has reviewed proposed changes, **When** they tap Cancel, **Then** no changes are made and modal closes
3. **Given** changes include a new ingredient not in user's inventory, **When** confirmed, **Then** ingredient is added to inventory with proposed quantity level

---

### User Story 6 - Text Input Alternative for Inventory Updates (Priority: P4)

Users who prefer typing or cannot use voice can switch to text input within the Update Inventory modal. The same natural language processing applies to typed input.

**Why this priority**: Accessibility fallback. Voice isn't always practical (quiet environments, accessibility needs). Lower priority as voice is primary method.

**Independent Test**: Can be tested by switching to text input, typing inventory updates, and verifying same processing applies.

**Acceptance Scenarios**:

1. **Given** user is in voice mode, **When** they tap "Switch to typing", **Then** a text input field appears
2. **Given** user types "bought milk, used last egg", **When** submitted, **Then** system shows same proposed changes as voice input would
3. **Given** user is in text mode, **When** they tap microphone icon, **Then** they switch back to voice mode

---

### User Story 7 - Remove Ingredient from Inventory (Priority: P4)

Users can permanently remove an ingredient from their inventory using a delete action (X icon). This differs from setting quantity to 0 - removal means the ingredient won't appear in the user's inventory at all.

**Why this priority**: Housekeeping feature. Users need to clean up ingredients they no longer track. Different from quantity=0 which means "out of stock but still tracking."

**Independent Test**: Can be tested by removing an ingredient and verifying it no longer appears in either section.

**Acceptance Scenarios**:

1. **Given** user views an ingredient, **When** they tap the remove (X) icon, **Then** a confirmation prompt appears
2. **Given** user confirms removal, **When** confirmed, **Then** ingredient is deleted from their inventory (not just set to 0)
3. **Given** removed ingredient, **When** viewing inventory, **Then** it no longer appears in any section

---

### User Story 8 - Help and Onboarding (Priority: P4)

A help icon on the inventory page opens a modal explaining how to use the page: tapping badges to adjust quantity, moving items to pantry staples, using voice updates with example phrases. First-time users understand available interactions.

**Why this priority**: Discoverability support. Complex interactions (tap to adjust, voice phrases) need explanation. Lower priority as it's educational, not functional.

**Independent Test**: Can be tested by tapping help icon and verifying all key features are explained with examples.

**Acceptance Scenarios**:

1. **Given** user taps help icon, **When** modal opens, **Then** it explains badge tapping, pantry staples concept, and voice input
2. **Given** help modal is open, **When** viewing voice input section, **Then** example phrases are shown: "I just bought...", "I ran out of...", "I have enough...for X meals"
3. **Given** user closes help modal, **When** returning to inventory, **Then** page state is unchanged

---

### Edge Cases

- What happens when voice recognition fails to understand speech? → Show error with option to retry or switch to text
- What happens when LLM cannot match ingredient name to database? → Show unrecognized items with option to add or ignore
- What happens when user mentions same ingredient multiple times with conflicting quantities? → Use the last mentioned value
- What happens with poor network connectivity during voice processing? → Show clear error state with retry option
- What happens when user has no ingredients in inventory? → Show empty state with prompt to add first ingredient
- What happens when microphone permission is denied? → Show clear message with instructions to enable

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display user ingredients in two sections: "Available Ingredients" and "Pantry Staples"
- **FR-002**: System MUST show quantity level (0-3) for each ingredient using color-coded dot matrix badges
- **FR-003**: System MUST allow users to tap a badge to manually adjust quantity level via selector
- **FR-004**: System MUST provide a way to move ingredients between Available and Pantry Staples sections
- **FR-005**: System MUST display explanation that pantry staples are always available in recipes
- **FR-006**: System MUST provide "Update Inventory" button opening a modal with voice input
- **FR-007**: System MUST record voice input for maximum 60 seconds with visual duration feedback
- **FR-008**: System MUST provide option to switch between voice and text input modes
- **FR-009**: System MUST process natural language input to extract ingredient names and quantity changes
- **FR-010**: System MUST display proposed changes with before/after comparison (e.g., "2 → 3")
- **FR-011**: System MUST allow users to confirm or cancel proposed changes
- **FR-012**: System MUST persist all inventory changes to database
- **FR-013**: System MUST provide delete action (X icon) to permanently remove ingredient from inventory
- **FR-014**: System MUST distinguish between quantity=0 (out of stock) and deletion (not tracking)
- **FR-015**: System MUST provide help modal explaining page interactions and voice input examples
- **FR-016**: System MUST support common voice phrases: "I just bought...", "I ran out of...", "I have enough...for X meals"
- **FR-017**: System MUST show example phrases to guide users on voice input format

### Key Entities

- **User Inventory Item**: User-specific record of an ingredient with quantity level (0-3), pantry staple flag, and timestamp
- **Ingredient**: Master ingredient record with name and category (from 5931-item ingredient database)
- **Inventory Update Proposal**: Temporary representation of parsed voice/text input showing ingredient, proposed quantity, and previous quantity

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their complete inventory (both sections) within 2 seconds of page load
- **SC-002**: Users can manually adjust any ingredient quantity with 3 or fewer taps
- **SC-003**: Voice-to-proposal processing completes within 5 seconds of recording stop
- **SC-004**: 90% of common inventory phrases are correctly interpreted (e.g., "bought", "ran out", "have X left")
- **SC-005**: Users successfully complete voice inventory update flow on first attempt (help modal not needed) 70% of time
- **SC-006**: Zero data loss when saving inventory changes - all confirmed changes persist correctly
- **SC-007**: 95% of users understand pantry staples concept after reading section explanation

## Assumptions

- The "dots" variant of IngredientBadge component will be used (Color-Coded Dot Matrix as specified)
- Voice input infrastructure (useVoiceInput hook, VoiceInput component) already exists and will be reused
- LLM processing will use existing Gemini integration pattern via @google/genai
- New prompt will be registered to Opik via `pnpm prompt:inventory` script (following existing pattern)
- Quantity levels remain 0-3 as defined in existing schema (quantity_level_check constraint)
- Pantry staples flag (is_pantry_staple) already exists in user_inventory table
- User authentication/authorization already handled by existing Supabase auth flow
- Mobile-first design consistent with existing RetroUI/neo-brutalism aesthetic
