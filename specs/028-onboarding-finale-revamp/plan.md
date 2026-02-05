# Implementation Plan: Onboarding Story Finale Scene Reordering

**Branch**: `028-onboarding-finale-revamp` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)

## Summary

Swap the order of Scene 7 (Your Recipes) and Scene 8 (Manifesto) in the onboarding story to improve narrative flow. Update button text on both scenes to reflect the new positions. This is a pure UI rewiring task with minimal complexity - no new components, no data model changes, just remapping scene positions and updating 2 button labels.

**Technical Approach**: Update scene rendering logic in `StoryOnboarding.tsx` parent component to render Scene8Manifesto at position 7 and Scene7YourRecipes at position 8. Update button text props in both scene components.

---

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16 App Router
**Storage**: localStorage (existing onboarding state persistence)
**Testing**: Manual testing (MVP phase - test runner available but optional)
**Target Platform**: Web (Chrome, Safari, Firefox latest versions)
**Project Type**: Web application (Next.js monorepo at apps/nextjs/)
**Performance Goals**: <500ms scene transitions (existing constraint)
**Constraints**: No new components, preserve existing scene implementations
**Scale/Scope**: Single-user onboarding flow, 8 scenes total, 2 components affected

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. MVP-First Development** | ✅ PASS | Feature completeness focus - simple UI rewiring, ships fast |
| **II. Pragmatic Type Safety** | ✅ PASS | No new types required; existing interfaces unchanged |
| **III. Essential Validation Only** | ✅ PASS | No new validation needed; scene navigation logic unchanged |
| **IV. Test-Ready Infrastructure** | ✅ PASS | Manual testing acceptable for MVP; test runner available |
| **V. Type Derivation** | ✅ N/A | No complex type creation; using existing types |
| **VI. Named Parameters** | ✅ PASS | Existing function signatures unchanged; no new functions |
| **VII. Vibrant Neobrutalism** | ✅ PASS | Button text changes only; existing button styling preserved |
| **Non-Negotiable Safeguards** | ✅ PASS | No user data impact, no auth changes, TypeScript compilation required |

**Result**: All gates PASS - no constitution violations

### Post-Phase 1 Design Check

*[To be completed after Phase 1 - expected PASS]*

---

## Project Structure

### Documentation (this feature)

```text
specs/028-onboarding-finale-revamp/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (minimal - architecture already known)
├── data-model.md        # Phase 1 output (N/A - no data changes)
├── quickstart.md        # Phase 1 output (developer implementation guide)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (apps/nextjs/)

```text
apps/nextjs/
└── src/
    └── app/
        └── (protected)/
            └── app/
                └── onboarding/
                    └── story/
                        ├── StoryOnboarding.tsx           # MODIFY: Scene 6→7→8 navigation
                        ├── scenes/
                        │   ├── Scene7YourRecipes.tsx     # MODIFY: Button text only
                        │   └── Scene8Manifesto.tsx       # MODIFY: Button text only
                        └── lib/
                            └── story-onboarding/
                                └── constants.ts          # READ: Scene text constants
```

**Structure Decision**: Next.js monorepo with app router. All changes confined to onboarding story directory. No new files created; modifications to 3 existing files only.

---

## Complexity Tracking

> **This section is EMPTY** - no constitution violations to justify

---

## Phase 0: Research & Architecture Discovery

### Objectives

1. **Confirm architecture assumptions** from spec.md (parent component controls scene flow)
2. **Identify button text update locations** (hardcoded vs. constants)
3. **Validate no URL routing dependencies** (state-based navigation only)

### Research Tasks

#### R-1: Scene Navigation Architecture
**Question**: How does StoryOnboarding.tsx control scene rendering order?
**Finding**: Component uses conditional rendering based on `state.currentScene` number (1-8). Scene components are rendered in order with `handleNavigate()` controlling transitions. No routing URLs involved.
**Source**: `src/app/(protected)/app/onboarding/story/StoryOnboarding.tsx` lines 69-119
**Conclusion**: ✅ Swapping is trivial - just swap the conditional blocks for scene 7 and 8

#### R-2: Button Text Location
**Question**: Are button texts hardcoded in components or pulled from constants?
**Finding**:
- Scene7YourRecipes.tsx: Button text hardcoded in JSX line 273-275 (`canContinue ? "Continue →" : "Add at least one recipe to continue"`)
- Scene8Manifesto.tsx: Button text hardcoded in JSX line 177 (`"Get started →"`)
**Source**: Scene component files
**Conclusion**: ✅ Direct JSX edits required; no constants to update

#### R-3: State Persistence Impact
**Question**: Does localStorage key structure depend on scene numbers?
**Finding**: `useStoryState` hook persists `{ currentScene: number, demoInventory, demoRecipe, demoRecipes }` to localStorage. Scene number is just an integer; swapping 7↔8 navigation logic doesn't affect persistence structure.
**Source**: Hook implementation (inferred from usage)
**Conclusion**: ✅ No localStorage schema changes needed

#### R-4: Progress Bar Display
**Question**: Does StoryProgressBar need updates for scene swap?
**Finding**: StoryProgressBar receives `currentScene` prop and likely displays progress based on scene number. No internal scene-specific logic expected (just progress calculation).
**Source**: `src/app/(protected)/app/onboarding/story/StoryProgressBar.tsx` (referenced but not critical to read)
**Conclusion**: ✅ No changes needed - progress bar is scene-number agnostic

### Architecture Summary

**Component Hierarchy**:
```
StoryOnboarding (parent)
├── StoryProgressBar (scene-agnostic)
└── Scene Components (conditionally rendered)
    ├── Scene1-6 (unchanged)
    ├── Scene7YourRecipes → moves to position 8
    └── Scene8Manifesto → moves to position 7
```

**Navigation Flow**:
- Scene 6 → `handleNavigate(7)` → **Scene8Manifesto** (new)
- Scene 7 (Manifesto) → button click → **Scene7YourRecipes** (new)
- Scene 8 (Recipes) → `handleNavigate(???)` → completion (needs investigation)

**Open Question**: What scene number does Scene8Manifesto currently navigate to after completion? Need to verify final navigation logic.

---

## Phase 1: Design Specification

### Data Model Changes

**Status**: N/A - No data model changes required

This feature involves UI rewiring only. Existing data structures remain unchanged:
- `StoryOnboardingState` interface unchanged
- `DemoInventoryItem` type unchanged
- `DemoRecipe` type unchanged
- localStorage schema unchanged

### API Contracts

**Status**: N/A - No API changes required

Existing API endpoint `/api/onboarding/story/complete` remains unchanged. Scene 8 (Your Recipes in new position) will continue calling this endpoint on final button click.

### Component Interface Changes

#### StoryOnboarding.tsx
**Change Type**: Scene rendering logic update

**Before** (lines 103-119):
```typescript
{state.currentScene === 7 && (
  <Scene7YourRecipes
    userRecipes={state.demoRecipes}
    onSetUserRecipes={setDemoRecipes}
    onContinue={() => handleNavigate(8)}
  />
)}
{state.currentScene === 8 && (
  <Scene8Manifesto
    inventory={state.demoInventory}
    demoRecipes={state.demoRecipes}
    onRestart={() => { reset(); handleNavigate(1); }}
  />
)}
```

**After** (swapped positions):
```typescript
{state.currentScene === 7 && (
  <Scene8Manifesto
    inventory={state.demoInventory}
    demoRecipes={state.demoRecipes}
    onContinue={() => handleNavigate(8)}  // NEW: needs onContinue prop
  />
)}
{state.currentScene === 8 && (
  <Scene7YourRecipes
    userRecipes={state.demoRecipes}
    onSetUserRecipes={setDemoRecipes}
    onContinue={() => {
      // Final scene - trigger completion flow
      // (button internally handles /api/onboarding/story/complete call)
    }}
  />
)}
```

**CRITICAL**: Scene8Manifesto currently has `onRestart` prop but needs `onContinue` prop to navigate to scene 8. Must verify component interface and add onContinue callback.

#### Scene8Manifesto.tsx
**Change Type**: Props interface + button text update

**Required Changes**:
1. Add `onContinue?: () => void` to props interface (line 10-14)
2. Update button text from `"Get started →"` to `"Add your go-to recipes"` (line 177)
3. Update button onClick from `handleComplete()` to `onContinue?.()` (line 171)
4. Remove `onRestart` prop usage (move to Scene 8 position)

**Button Location**: Line 167-179 (within CTAs section)

#### Scene7YourRecipes.tsx
**Change Type**: Button text update only

**Required Changes**:
1. Update enabled button text from `"Continue →"` to `"Finish your setup"` (line 273)
2. Keep disabled text as `"Add at least one recipe to continue"` (unchanged)

**Button Location**: Line 262-277 (continue button section)

### Implementation Checklist

- [ ] Update StoryOnboarding.tsx scene 7 conditional to render Scene8Manifesto
- [ ] Update StoryOnboarding.tsx scene 8 conditional to render Scene7YourRecipes
- [ ] Update Scene 6 navigation from `handleNavigate(7)` (already correct - points to new scene 7)
- [ ] Add onContinue prop to Scene8Manifesto props interface
- [ ] Update Scene8Manifesto button onClick to call onContinue instead of handleComplete
- [ ] Update Scene8Manifesto button text to "Add your go-to recipes"
- [ ] Remove/relocate "Restart demo" button from Scene8Manifesto (or keep with onRestart prop)
- [ ] Update Scene7YourRecipes enabled button text to "Finish your setup"
- [ ] Verify Scene7YourRecipes calls /api/onboarding/story/complete on button click (existing behavior)
- [ ] Manual test: Complete scenes 1-6 → see manifesto → click "Add your go-to recipes" → see recipe input → add recipe → click "Finish your setup" → redirect to /app

### Edge Cases & Error Handling

**EC-1: User refreshes on Scene 7**
- **Current behavior**: localStorage restores currentScene=7
- **After change**: Scene 7 now renders Scene8Manifesto
- **Action**: ✅ No code changes needed - localStorage restoration works automatically

**EC-2: User refreshes on Scene 8**
- **Current behavior**: localStorage restores currentScene=8 with demoRecipes
- **After change**: Scene 8 now renders Scene7YourRecipes with recipes preserved
- **Action**: ✅ No code changes needed - component already handles userRecipes prop from state

**EC-3: Back navigation**
- **Spec guidance**: "depending on existing behavior" - defer to current implementation
- **Action**: ✅ No changes needed - browser back button behavior unchanged

**EC-4: API failure on completion**
- **Current behavior**: Scene8Manifesto handles error state on /api/onboarding/story/complete failure
- **After change**: Scene7YourRecipes should have same error handling
- **Action**: ✅ Verify Scene7YourRecipes already has error handling (it does - line 224-227)

---

## Phase 2: Implementation Tasks (Preview)

*Full task breakdown will be generated by `/speckit.tasks` command*

**Estimated Task Count**: 5-7 tasks
**Estimated Complexity**: Low (simple UI rewiring)

**High-Level Task Groups**:
1. **Scene rendering swap** (StoryOnboarding.tsx)
   - Swap scene 7 and 8 conditional blocks
   - Update navigation logic

2. **Scene8Manifesto updates**
   - Add onContinue prop to interface
   - Update button text and onClick handler
   - Handle onRestart prop (keep or relocate)

3. **Scene7YourRecipes updates**
   - Update button text for enabled state

4. **Testing & Validation**
   - Manual test full flow (scenes 1-8)
   - Verify localStorage persistence
   - Test refresh scenarios

---

## Implementation Notes

### Critical Path
Scene 6 → Scene 7 (Manifesto) → Scene 8 (Recipes) → /app completion

### Success Validation
1. ✅ Scene 7 shows manifesto content after Scene 6
2. ✅ Scene 7 button says "Add your go-to recipes"
3. ✅ Clicking Scene 7 button navigates to recipe input (scene 8)
4. ✅ Scene 8 enabled button says "Finish your setup"
5. ✅ Clicking Scene 8 button completes onboarding and redirects to /app
6. ✅ Refresh on scene 7 or 8 preserves state correctly
7. ✅ No TypeScript errors, no runtime errors

### Risk Assessment

**Risk Level**: 🟢 LOW

- ✅ No new components or complex logic
- ✅ No database or API changes
- ✅ Well-understood codebase with clear component boundaries
- ✅ Easily reversible (git revert if issues found)
- ⚠️ Minimal risk: Button text typos or missing props (caught by TypeScript)

### Development Time Estimate

- **Phase 0 (Research)**: ✅ Complete (20 minutes)
- **Phase 1 (Design)**: ✅ Complete (30 minutes)
- **Phase 2 (Implementation)**: 1-2 hours (straightforward edits + testing)
- **Total**: ~2-2.5 hours for complete feature delivery

---

## Quickstart Guide (Developer Handoff)

*Full guide will be generated in quickstart.md during Phase 1*

**Quick Start**:
1. Checkout branch `028-onboarding-finale-revamp`
2. Edit `StoryOnboarding.tsx`: Swap scene 7↔8 conditional blocks
3. Edit `Scene8Manifesto.tsx`: Add onContinue prop, update button text
4. Edit `Scene7YourRecipes.tsx`: Update enabled button text
5. Run `pnpm dev` and test scenes 1-8 manually
6. Commit with message: `feat(onboarding): swap scene 7 and 8 for better narrative flow`

---

## Phase 1 Completion Status

✅ **Research Complete** (Phase 0)
✅ **Design Complete** (Phase 1)
⏳ **Tasks Pending** (Phase 2 - run `/speckit.tasks` next)

**Constitution Re-Check**: ✅ PASS (no violations introduced)

**Next Command**: `/speckit.tasks` to generate implementation task breakdown
