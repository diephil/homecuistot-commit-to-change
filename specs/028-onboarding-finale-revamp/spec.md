# Feature Specification: Onboarding Story Finale Scene Reordering

**Feature ID**: 028-onboarding-finale-revamp
**Status**: Draft
**Created**: 2026-02-05
**Last Updated**: 2026-02-05 (clarifications completed)

---

## Overview

### Purpose
Improve the narrative flow and user experience of the onboarding story finale by reordering scenes 7 and 8, placing the user's recipe input before the final manifesto, and updating button text to better reflect the journey's progression.

### Background
The current onboarding story concludes with Scene 7 (Your Recipes) followed by Scene 8 (Manifesto). However, the narrative flow would be stronger if users add their own recipes as the penultimate step before reading the final manifesto and completing setup. This creates a better emotional arc: learn from Sarah's story → add your own recipes → understand the philosophy → finish setup.

### User Value
- **Better narrative flow**: Users transition naturally from learning to doing to understanding
- **Clearer progression**: Button text explicitly states what comes next ("Add your go-to recipes" vs. generic "Continue")
- **Stronger closure**: The manifesto becomes the final inspiring message before users enter the app, rather than being followed by recipe input

---

## Clarifications

### Session 2026-02-05

- Q: Should scene transitions be tracked with analytics events to measure the impact of the new scene order? → A: Defer analytics decisions to implementation phase

---

## Scope

### In Scope
- Swap scene 7 and scene 8 positions in the onboarding flow
- Update button text on the new scene 7 (previously scene 8) to say "Add your go-to recipes"
- Update button text on the new scene 8 (previously scene 7) to say "Finish your setup" when the continue button is enabled
- Update any scene navigation logic to reflect the new order
- Ensure all scene transitions work correctly with the new order

### Out of Scope
- Changes to scene content beyond button text
- Modifications to scene styling or animations
- Changes to the voice input or recipe processing logic
- Updates to earlier scenes (scenes 1-6)
- Backend API changes

---

## User Scenarios

### Primary Flow: New User Completing Onboarding

**Context**: User has completed scenes 1-6 of the onboarding story

**Steps**:
1. User finishes Scene 6 (Sarah cooked carbonara)
2. User sees Scene 7 (previously Scene 8) - the manifesto about HomeCuistot's philosophy
3. User reads the manifesto comparing HomeCuistot to other apps
4. User clicks "Add your go-to recipes" button
5. User enters Scene 8 (previously Scene 7) - voice input for their own recipes
6. User adds at least one recipe via voice or text
7. User clicks "Finish your setup" button
8. System processes data and redirects to main app

**Expected Outcome**: User experiences a coherent narrative arc that flows from Sarah's story → philosophy → personal action → completion

---

## Functional Requirements

### FR-1: Scene Order Swap
**Description**: The onboarding story must present scenes in the new order: 1 → 2 → 3 → 4 → 5 → 6 → 7 (manifesto) → 8 (your recipes)

**Acceptance Criteria**:
- Scene 7 displays the manifesto content (current Scene8Manifesto component)
- Scene 8 displays the recipe input interface (current Scene7YourRecipes component)
- Navigation from Scene 6 leads to Scene 7 (manifesto)
- Navigation from Scene 7 leads to Scene 8 (your recipes)
- Scene 8 completion triggers the final data submission and app redirect

### FR-2: Scene 7 Button Text Update
**Description**: The continue button on Scene 7 (manifesto) must display text indicating the next action is adding recipes

**Acceptance Criteria**:
- Button text reads exactly "Add your go-to recipes"
- Button appears after all manifesto content has been displayed
- Button click navigates to Scene 8 (recipe input)
- Button styling remains consistent with current implementation

### FR-3: Scene 8 Button Text Update
**Description**: The primary action button on Scene 8 (your recipes) must display "Finish your setup" when enabled

**Acceptance Criteria**:
- When user has added ≥1 recipe, button text reads exactly "Finish your setup"
- When user has added 0 recipes, button text reads "Add at least one recipe to continue" (existing behavior)
- Button is disabled until ≥1 recipe is added (existing behavior)
- Button click triggers data submission to `/api/onboarding/story/complete`
- Button displays loading state during data submission (existing behavior)

### FR-4: Scene Naming Preservation
**Description**: Component files maintain their current names (Scene7YourRecipes.tsx, Scene8Manifesto.tsx) while being used in swapped positions

**Acceptance Criteria**:
- File `Scene7YourRecipes.tsx` continues to exist with its current implementation
- File `Scene8Manifesto.tsx` continues to exist with its current implementation
- Parent component maps Scene7YourRecipes to position 8 in the flow
- Parent component maps Scene8Manifesto to position 7 in the flow
- No new scene component files are created

---

## Success Criteria

1. **User Progression**: 100% of users proceeding past Scene 6 see the manifesto before the recipe input screen
2. **Button Clarity**: User testing shows improved understanding of next steps (target: 90% of users correctly predict what happens after clicking "Add your go-to recipes")
3. **Completion Rate**: Onboarding completion rate remains ≥95% of baseline after scene reordering
4. **Zero Regression**: No existing scene functionality breaks (voice input, recipe processing, data persistence)
5. **Navigation Flow**: All scene transitions complete in <500ms with no console errors

---

## Key Entities

### Scene Navigation State
**Purpose**: Track current scene position in the onboarding flow

**Attributes**:
- Current scene number (1-8)
- Scene component mapping (scene number → React component)
- Navigation history

### User Progress Data
**Purpose**: Data collected during onboarding story

**Attributes** (existing, for reference):
- Inventory items (from scenes 1-5)
- User recipes (from scene 8 in new flow)
- Completion status

---

## User Interface Changes

### Scene 7 (Manifesto) - New Position
**Current State**: Scene 8, button says "Get started →"
**New State**: Scene 7, button says "Add your go-to recipes"

**Visual Changes**:
- Button text update only
- No layout or styling changes
- Same manifesto content and animations

### Scene 8 (Your Recipes) - New Position
**Current State**: Scene 7, enabled button says "Continue →"
**New State**: Scene 8, enabled button says "Finish your setup"

**Visual Changes**:
- Button text update when enabled (≥1 recipe added)
- Disabled state text remains "Add at least one recipe to continue"
- No layout or styling changes
- Same recipe input and validation behavior

---

## Edge Cases

### EC-1: User Refreshes on Scene 7
**Scenario**: User refreshes browser while on Scene 7 (manifesto)
**Expected Behavior**: Scene 7 (manifesto) reloads from localStorage state, user can continue to Scene 8

### EC-2: User Refreshes on Scene 8
**Scenario**: User refreshes browser while on Scene 8 (recipe input)
**Expected Behavior**: Scene 8 reloads with any previously added recipes preserved, user can continue adding or finish setup

### EC-3: User Navigates Back from Scene 8 to Scene 7
**Scenario**: User clicks browser back button on Scene 8
**Expected Behavior**: If back navigation is supported, returns to Scene 7 (manifesto); otherwise, prevents navigation (depending on existing behavior)

### EC-4: API Failure on Scene 8 Completion
**Scenario**: "Finish your setup" button clicked but `/api/onboarding/story/complete` fails
**Expected Behavior**: Error message displays, user remains on Scene 8, can retry submission (existing error handling)

---

## Dependencies

### Internal Dependencies
- Scene navigation state management (parent component controlling scene flow)
- localStorage persistence for onboarding state
- Scene component props interfaces (onContinue callback)

### External Dependencies
- None

---

## Assumptions

1. **Component Architecture**: Scenes are rendered by a parent component that controls navigation order and can easily swap scene positions
2. **State Persistence**: Existing localStorage implementation correctly persists state across scene transitions
3. **Button Text Update**: Button text is not hardcoded in multiple places; single update point per button
4. **No Route Changes**: Scene navigation uses state/component switching, not URL routing that would require path updates
5. **Testing Coverage**: Existing tests validate scene flow and can be updated to reflect new order
6. **Analytics & Measurement**: Implementation phase will determine appropriate analytics instrumentation strategy for validating Success Criteria #2 (button clarity) and #3 (completion rate); may leverage existing onboarding analytics or add targeted events as needed

---

## Open Questions

None - feature scope is well-defined with all necessary context from codebase inspection.

---

## Acceptance Testing Scenarios

### AT-1: Complete Onboarding with New Scene Order
**Given**: User starts onboarding from Scene 1
**When**: User completes all scenes in sequence
**Then**:
- Scene 7 shows manifesto content
- Scene 7 button says "Add your go-to recipes"
- Clicking Scene 7 button navigates to recipe input
- Scene 8 shows recipe input interface
- Adding ≥1 recipe enables button with text "Finish your setup"
- Clicking "Finish your setup" submits data and redirects to /app

### AT-2: Button Text Validation
**Given**: User is on Scene 7 (manifesto)
**When**: All content has animated in
**Then**: Primary button displays text "Add your go-to recipes"

**Given**: User is on Scene 8 (recipe input) with 0 recipes added
**When**: Page loads
**Then**: Button is disabled and displays "Add at least one recipe to continue"

**Given**: User is on Scene 8 (recipe input) with 1+ recipes added
**When**: Recipe is successfully added
**Then**: Button is enabled and displays "Finish your setup"

### AT-3: State Persistence Across Refresh
**Given**: User has reached Scene 7 (manifesto)
**When**: User refreshes the page
**Then**:
- User remains on Scene 7
- All manifesto content displays correctly
- "Add your go-to recipes" button is functional

**Given**: User has reached Scene 8 and added 2 recipes
**When**: User refreshes the page
**Then**:
- User remains on Scene 8
- 2 recipes are still displayed
- "Finish your setup" button is enabled

### AT-4: Navigation Flow Integrity
**Given**: User completes Scene 6
**When**: User clicks continue
**Then**: User navigates to Scene 7 (manifesto), not Scene 8

**Given**: User is on Scene 7 (manifesto)
**When**: User clicks "Add your go-to recipes"
**Then**: User navigates to Scene 8 (recipe input)

**Given**: User is on Scene 8 with ≥1 recipe
**When**: User clicks "Finish your setup"
**Then**:
- Loading state displays
- Data submits to `/api/onboarding/story/complete`
- User redirects to /app on success

---

## Notes

- File names (Scene7YourRecipes.tsx, Scene8Manifesto.tsx) do not change; only their position in the navigation flow changes
- This is a pure UX/UI change with no backend or data model modifications
- Existing scene content, animations, and styling remain untouched except for button text
- The change improves narrative coherence by placing user action (adding recipes) as the final interactive step before manifesto closure
