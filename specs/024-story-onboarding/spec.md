# Feature Specification: Story-Based Onboarding

**Feature Branch**: `024-story-onboarding`
**Created**: 2026-02-04
**Status**: Draft
**Input**: New guided simulation onboarding flow. Users learn HomeCuistot by participating in Sarah's story — a 7-scene narrative with 2 interactive moments (voice input + cook action). For brand-new users, demo data is pre-filled into their account on completion. Coexists alongside current onboarding.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Follow Sarah's Story (Priority: P1)

A new user opens the onboarding and reads through Sarah's story: she knows how to cook but doesn't know what's in her fridge. The user advances through static narrative scenes (Scenes 1-3) by tapping "Continue", understanding the problem HomeCuistot solves.

**Why this priority**: Core narrative delivery. Without it, no onboarding exists.

**Independent Test**: User can tap through Scenes 1 → 2 → 3, reading the story content at each step.

**Acceptance Scenarios**:

1. **Given** user opens the story onboarding, **When** Scene 1 loads, **Then** they see the narrative about Sarah's evening dilemma with a "Continue" button.
2. **Given** user is on Scene 1, **When** they tap "Continue", **Then** Scene 2 shows Sarah's inventory and the carbonara recipe card marked "NOT READY" (missing eggs + parmesan).
3. **Given** user is on Scene 2, **When** they tap "Continue", **Then** Scene 3 shows Sarah deciding to stop at the store.
4. **Given** user is on Scene 3, **When** they tap "Continue", **Then** Scene 4 (voice input) loads.

---

### User Story 2 - Voice Input to Update Inventory (Priority: P1)

In Scene 4, the user role-plays as Sarah adding groceries. They tap the mic button and say what Sarah bought (must include eggs and parmesan). The inventory display updates in real-time. The "Continue" button stays disabled until both required items are detected.

**Why this priority**: Core interactive moment. Demonstrates the product's voice-driven inventory update — the primary value proposition.

**Independent Test**: User can tap mic, speak items, see inventory update, and advance only when eggs + parmesan are present.

**Acceptance Scenarios**:

1. **Given** Scene 4 is active with mic button and disabled "Continue", **When** user taps mic and says "I bought parmesan, eggs, and milk", **Then** inventory updates to show parmesan and eggs at "plenty" and milk at "plenty", and "Continue" becomes enabled.
2. **Given** Scene 4 is active, **When** user says only "eggs", **Then** eggs update in inventory but "Continue" stays disabled (parmesan still missing).
3. **Given** user said eggs in a previous pass, **When** user taps mic again and says "parmesan", **Then** parmesan updates and "Continue" becomes enabled.
4. **Given** user is silent for 5 seconds after tapping mic, **Then** a hint appears: "Try saying: I bought parmesan, eggs, and a cheesecake".
5. **Given** mic permission is denied, **Then** a text input fallback is shown.
6. **Given** LLM extraction fails, **Then** an error message is shown and user can retry.

---

### User Story 3 - Mark Recipe as Cooked + Inventory Decrement (Priority: P1)

After the voice step, Scene 5 shows the carbonara recipe card as "READY" with all checkmarks. The user taps "I made this", triggering Scene 6: a modal showing which ingredients were used and how quantities decreased. Staples are shown as "NOT TRACKED".

**Why this priority**: Completes the product loop — voice input → recipe readiness → cook → auto-decrement. Without this, the demo is incomplete.

**Independent Test**: User taps "I made this" on the ready recipe card, sees decrement modal with correct quantity changes, taps "Got it" to advance.

**Acceptance Scenarios**:

1. **Given** Scene 5 shows carbonara as READY, **When** user taps "I made this", **Then** Scene 6 modal appears showing used ingredients with quantity changes (e.g., Eggs plenty → some, Pasta plenty → some).
2. **Given** Scene 6 modal is shown, **Then** staples (Black pepper, Salt) are listed under "NOT TRACKED" with explanation "Staples never run out. No need to track them."
3. **Given** Scene 6 modal is shown, **When** user taps "Got it", **Then** Scene 7 (manifesto) loads.

---

### User Story 4 - Manifesto and Transition to App (Priority: P2)

Scene 7 delivers the product message and offers two CTAs: "Get started" or "Restart demo".

For **brand-new users** (no existing inventory or recipes in the database), tapping "Get started" shows a loading screen that pre-fills their account with the demo data viewed during onboarding (Sarah's inventory items + carbonara recipe). The loading screen reassures the user: they can start adding their own recipes via voice and manage their inventory later to update or remove items they didn't actually have.

For **returning users** (already have inventory or recipes), tapping "Get started" skips the loading screen and goes directly to the app — the user has already completed onboarding.

**Why this priority**: Important for conversion and ensures new users start with useful data rather than an empty app.

**Independent Test**: New user reads manifesto, taps "Get started", sees loading screen with pre-fill messaging, lands in the app with demo data populated. Returning user taps "Get started" and goes straight to the app.

**Acceptance Scenarios**:

1. **Given** Scene 7 is active, **When** user reads the content, **Then** they see the manifesto text differentiating HomeCuistot from recipe apps.
2. **Given** Scene 7 is active and user has no inventory/recipes in DB, **When** user taps "Get started", **Then** a loading screen appears explaining demo data is being pre-filled, demo inventory and carbonara recipe are persisted to the user's account, and user is redirected to the app.
3. **Given** Scene 7 is active and user already has inventory/recipes in DB, **When** user taps "Get started", **Then** they are redirected directly to the app (no loading screen, no data pre-fill).
4. **Given** Scene 7 is active, **When** user taps "Restart demo", **Then** all demo state resets and the flow returns to Scene 1.

---

### Edge Cases

- What happens when user says something completely unrelated (e.g., "the weather is nice")? Items extracted (if any), inventory updates, "Continue" stays disabled if eggs/parmesan missing.
- What happens when user adds items beyond eggs/parmesan (e.g., "cheesecake")? Accepted and displayed in inventory, no impact on progression.
- What happens when voice transcription returns empty? Show error, allow retry.
- What happens if user navigates away mid-flow and returns? Scene progress and demo state are restored from localStorage; user resumes where they left off.
- What happens on slow network during voice processing? Show loading state on mic button; timeout after reasonable duration with retry option.
- What happens if pre-fill persistence fails on "Get started"? Show error with retry option; do not leave user stuck on loading screen.
- What happens if a returning user (with existing data) replays the demo via "Restart demo" then taps "Get started"? They already have data, so skip loading screen and go directly to the app.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display 7 sequential scenes in a linear forward-only flow.
- **FR-002**: Scenes 1, 2, 3, 7 MUST be static content screens with a "Continue" (or "Get started") button.
- **FR-003**: Scene 2 MUST display Sarah's inventory using two read-only InventorySection components (one for tracked ingredients, one for pantry staples — no quantity change, delete, or interaction allowed on badges) and the carbonara recipe card in "almost-available" variant showing missing ingredients (eggs, parmesan) with a "NOT READY" status.
- **FR-004**: Scene 4 MUST provide a mic button that captures user speech and extracts ingredient names via LLM.
- **FR-005**: Scene 4 MUST update the inventory display in real-time as items are extracted from speech.
- **FR-006**: Scene 4 "Continue" button MUST remain disabled until both eggs AND parmesan are present in the inventory.
- **FR-007**: Scene 4 MUST allow multiple voice passes (mic button label changes to "Add more" after first input).
- **FR-008**: Scene 4 MUST show a text input fallback when microphone permission is denied.
- **FR-009**: Scene 4 MUST show a hint after 5 seconds of silence.
- **FR-010**: Scene 5 MUST display the carbonara recipe card using the "available" variant as "READY" with all ingredients checked, including "just added" labels on eggs and parmesan.
- **FR-011**: Scene 5 MUST provide an "I made this" button that triggers Scene 6.
- **FR-012**: Scene 6 MUST display a modal showing each used ingredient with before/after quantity levels, and list staples as "NOT TRACKED".
- **FR-013**: Scene 7 MUST offer two CTAs: "Get started" and "Restart demo" (resets all demo state and returns to Scene 1).
- **FR-014**: All scene state during the flow (Scenes 1-7) MUST be stored in localStorage (scene progress, demo inventory, demo recipe). No data is persisted to the database until the user taps "Get started". On page refresh, the flow resumes from the last saved scene.
- **FR-017**: When a brand-new user (no existing user_inventory rows and no existing user_recipes rows) taps "Get started", the system MUST show a loading screen and pre-fill their account with the demo inventory items and the carbonara recipe.
- **FR-018**: The loading screen MUST inform the user that demo data is being added to their account, and that they can add their own recipes via voice and manage their inventory later to update or remove pre-filled items.
- **FR-019**: When a returning user (has existing inventory or recipes) taps "Get started", the system MUST skip the loading screen and redirect directly to the app.
- **FR-020**: If pre-fill persistence fails, the system MUST show an error with a retry option rather than leaving the user stuck on the loading screen.
- **FR-015**: This flow MUST live at a new dedicated route (e.g., `/app/onboarding/story`), coexisting alongside the current onboarding with no modifications to existing OnboardingPageContent.
- **FR-016**: Scene 4 voice input MUST reuse the existing ingredient extractor agent for LLM extraction. The mic interaction pattern mirrors the inventory page mic logic — extracted items are applied directly to the in-memory/localStorage demo inventory without database persistence and without a confirmation modal.
- **FR-021**: The flow MUST use neo brutalism design consistent with the rest of the app.
- **FR-022**: Scene transitions MUST use fade-in/fade-out animations.
- **FR-023**: Storytelling text in static scenes MUST appear with a progressive fade-in effect (text revealed gradually, not all at once).
- **FR-024**: Recipe cards MUST reuse the existing RecipeAvailabilityCard component. Scene 2 uses the "almost-available" variant; Scene 5 uses the "available" variant.
- **FR-025**: Inventory displays MUST reuse the existing InventorySection component in read-only mode (two instances: one for tracked ingredients, one for pantry staples). InventoryItemBadges MUST NOT allow quantity changes, deletion, or direct interaction during onboarding.
- **FR-026**: "Restart demo" MUST clear all localStorage onboarding state in addition to resetting in-memory state.

### Key Entities

- **Sarah's Inventory**: 7 tracked ingredients with quantity levels (plenty/some/enough/low/critical) + 3 staples (Salt, Black pepper, Olive oil). Client-side during demo; persisted to user_inventory for brand-new users on "Get started".
- **Carbonara Recipe**: Name, 4 anchor ingredients (Pasta, Bacon, Eggs, Parmesan), 2 staples used (Black pepper, Salt). Readiness derived from inventory state. Persisted to user_recipes for brand-new users on "Get started".
- **Brand-new user**: A user with zero rows in both user_inventory and user_recipes tables. This is the condition that triggers the pre-fill loading screen.
- **Required Progression Items**: Eggs and Parmesan — must be present in inventory for Scene 4 → Scene 5 transition.
- **Quantity Scale**: plenty > some > enough > low > critical (descending).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: >80% of users who start the story onboarding complete all 7 scenes.
- **SC-002**: Users complete the full flow in under 2 minutes.
- **SC-003**: >85% of users successfully add eggs and parmesan via voice on first attempt (Scene 4).
- **SC-004**: <15% drop-off rate at Scene 4 (voice input step).
- **SC-005**: Users understand the product value proposition — measured by proceeding to "Get started" rather than abandoning at Scene 7.

## Clarifications

### Session 2026-02-04

- Q: How do users enter the story onboarding (route/entry point)? → A: New dedicated route (e.g., `/app/onboarding/story`), coexists separately from current onboarding.

## Assumptions

- The quantity scale is: plenty > some > enough > low > critical. This matches the display in the spec scenes.
- Voice input reuses the existing `/api/onboarding/process-voice` endpoint and ingredient extractor agent.
- Authentication is required before entering this flow (same as current onboarding).
- Scene transitions use fade-in/fade-out animations.
- No back navigation — forward-only linear flow.
- No skip option — the flow is short (~2 min) and the interactive moments are essential for product understanding.
- Newly added items (via voice) default to "plenty" quantity level.

## Scope Boundaries

**In scope**:
- 7-scene linear narrative flow
- Voice input with LLM extraction in Scene 4
- Text fallback for Scene 4
- Client-side demo state in localStorage during Scenes 1-7 (persists across refresh)
- Recipe readiness display
- Inventory decrement modal
- Pre-fill persistence of demo data for brand-new users on "Get started"
- Loading screen with reassurance messaging during pre-fill
- Conditional redirect: loading screen for new users, direct redirect for returning users

**Out of scope**:
- Modifying the existing onboarding flow
- Back navigation between scenes
- Skip functionality
- Analytics/event tracking implementation
