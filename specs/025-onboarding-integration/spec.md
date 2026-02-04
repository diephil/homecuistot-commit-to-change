# Feature Specification: Onboarding Integration

**Feature Branch**: `025-onboarding-integration`
**Created**: 2026-02-04
**Status**: Draft
**Input**: Replace old onboarding with story onboarding, fix quantityLevel bug, persist inventory with correct quantities, fix Opik trace metadata, update reset/demo buttons.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Sees Story Onboarding (Priority: P1)

A brand-new user signs up and is redirected to `/onboarding`. Instead of the old multi-step wizard, they see the new 7-scene story onboarding (Sarah's narrative). The `/onboarding/story` sub-path is removed; the story flow lives directly at `/onboarding`.

**Why this priority**: Core feature — without this, old and new onboarding coexist on different routes, confusing users and splitting the experience.

**Independent Test**: Navigate to `/onboarding` as a new user and verify the story-based flow (scenes 1-7) appears instead of the old wizard.

**Acceptance Scenarios**:

1. **Given** a new user with no inventory/recipes, **When** they navigate to `/app`, **Then** they are redirected to `/onboarding` and see Scene 1 of the story onboarding.
2. **Given** the old `/onboarding/story` path, **When** a user navigates to it, **Then** it no longer exists (404 or redirects to `/onboarding`).
3. **Given** a returning user who completed onboarding, **When** they navigate to `/onboarding`, **Then** they are redirected to `/app` (existing guard behavior preserved).

---

### User Story 2 - Voice Input Returns Correct Quantity Level (Priority: P1)

During Scene 4 (voice/text grocery input), when a user says "I bought some eggs", the detected quantity level for eggs should be "some" (2), not "plenty" (3). The system must extract quantity context from the user's natural language and map it to the correct level (0=out, 1=low, 2=some, 3=plenty).

**Why this priority**: Bug fix — current behavior ignores quantity words and always sets 3, making the demo misleading and the inventory inaccurate.

**Independent Test**: In Scene 4, say or type "I bought some eggs" and verify eggs show quantity level "some" (2) in the updated inventory display.

**Acceptance Scenarios**:

1. **Given** Scene 4 voice input, **When** user says "I bought some eggs", **Then** eggs are added with quantityLevel 2 ("some").
2. **Given** Scene 4 text input, **When** user types "I have a lot of butter", **Then** butter is set to quantityLevel 3 ("plenty").
3. **Given** Scene 4 voice input, **When** user says "I bought parmesan", **Then** parmesan is added with quantityLevel 3 ("plenty") as default when no quantity word is specified.
4. **Given** Scene 4 voice input, **When** user says "I have a little milk left", **Then** milk is set to quantityLevel 1 ("low").

---

### User Story 3 - Onboarding Completion Persists Correct Quantities (Priority: P1)

When a user finishes the story onboarding (Scene 7 "Get started"), the system persists all inventory items to the database with the quantity levels collected during the story — not a hardcoded value of 3. Sarah's initial inventory quantities and any voice-modified quantities from Scene 4 must be respected. The cook action decrements from Scene 6 must also be reflected.

**Why this priority**: Data integrity — hardcoded quantity=3 defeats the purpose of the interactive demo where users manage quantities.

**Independent Test**: Complete the full story flow, then check the user's inventory in the database and verify quantities match what was displayed in the story.

**Acceptance Scenarios**:

1. **Given** a user completes the story with eggs at quantityLevel 2 (after Scene 4), **When** "Get started" is clicked, **Then** eggs are persisted in user_inventory with quantityLevel 2.
2. **Given** Sarah's initial inventory has Rice at quantityLevel 2, **When** the user doesn't modify it and completes onboarding, **Then** Rice is persisted with quantityLevel 2.
3. **Given** the cook action in Scene 6 decrements Pasta from 3 to 2, **When** onboarding completes, **Then** Pasta is persisted with quantityLevel 2.
4. **Given** pantry staples (Salt, Olive oil) at quantityLevel 3, **When** onboarding completes, **Then** they are persisted with quantityLevel 3 and isPantryStaple=true.

---

### User Story 4 - Opik Trace Metadata for Unrecognized Items (Priority: P2)

When the story process-input route detects unrecognized ingredients, the Opik trace must include proper tags and metadata so unrecognized items are visible in observability dashboards.

**Why this priority**: Observability gap — without proper tagging, unrecognized items during onboarding are invisible to monitoring, making it hard to improve ingredient coverage.

**Independent Test**: Trigger a voice/text input with an unrecognized ingredient (e.g., "dragon fruit") and verify the Opik trace includes the `unrecognized_items` tag and metadata listing the unrecognized names.

**Acceptance Scenarios**:

1. **Given** a voice input with an unrecognized ingredient, **When** the process-input route completes, **Then** the Opik trace includes a tag `unrecognized_items` and metadata field `unrecognized` listing the item names.
2. **Given** a voice input with all recognized ingredients, **When** the process-input route completes, **Then** the Opik trace does not include the `unrecognized_items` tag.

---

### User Story 5 - Reset User Data Clears localStorage (Priority: P2)

On the `/app` page, the "Reset user data" button must also clear the story onboarding localStorage state so the user is sent back through the full story onboarding experience from Scene 1.

**Why this priority**: Without clearing localStorage, a reset user would see a partially-completed story state instead of starting fresh.

**Independent Test**: Complete the story onboarding, go to `/app`, click "Reset user data", and verify you see Scene 1 of the story onboarding again.

**Acceptance Scenarios**:

1. **Given** a user on `/app` with completed onboarding and story state in localStorage, **When** they click "Reset user data", **Then** localStorage key `homecuistot:story-onboarding` is removed, DB data is deleted, and the user is redirected to `/onboarding` seeing Scene 1.

---

### User Story 6 - Start Onboarding Button Redirects to Onboarding (Priority: P2)

The "Start demo" button on `/app` is renamed to "Start Onboarding". It clears localStorage (including story onboarding state) and redirects to `/onboarding` without any server-side calls. No DB reset — the story is cosmetic for returning users; only brand-new users get data persisted on completion.

**Why this priority**: The story onboarding IS the demo now — seeding DB directly bypasses the narrative experience that teaches users the core loop.

**Independent Test**: Click "Start Onboarding" on `/app` and verify you are redirected to `/onboarding` with clean localStorage.

**Acceptance Scenarios**:

1. **Given** a user on `/app`, **When** they click "Start Onboarding", **Then** localStorage is cleared (including `homecuistot:story-onboarding`), no server-side call is made, and the user is redirected to `/onboarding`.

---

### Edge Cases

- What happens if the LLM fails to extract a quantity word? Default to quantityLevel 3 ("plenty") as a safe fallback.
- What happens if the user completes the story but ingredient matching fails for some items? Unrecognized items are created in unrecognized_items table (existing behavior) with the correct quantityLevel.
- What happens if a user manually navigates to `/onboarding/story`? The path should not exist; a 404 is acceptable.
- What happens if localStorage is cleared mid-story? The story restarts from Scene 1 (existing behavior).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST serve the story onboarding flow at `/onboarding` path, replacing the old wizard.
- **FR-002**: System MUST remove the `/onboarding/story` sub-route entirely.
- **FR-003**: The ingredient extraction agent MUST extract quantity context from natural language and return a quantityLevel per ingredient (0=out, 1=low, 2=some, 3=plenty).
- **FR-004**: The process-input API route MUST return quantityLevel alongside each ingredient name in its response.
- **FR-005**: Scene 4 frontend MUST use the returned quantityLevel when updating inventory state, not a hardcoded value.
- **FR-006**: The story completion API/service MUST accept and persist per-ingredient quantityLevel values from the client, not use hardcoded 3.
- **FR-007**: Scene 7 completion payload MUST include quantityLevel for each inventory item.
- **FR-008**: The Opik trace in process-input MUST include `unrecognized_items` tag and `unrecognized` metadata field when unrecognized items are detected.
- **FR-009**: The "Reset user data" action MUST clear `homecuistot:story-onboarding` from localStorage.
- **FR-010**: The "Start demo" button MUST be renamed to "Start Onboarding", clear localStorage, and redirect to `/onboarding` without calling any server-side endpoint (no DB reset, no seed).

### Key Entities

- **DemoInventoryItem**: Carries quantityLevel through the entire story flow into persistence. Key attributes: name, category, quantityLevel (0-3), isPantryStaple, isNew.
- **IngredientExtraction (extended)**: Response extended to include per-item quantityLevel. Attributes: add (array of {name, quantityLevel}), rm (array of names), transcribedText, unrecognized.
- **StoryCompleteRequest (extended)**: Extended to include per-ingredient quantityLevel. Attributes: ingredients (array of {name, quantityLevel}), pantryStaples (array of {name, quantityLevel}), recipes.

## Clarifications

### Session 2026-02-04

- Q: Should "Start demo" also reset DB data before redirecting to onboarding? → A: No DB reset. Rename to "Start Onboarding", only clear localStorage and redirect. Story is cosmetic for returning users.

## Assumptions

- Quantity word mapping: "a lot" / "plenty" / no modifier = 3, "some" / "a few" = 2, "a little" / "not much" / "running low" = 1, "none" / "out of" / "no more" = 0 (handled as rm). The exact mapping is defined in the LLM prompt.
- The old onboarding code (OnboardingPageContent.tsx, old API routes) can be deleted or left unused. Cleanup is in scope if straightforward, otherwise deferred.
- Existing onboarding guard logic (redirect completed users away from `/onboarding`) remains unchanged.
- The cook action decrement in Scene 6 already works correctly; post-cook quantities are what get persisted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new users see the story onboarding at `/onboarding` — the old wizard is no longer accessible.
- **SC-002**: Voice/text input with quantity words (e.g., "some eggs") results in the correct quantityLevel displayed in the UI at least 90% of the time.
- **SC-003**: All inventory items persisted after onboarding completion have quantity levels matching the final story state (no hardcoded values).
- **SC-004**: Opik traces for process-input with unrecognized items contain the appropriate tags and metadata 100% of the time.
- **SC-005**: "Reset user data" returns users to Scene 1 of story onboarding with no stale state.
- **SC-006**: "Start Onboarding" (renamed from "Start demo") redirects to `/onboarding` without any server-side calls.
