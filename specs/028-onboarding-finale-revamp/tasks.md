# Tasks: Onboarding Story Finale Scene Reordering

**Input**: Design documents from `/specs/028-onboarding-finale-revamp/`
**Prerequisites**: plan.md, spec.md, quickstart.md

**Tests**: Manual testing only (MVP phase - no automated tests requested)

**Organization**: Single user story feature with implementation tasks grouped by file modification

---

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- No [Story] labels needed (single feature, not multi-story)

---

## Phase 1: Setup

**Purpose**: Verify development environment ready

- [ ] T001 Verify on branch `028-onboarding-finale-revamp` and dependencies installed (`pnpm install` from apps/nextjs/)

---

## Phase 2: Implementation - Scene Reordering

**Goal**: Swap Scene 7 (Your Recipes) and Scene 8 (Manifesto) positions, update button text to match new narrative flow

**Independent Test**: After implementation, user should see manifesto at scene 7 with "Add your go-to recipes" button, then recipe input at scene 8 with "Finish your setup" button

### Scene Rendering Swap

- [ ] T002 [P] Swap scene 7 and 8 conditional rendering blocks in `apps/nextjs/src/app/(protected)/app/onboarding/story/StoryOnboarding.tsx` (lines 103-119)

**Details for T002**:
- Scene 7 conditional: Change from `<Scene7YourRecipes>` to `<Scene8Manifesto>`
- Scene 8 conditional: Change from `<Scene8Manifesto>` to `<Scene7YourRecipes>`
- Add `onContinue={() => handleNavigate(8)}` prop to Scene8Manifesto (scene 7 position)
- Keep `onRestart` prop on Scene8Manifesto for "Restart demo" button
- Scene7YourRecipes (scene 8 position) keeps existing `onContinue` prop behavior

### Scene8Manifesto Updates (New Scene 7 Position)

- [ ] T003 [P] Add `onContinue: () => void` to Scene8Manifesto props interface in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene8Manifesto.tsx` (line 10-14)

**Details for T003**:
- Update `Scene8ManifestoProps` interface to include `onContinue: () => void`
- Add `onContinue` to destructured props (line 16-20)

- [ ] T004 Update Scene8Manifesto primary button in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene8Manifesto.tsx` (line 167-179)

**Details for T004** (depends on T003):
- Change button `onClick` from `handleComplete` to `onContinue`
- Change button text from `"Get started →"` to `"Add your go-to recipes"`
- Remove `{loading ? <Loader2> : "..."}` conditional (no loading state needed)
- Remove `disabled={loading}` prop
- Delete `handleComplete` function (lines 25-74)
- Delete related state: `loading`, `error` useState hooks (lines 22-23)
- Delete unused imports: `useRouter`, `Loader2`, `LOCALSTORAGE_KEY`, `COMPLETION_FLAG_KEY`
- Delete loading screen conditional block (lines 76-94)

### Scene7YourRecipes Updates (New Scene 8 Position)

- [ ] T005 [P] Update enabled button text in `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene7YourRecipes.tsx` (line 273)

**Details for T005**:
- Change enabled button text from `"Continue →"` to `"Finish your setup"`
- Keep disabled text as `"Add at least one recipe to continue"` (unchanged)

**Checkpoint**: Implementation complete - all 3 files modified, scene positions swapped, button texts updated

---

## Phase 3: Validation & Testing

**Purpose**: Verify scene swap works correctly across all scenarios

### TypeScript Validation

- [ ] T006 Run TypeScript compilation check: `pnpm tsc --noEmit` from apps/nextjs/ (expect 0 errors)

### Manual Testing - Primary Flow

- [ ] T007 Complete onboarding scenes 1-8 and verify new flow

**Test Steps for T007**:
1. Start dev server: `pnpm dev` from apps/nextjs/
2. Navigate to `/app/onboarding/story`
3. Complete scenes 1-6 normally
4. **Scene 7 verification**:
   - ✅ Manifesto content displays (not recipe input)
   - ✅ Button text reads "Add your go-to recipes"
   - ✅ Click button → navigates to scene 8
5. **Scene 8 verification**:
   - ✅ Recipe input interface displays (not manifesto)
   - ✅ Add at least 1 recipe via voice or text
   - ✅ Button text reads "Finish your setup" when enabled
   - ✅ Click "Finish your setup" → loading screen → redirects to `/app`
6. ✅ Verify user lands on `/app` with inventory and recipes persisted

### Manual Testing - Edge Cases

- [ ] T008 Test refresh scenarios on scenes 7 and 8

**Test Steps for T008**:

**Refresh on Scene 7**:
1. Navigate to scene 7 (manifesto)
2. Refresh browser (Cmd+R / Ctrl+R)
3. ✅ Verify scene 7 still shows manifesto content
4. ✅ Verify "Add your go-to recipes" button is functional
5. ✅ Click button → navigates to scene 8

**Refresh on Scene 8**:
1. Navigate to scene 8, add 2 recipes
2. Refresh browser
3. ✅ Verify scene 8 still shows recipe input
4. ✅ Verify 2 recipes are displayed
5. ✅ Verify "Finish your setup" button is enabled
6. ✅ Click button → completes onboarding successfully

**Back Navigation** (if supported):
1. Navigate to scene 8
2. Click browser back button
3. ✅ Verify behavior matches existing implementation (prevent or return to scene 7)

### Final Review

- [ ] T009 Complete quickstart.md verification checklist

**Checklist for T009** (from quickstart.md):
- [ ] Scene 7 renders manifesto content (not recipe input)
- [ ] Scene 7 button text is "Add your go-to recipes"
- [ ] Scene 7 button navigates to scene 8
- [ ] Scene 8 renders recipe input (not manifesto)
- [ ] Scene 8 enabled button text is "Finish your setup"
- [ ] Scene 8 button completes onboarding and redirects to /app
- [ ] Refresh on scene 7 works correctly
- [ ] Refresh on scene 8 preserves recipes
- [ ] TypeScript compiles without errors
- [ ] No console errors during full flow test
- [ ] "Restart demo" button still works on scene 7

**Checkpoint**: All validation complete - feature ready for commit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - verify environment
- **Phase 2 (Implementation)**: Depends on Phase 1 - file modifications
- **Phase 3 (Validation)**: Depends on Phase 2 completion - testing

### Task Dependencies Within Implementation

```
T001 (Setup)
  ↓
[T002, T003, T005] ← Can run in PARALLEL (different files)
  ↓
T004 ← Depends on T003 (same file: Scene8Manifesto.tsx)
  ↓
T006, T007, T008, T009 (Validation phase)
```

### Parallel Opportunities

**During Implementation (Phase 2)**:
- T002, T003, T005 can execute in parallel (3 different files)
- T004 must wait for T003 (same file, interface before button)

**Optimal Execution**:
```bash
# Step 1: Setup
Execute T001

# Step 2: Parallel implementation (3 files)
Parallel {
  Task T002: StoryOnboarding.tsx
  Task T003: Scene8Manifesto.tsx (props only)
  Task T005: Scene7YourRecipes.tsx
}

# Step 3: Sequential (depends on T003)
Execute T004: Scene8Manifesto.tsx (button update)

# Step 4: Validation
Execute T006, T007, T008, T009
```

---

## Implementation Strategy

### Single-Phase MVP (Recommended)

This feature is atomic - all changes must ship together for coherent UX:

1. ✅ Phase 1: Setup (T001)
2. ✅ Phase 2: Implementation (T002-T005) - complete scene swap
3. ✅ Phase 3: Validation (T006-T009) - verify before commit
4. **STOP and COMMIT**: Feature complete, ready for PR

**Cannot deliver incrementally** - partial scene swap would break onboarding flow.

### Time Estimate

- **Phase 1 (Setup)**: 2-3 minutes
- **Phase 2 (Implementation)**: 45-60 minutes
  - T002: 10 minutes
  - T003: 10 minutes
  - T004: 25 minutes (remove handleComplete, update button, clean imports)
  - T005: 5 minutes
- **Phase 3 (Validation)**: 30-45 minutes
  - T006: 2 minutes
  - T007: 15-20 minutes (full flow test)
  - T008: 10-15 minutes (edge cases)
  - T009: 5 minutes (checklist review)
- **Total**: ~1.5-2 hours end-to-end

---

## Commit Strategy

After T009 completion, commit with:

```bash
git add apps/nextjs/src/app/\(protected\)/app/onboarding/story/

git commit -m "$(cat <<'EOF'
feat(onboarding): swap scene 7 and 8 for better narrative flow

Scene 7 (Manifesto) → Scene 8 (Your Recipes) creates stronger
emotional arc: philosophy before personal action.

Changes:
- StoryOnboarding.tsx: Swap scene 7↔8 conditional rendering
- Scene8Manifesto: Add onContinue prop, update button text
- Scene7YourRecipes: Update enabled button text to "Finish your setup"

Manual testing: Full flow (scenes 1-8) + refresh scenarios validated
TypeScript: No compilation errors

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Notes

- **[P] tasks**: Different files, can execute in parallel
- **No [Story] labels**: Single feature (not multi-story), simple implementation
- **Manual testing only**: MVP phase - no automated tests requested or needed
- **Atomic feature**: All changes must ship together - no incremental delivery possible
- **Low risk**: Pure UI rewiring, easily reversible via `git revert`
- **TypeScript safety**: Missing props or wrong types will fail compilation (T006 catches)

---

## Quick Reference

**Files Modified**: 3
- `apps/nextjs/src/app/(protected)/app/onboarding/story/StoryOnboarding.tsx`
- `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene8Manifesto.tsx`
- `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene7YourRecipes.tsx`

**Total Tasks**: 9 (1 setup, 4 implementation, 4 validation)

**Parallel Tasks**: 3 (T002, T003, T005)

**Critical Path**: T001 → [T002 | T003 | T005] → T004 → [T006-T009]

**Estimated Duration**: 1.5-2 hours

**Complexity**: 🟢 LOW (React component rewiring, no new code)
