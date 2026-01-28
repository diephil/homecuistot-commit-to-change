# Feature Specification: Voice Recipe Editor

**Feature Branch**: `016-voice-recipe-editor`
**Created**: 2026-01-28
**Status**: Draft
**Input**: User description: "Voice/text-based recipe editing with AI-powered update prompts that accept current recipe state and user input to intelligently apply only requested changes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Recipe via Voice (Priority: P1)

A user has an existing recipe and wants to update it using voice commands without manually editing each field.

**Why this priority**: Core feature - enables hands-free recipe modification which is the primary user request. Most valuable for users cooking in the kitchen with dirty hands.

**Independent Test**: Can be fully tested by opening an existing recipe in edit mode, recording a voice update (e.g., "add garlic as optional"), and verifying the recipe state updates correctly while preserving unchanged fields.

**Acceptance Scenarios**:

1. **Given** a recipe with title "Pasta Carbonara", description "Classic Italian pasta", and ingredients [pasta, eggs, bacon], **When** user records "add parmesan cheese as optional", **Then** the recipe shows ingredients [pasta, eggs, bacon, parmesan cheese (optional)] with title and description unchanged.

2. **Given** a recipe with title "Tomato Soup" and ingredients [tomatoes, onion], **When** user records "change the title to Roasted Tomato Soup and add basil", **Then** title updates to "Roasted Tomato Soup", ingredients become [tomatoes, onion, basil], and description remains unchanged.

3. **Given** a recipe in edit mode, **When** user records an empty or unintelligible audio, **Then** system shows an error message and preserves current recipe state.

---

### User Story 2 - Edit Recipe via Text (Priority: P1)

A user prefers typing over speaking and wants to update recipe details via text input.

**Why this priority**: Equal priority with voice - provides accessible alternative for users who cannot or prefer not to use voice input. Same functionality, different input modality.

**Independent Test**: Can be fully tested by opening an existing recipe in edit mode, typing an update instruction (e.g., "remove bacon, add mushrooms"), and verifying only the specified changes apply.

**Acceptance Scenarios**:

1. **Given** a recipe with ingredients [chicken, rice, carrots], **When** user types "replace rice with quinoa", **Then** ingredients become [chicken, quinoa, carrots] with other fields unchanged.

2. **Given** a recipe with description "Quick weeknight dinner", **When** user types "update description to Healthy 30-minute meal", **Then** description changes to "Healthy 30-minute meal" with title and ingredients unchanged.

3. **Given** a recipe in edit mode with text input selected, **When** user submits empty text, **Then** no changes apply and recipe state remains intact.

---

### User Story 3 - Switch Between Voice and Text Input (Priority: P2)

A user wants to seamlessly switch between voice and text input modes while editing a recipe.

**Why this priority**: UX enhancement that follows existing app patterns. Not required for MVP but expected based on how other views work.

**Independent Test**: Can be fully tested by opening recipe edit mode, switching from voice to text mode and back, verifying the toggle works and both modes remain functional.

**Acceptance Scenarios**:

1. **Given** a recipe in edit mode with voice input active, **When** user clicks "Do you prefer typing?", **Then** input mode switches to text with the same update capability.

2. **Given** a recipe in edit mode with text input active, **When** user clicks "Use voice instead", **Then** input mode switches to voice with microphone ready.

---

### User Story 4 - Partial Update Preservation (Priority: P1)

A user makes a change to only one aspect of the recipe and expects all other data to be preserved exactly.

**Why this priority**: Critical for user trust - users must be confident that updating one field won't accidentally modify others.

**Independent Test**: Can be fully tested by making multiple sequential edits (e.g., title only, then ingredients only, then description only) and verifying each edit preserves all unaffected fields.

**Acceptance Scenarios**:

1. **Given** a recipe with title "Beef Stew", description "Slow-cooked comfort food", and 8 ingredients, **When** user says "mark salt as optional", **Then** only the salt ingredient's optional flag changes and all other data remains identical.

2. **Given** a recipe where user previously updated the title, **When** user now says "add pepper as optional", **Then** the previous title change is preserved along with the new ingredient addition.

---

### User Story 5 - Iterative Updates (Priority: P1)

A user wants to refine their recipe through multiple sequential updates without committing after each change, allowing experimentation before final save.

**Why this priority**: Core UX pattern - enables natural iterative refinement workflow. Users can try multiple updates, see cumulative changes, and commit or revert all at once.

**Independent Test**: Can be fully tested by making 3+ sequential updates (e.g., add ingredient, change title, mark another ingredient optional) and verifying all changes accumulate in the form, then testing both save (commits all) and dismiss (reverts all).

**Acceptance Scenarios**:

1. **Given** a recipe in edit mode, **When** user records "add garlic", sees it appear, then records "make the onions optional", **Then** both changes (garlic added + onions optional) are visible in the form simultaneously.

2. **Given** a recipe with accumulated changes from 3 sequential updates, **When** user clicks "Save", **Then** all changes commit to database and form closes with success message.

3. **Given** a recipe with accumulated changes from 2 sequential updates, **When** user clicks "Dismiss" or "Cancel", **Then** all changes revert to original state and form returns to initial recipe data.

4. **Given** a recipe in edit mode, **When** user makes update 1, then update 2, then dismisses, **Then** form shows original state. **When** user makes a new update 3, **Then** update 3 applies on the original state (not on dismissed changes).

---

### Edge Cases

- What happens when user requests to add an ingredient that already exists? (System should ignore duplicate or mark existing as optional if requested)
- How does system handle requests to remove a non-existent ingredient? (Gracefully ignore with optional warning)
- What happens when voice input contains multiple conflicting instructions? (Process sequentially, last instruction wins)
- How does system handle ambiguous ingredient names? (Use fuzzy matching against existing ingredient database, flag unrecognized items)
- What happens if the update would result in zero ingredients? (Block update, show error requiring at least one ingredient)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST enable voice input mode for recipe editing when user is in edit mode
- **FR-002**: System MUST enable text input mode for recipe editing when user is in edit mode
- **FR-003**: System MUST allow users to switch between voice and text input modes
- **FR-004**: System MUST send current recipe state (title, description, ingredients with optional flags) to the AI prompt along with user input
- **FR-005**: System MUST only modify recipe fields explicitly mentioned in user input
- **FR-006**: System MUST preserve all unmentioned recipe fields exactly as they were
- **FR-007**: System MUST validate AI-extracted ingredients against the ingredients database
- **FR-008**: System MUST display unrecognized ingredients to the user
- **FR-009**: System MUST maintain ingredient optional/required flags unless explicitly changed
- **FR-010**: System MUST show a loading state while processing voice/text input
- **FR-011**: System MUST display appropriate error messages for failed processing
- **FR-012**: System MUST prevent updates that would result in zero ingredients
- **FR-013**: System MUST apply AI-generated updates immediately to the form (no blocking preview modal)
- **FR-014**: System MUST allow multiple sequential updates to accumulate on top of each other
- **FR-015**: System MUST preserve original recipe state for revert capability until user saves
- **FR-016**: System MUST provide "Save" button to commit all accumulated changes
- **FR-017**: System MUST provide "Cancel" or "Dismiss" button to revert all changes to original state
- **FR-018**: System MUST provide an npm command to register the recipe updater prompt to Opik for tracking and versioning

### Key Entities

- **Recipe State**: Current recipe being edited - contains title (string), description (string), ingredients list (array of ingredient objects with id, name, isOptional)
- **User Update Request**: Voice audio or text input describing desired changes
- **Recipe Update Response**: AI-processed output containing the updated recipe state with only requested changes applied

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can update any single recipe field (title, description, or ingredient) in under 30 seconds using voice or text
- **SC-002**: 95% of voice/text update requests correctly preserve unmodified recipe fields
- **SC-003**: Users successfully complete recipe edits via voice input on first attempt 80% of the time
- **SC-004**: The toggle between voice and text input modes works instantly with no perceptible delay
- **SC-005**: Users can make 5 sequential edits to a recipe without any data loss or corruption

## Assumptions

- Voice input quality is sufficient for AI transcription (users are in reasonably quiet environments)
- Existing QuickInputSection component provides the voice/text toggle pattern to follow
- The ingredients database contains the standard ingredients users will reference
- AI model (Gemini 2.0 Flash) can understand natural language recipe update requests
- Users understand they need to explicitly mention what they want to change
