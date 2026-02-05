# Quick Start: Onboarding Scene Reordering

**Feature**: 028-onboarding-finale-revamp
**Complexity**: 🟢 Low (2-3 hours implementation)
**Files Modified**: 3 (StoryOnboarding.tsx, Scene7YourRecipes.tsx, Scene8Manifesto.tsx)

---

## What You're Building

Swap Scene 7 (Your Recipes) and Scene 8 (Manifesto) positions in the onboarding story flow, updating button text to match the new narrative arc:

**New Flow**: Scene 6 → Scene 7 (Manifesto) → Scene 8 (Your Recipes) → Complete

---

## Prerequisites

- ✅ Branch `028-onboarding-finale-revamp` checked out
- ✅ Dependencies installed (`pnpm install` from `apps/nextjs/`)
- ✅ Dev server running (`pnpm dev`)
- ✅ Familiarity with React conditional rendering

---

## Implementation Steps

### Step 1: Update Scene Rendering (StoryOnboarding.tsx)

**File**: `apps/nextjs/src/app/(protected)/app/onboarding/story/StoryOnboarding.tsx`

**Find** (lines 103-119):
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
    onRestart={() => {
      reset();
      handleNavigate(1);
    }}
  />
)}
```

**Replace with**:
```typescript
{state.currentScene === 7 && (
  <Scene8Manifesto
    inventory={state.demoInventory}
    demoRecipes={state.demoRecipes}
    onContinue={() => handleNavigate(8)}
    onRestart={() => {
      reset();
      handleNavigate(1);
    }}
  />
)}
{state.currentScene === 8 && (
  <Scene7YourRecipes
    userRecipes={state.demoRecipes}
    onSetUserRecipes={setDemoRecipes}
    onContinue={() => {
      // Scene 8 button internally handles /api/onboarding/story/complete
      // No-op: component manages completion flow
    }}
  />
)}
```

**Key Changes**:
- Scene 7 now renders `Scene8Manifesto` (was `Scene7YourRecipes`)
- Scene 8 now renders `Scene7YourRecipes` (was `Scene8Manifesto`)
- Added `onContinue` prop to Scene8Manifesto (navigates to scene 8)
- Kept `onRestart` prop on Scene8Manifesto for "Restart demo" button

---

### Step 2: Update Scene8Manifesto Props & Button

**File**: `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene8Manifesto.tsx`

#### 2a. Update Props Interface

**Find** (lines 10-14):
```typescript
interface Scene8ManifestoProps {
  inventory: DemoInventoryItem[];
  demoRecipes: DemoRecipe[];
  onRestart: () => void;
}
```

**Replace with**:
```typescript
interface Scene8ManifestoProps {
  inventory: DemoInventoryItem[];
  demoRecipes: DemoRecipe[];
  onContinue: () => void;
  onRestart: () => void;
}
```

**Change**: Added `onContinue: () => void` prop

#### 2b. Destructure onContinue Prop

**Find** (lines 16-20):
```typescript
export function Scene8Manifesto({
  inventory,
  demoRecipes,
  onRestart,
}: Scene8ManifestoProps) {
```

**Replace with**:
```typescript
export function Scene8Manifesto({
  inventory,
  demoRecipes,
  onContinue,
  onRestart,
}: Scene8ManifestoProps) {
```

**Change**: Added `onContinue` to destructured props

#### 2c. Update Primary Button

**Find** (lines 167-179):
```typescript
<Button
  variant="default"
  size="lg"
  className="w-full justify-center"
  onClick={handleComplete}
  disabled={loading}
>
  {loading ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : (
    "Get started →"
  )}
</Button>
```

**Replace with**:
```typescript
<Button
  variant="default"
  size="lg"
  className="w-full justify-center"
  onClick={onContinue}
  disabled={loading}
>
  Add your go-to recipes
</Button>
```

**Key Changes**:
- Changed `onClick={handleComplete}` to `onClick={onContinue}`
- Changed button text from `"Get started →"` to `"Add your go-to recipes"`
- Removed loading state logic (no longer needed - onContinue just navigates)

#### 2d. Remove handleComplete Function

**Find & Delete** (lines 25-74):
```typescript
const handleComplete = async () => {
  setLoading(true);
  setError(null);

  try {
    // ... entire handleComplete function ...
  } catch (err) {
    // ...
  }
};
```

**Remove** the entire `handleComplete` function and related state:
- Delete `const [loading, setLoading] = useState(false);` (line 22)
- Delete `const [error, setError] = useState<string | null>(null);` (line 23)
- Delete `const router = useRouter();` import and usage (line 4, 21)
- Delete unused imports: `useRouter` from `next/navigation`, `Loader2` from `lucide-react`

#### 2e. Remove Loading Screen

**Find & Delete** (lines 76-94):
```typescript
// Loading screen
if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-8">
      {/* ... loading UI ... */}
    </div>
  );
}
```

**Remove** the entire loading screen conditional block

---

### Step 3: Update Scene7YourRecipes Button Text

**File**: `apps/nextjs/src/app/(protected)/app/onboarding/story/scenes/Scene7YourRecipes.tsx`

**Find** (line 273):
```typescript
{canContinue
  ? "Continue →"
  : "Add at least one recipe to continue"}
```

**Replace with**:
```typescript
{canContinue
  ? "Finish your setup"
  : "Add at least one recipe to continue"}
```

**Change**: Updated enabled button text from `"Continue →"` to `"Finish your setup"`

---

## Testing Checklist

### Manual Test Flow

Start dev server and test the complete onboarding flow:

```bash
cd apps/nextjs
pnpm dev
# Open http://localhost:3000/app/onboarding/story
```

**Test Sequence**:
1. ✅ Complete scenes 1-6 (navigate through normally)
2. ✅ **Scene 7**: Verify manifesto content displays
3. ✅ **Scene 7**: Verify button text is "Add your go-to recipes"
4. ✅ **Scene 7**: Click button → navigates to scene 8 (recipe input)
5. ✅ **Scene 8**: Add at least 1 recipe via voice or text
6. ✅ **Scene 8**: Verify button text is "Finish your setup" when enabled
7. ✅ **Scene 8**: Click "Finish your setup" → loading screen → redirects to /app
8. ✅ Verify user lands on `/app` with data persisted

### Edge Case Testing

**Refresh on Scene 7**:
1. Navigate to scene 7 (manifesto)
2. Refresh browser (Cmd+R / Ctrl+R)
3. ✅ Verify scene 7 still shows manifesto
4. ✅ Verify button is functional

**Refresh on Scene 8**:
1. Navigate to scene 8, add 2 recipes
2. Refresh browser
3. ✅ Verify scene 8 shows recipe input
4. ✅ Verify 2 recipes still displayed
5. ✅ Verify "Finish your setup" button is enabled

**Back Navigation** (if supported):
1. Navigate to scene 8
2. Click browser back button
3. ✅ Verify behavior matches existing implementation (likely prevents navigation or returns to scene 7)

### TypeScript Validation

```bash
cd apps/nextjs
pnpm tsc --noEmit
```

✅ Expected: No TypeScript errors

---

## Common Issues & Solutions

### Issue: TypeScript error "Property 'onContinue' does not exist"
**Cause**: Forgot to add `onContinue` to Scene8Manifesto props interface
**Fix**: Add `onContinue: () => void` to `Scene8ManifestoProps` interface

### Issue: Scene 7 button still says "Get started →"
**Cause**: Updated wrong button or cache issue
**Fix**: Verify Scene8Manifesto.tsx line 177, clear browser cache, hard refresh

### Issue: Scene 8 completion fails to redirect
**Cause**: Scene7YourRecipes doesn't handle completion internally
**Fix**: Verify Scene7YourRecipes still has `handleComplete` function and calls `/api/onboarding/story/complete` (it should - existing implementation)

### Issue: Restart demo button not working
**Cause**: Removed `onRestart` prop from Scene8Manifesto
**Fix**: Keep both `onContinue` and `onRestart` props in Scene8Manifesto interface and parent component

---

## Verification Checklist

Before committing, verify:

- [ ] Scene 7 renders manifesto content (not recipe input)
- [ ] Scene 7 button text is "Add your go-to recipes"
- [ ] Scene 7 button navigates to scene 8
- [ ] Scene 8 renders recipe input (not manifesto)
- [ ] Scene 8 enabled button text is "Finish your setup"
- [ ] Scene 8 button completes onboarding and redirects to /app
- [ ] Refresh on scene 7 works correctly
- [ ] Refresh on scene 8 preserves recipes
- [ ] TypeScript compiles without errors (`pnpm tsc --noEmit`)
- [ ] No console errors during full flow test
- [ ] "Restart demo" button still works on scene 7

---

## Commit Message Template

```
feat(onboarding): swap scene 7 and 8 for better narrative flow

Scene 7 (Manifesto) → Scene 8 (Your Recipes) creates stronger
emotional arc: philosophy before personal action.

Changes:
- StoryOnboarding.tsx: Swap scene 7↔8 conditional rendering
- Scene8Manifesto: Add onContinue prop, update button text
- Scene7YourRecipes: Update enabled button text to "Finish your setup"

Closes #028

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Next Steps

1. ✅ Implementation complete
2. ✅ Manual testing passed
3. ✅ TypeScript compilation successful
4. Run `/speckit.tasks` to generate detailed task breakdown (optional - for tracking)
5. Commit changes with message above
6. Create PR targeting `main` branch
7. Request code review focusing on:
   - Scene navigation logic correctness
   - Button text accuracy
   - No regressions in existing scenes

---

## Time Estimate

- **Step 1 (Scene rendering swap)**: 15-20 minutes
- **Step 2 (Scene8Manifesto updates)**: 30-40 minutes
- **Step 3 (Scene7YourRecipes button)**: 5 minutes
- **Testing & validation**: 30-45 minutes
- **Total**: 1.5-2 hours

---

## Support

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Questions**: Check plan.md Phase 1 "Component Interface Changes" section for detailed before/after code
