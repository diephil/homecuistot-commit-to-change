# Feature Specification: Story-Based Onboarding

**Feature Branch**: `024-story-onboarding`
**Created**: 2026-02-04
**Status**: Draft
**Input**: New guided simulation onboarding flow. Users learn HomeCuistot by participating in Sarah's story — a 7-scene narrative with 2 interactive moments (voice input + cook action). No data persisted. Coexists alongside current onboarding.

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

Scene 7 delivers the product message and offers two CTAs: "Get started" to enter the real app, or "Restart demo" to replay the story from Scene 1.

**Why this priority**: Important for conversion but the core learning happens in Scenes 1-6.

**Independent Test**: User reads manifesto, taps "Get started" to land on /recipes, or taps "Restart demo" to return to Scene 1.

**Acceptance Scenarios**:

1. **Given** Scene 7 is active, **When** user reads the content, **Then** they see the manifesto text differentiating HomeCuistot from recipe apps.
2. **Given** Scene 7 is active, **When** user taps "Get started", **Then** they are redirected to the /recipes route.
3. **Given** Scene 7 is active, **When** user taps "Restart demo", **Then** all demo state resets and the flow returns to Scene 1.

---

### Edge Cases

- What happens when user says something completely unrelated (e.g., "the weather is nice")? Items extracted (if any), inventory updates, "Continue" stays disabled if eggs/parmesan missing.
- What happens when user adds items beyond eggs/parmesan (e.g., "cheesecake")? Accepted and displayed in inventory, no impact on progression.
- What happens when voice transcription returns empty? Show error, allow retry.
- What happens if user navigates away mid-flow and returns? Flow resets to Scene 1 (all state is client-side, no persistence).
- What happens on slow network during voice processing? Show loading state on mic button; timeout after reasonable duration with retry option.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display 7 sequential scenes in a linear forward-only flow.
- **FR-002**: Scenes 1, 2, 3, 7 MUST be static content screens with a "Continue" (or "Get started") button.
- **FR-003**: Scene 2 MUST display Sarah's inventory (7 tracked items + 3 staples) and the carbonara recipe card showing missing ingredients (eggs, parmesan) with a "NOT READY" status.
- **FR-004**: Scene 4 MUST provide a mic button that captures user speech and extracts ingredient names via LLM.
- **FR-005**: Scene 4 MUST update the inventory display in real-time as items are extracted from speech.
- **FR-006**: Scene 4 "Continue" button MUST remain disabled until both eggs AND parmesan are present in the inventory.
- **FR-007**: Scene 4 MUST allow multiple voice passes (mic button label changes to "Add more" after first input).
- **FR-008**: Scene 4 MUST show a text input fallback when microphone permission is denied.
- **FR-009**: Scene 4 MUST show a hint after 5 seconds of silence.
- **FR-010**: Scene 5 MUST display the carbonara recipe card as "READY" with all ingredients checked, including "just added" labels on eggs and parmesan.
- **FR-011**: Scene 5 MUST provide an "I made this" button that triggers Scene 6.
- **FR-012**: Scene 6 MUST display a modal showing each used ingredient with before/after quantity levels, and list staples as "NOT TRACKED".
- **FR-013**: Scene 7 MUST offer two CTAs: "Get started" (redirects to /recipes) and "Restart demo" (resets all demo state and returns to Scene 1).
- **FR-014**: All state MUST be client-side only. No user data is persisted during this flow.
- **FR-015**: This flow MUST live at a new dedicated route (e.g., `/app/onboarding/story`), coexisting alongside the current onboarding with no modifications to existing OnboardingPageContent.
- **FR-016**: Scene 4 voice input MUST reuse the existing ingredient extractor agent for LLM extraction.

### Key Entities

- **Sarah's Inventory**: 7 tracked ingredients with quantity levels (plenty/some/enough/low/critical) + 3 staples (Salt, Black pepper, Olive oil). Demo-only, client-side.
- **Carbonara Recipe**: Name, 4 anchor ingredients (Pasta, Bacon, Eggs, Parmesan), 2 staples used (Black pepper, Salt). Readiness derived from inventory state.
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
- Scene transitions use simple forward animation (slide or fade) consistent with existing onboarding patterns.
- No back navigation — forward-only linear flow.
- No skip option — the flow is short (~2 min) and the interactive moments are essential for product understanding.
- Newly added items (via voice) default to "plenty" quantity level.

## Scope Boundaries

**In scope**:
- 7-scene linear narrative flow
- Voice input with LLM extraction in Scene 4
- Text fallback for Scene 4
- Client-side demo state management
- Recipe readiness display
- Inventory decrement modal
- Redirect to /recipes on completion

**Out of scope**:
- Persisting any demo data to the database
- Modifying the existing onboarding flow
- Back navigation between scenes
- Skip functionality
- Analytics/event tracking implementation
