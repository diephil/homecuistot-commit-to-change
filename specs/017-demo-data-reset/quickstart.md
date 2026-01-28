# Quickstart: Demo Data Reset

**Feature**: 017-demo-data-reset | **Date**: 2026-01-28

## Implementation Order

### Step 1: Create Demo Data Constants

**File**: `apps/nextjs/src/db/demo-data.ts`

Create file with `DEMO_INVENTORY` and `DEMO_RECIPES` arrays as specified in data-model.md.

### Step 2: Create Shared Confirmation Modal

**File**: `apps/nextjs/src/components/app/confirmation-modal.tsx`

Extract modal logic from `reset-user-data-button.tsx` into reusable component with props for customization.

### Step 3: Refactor ResetUserDataButton

**File**: `apps/nextjs/src/components/app/reset-user-data-button.tsx`

Replace inline modal with `<ConfirmationModal />` component. Keep existing behavior.

### Step 4: Create startDemoData Server Action

**File**: `apps/nextjs/src/app/actions/user-data.ts`

Add new exported function following contract in `contracts/server-actions.md`:
1. Auth check
2. Transaction: delete all → insert demo data
3. Revalidate paths
4. Return result

### Step 5: Create StartDemoButton Component

**File**: `apps/nextjs/src/components/app/start-demo-button.tsx`

Blue neo-brutalist button that:
1. Opens modal on click
2. Calls `startDemoData()` on confirm
3. Calls `router.refresh()` on success

### Step 6: Update App Page

**File**: `apps/nextjs/src/app/(protected)/app/page.tsx`

Add `StartDemoButton` next to `ResetUserDataButton` with `gap-4` spacing.

## Manual Testing Checklist

- [ ] Click "Start Demo" → modal opens
- [ ] Click Cancel → modal closes, no data change
- [ ] Click outside modal → modal closes, no data change
- [ ] Click Confirm → loading state shows
- [ ] After confirm → /app page shows demo recipes
- [ ] Navigate to /app/inventory → shows 21 ingredients
- [ ] Navigate to /app/recipes → shows 6 recipes
- [ ] "Reset user data" button still works (redirects to onboarding)

## Files Changed

| File | Action |
|------|--------|
| `src/db/demo-data.ts` | CREATE |
| `src/components/app/confirmation-modal.tsx` | CREATE |
| `src/components/app/start-demo-button.tsx` | CREATE |
| `src/components/app/reset-user-data-button.tsx` | MODIFY |
| `src/app/actions/user-data.ts` | MODIFY |
| `src/app/(protected)/app/page.tsx` | MODIFY |

Total: 3 new files, 3 modified files
