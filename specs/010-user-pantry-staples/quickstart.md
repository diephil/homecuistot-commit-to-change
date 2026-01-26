# Quickstart: User Pantry Staples

**Feature**: 010-user-pantry-staples
**Estimated Steps**: 6

## Prerequisites

- Supabase local running (`make sbstart`)
- Environment variables configured in `apps/nextjs/.env.local`

## Implementation Order

### Step 1: Database Schema Changes

**Files to modify**:
- `apps/nextjs/src/db/schema/ingredients.ts` - Remove ingredientAliases
- `apps/nextjs/src/db/schema/user-pantry-staples.ts` - NEW file
- `apps/nextjs/src/db/schema/index.ts` - Export new table

**Actions**:
1. Create `user-pantry-staples.ts` with schema from data-model.md
2. Remove `ingredientAliases` table definition from `ingredients.ts`
3. Remove `ingredientAliasesRelations` from `ingredients.ts`
4. Update `ingredientsRelations` to remove `aliases` relation
5. Export new table from `index.ts`

### Step 2: Generate and Apply Migration

**Commands** (from `apps/nextjs/`):
```bash
pnpm db:generate    # Generate migration from schema diff
pnpm db:migrate     # Apply to local DB
```

**Verify**:
- Migration file created in `src/db/migrations/`
- `ingredient_aliases` table dropped
- `user_pantry_staples` table created

### Step 3: Update Onboarding Types

**File**: `apps/nextjs/src/types/onboarding.ts`

**Changes**:
1. Add `StorageLocationSchema` enum
2. Add `ExtractedIngredientSchema` with name + storageLocation
3. Update `OnboardingUpdateSchema.add.ingredients` to use `ExtractedIngredientSchema`

### Step 4: Update LLM Prompts and Schemas

**Files**:
- `apps/nextjs/src/lib/prompts/onboarding-text/process.ts`
- `apps/nextjs/src/lib/prompts/onboarding-voice/process.ts`

**Changes**:
1. Update prompt to request storage location classification
2. Update `responseSchema` for Gemini to include storageLocation enum
3. Both files need identical schema changes

### Step 5: Update Onboarding UI

**File**: `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`

**Changes**:
1. Update `applyOnboardingUpdate` to route ingredients by storageLocation
2. Update Step 3 UI to show "Pantry Items" and "Fridge Items" as separate sections
3. Update display logic to use `state.pantry` and `state.fridge` instead of `state.ingredients`

### Step 6: Production Migration

**Commands** (from `apps/nextjs/`):
```bash
pnpm db:migrate:prod    # Apply to production DB
```

**Verify**:
- Run app locally, test voice/text input
- Verify ingredients appear in correct sections

---

## Verification Checklist

- [ ] `ingredient_aliases` table no longer exists
- [ ] `user_pantry_staples` table created with correct indexes
- [ ] LLM output includes `storageLocation` for each ingredient
- [ ] Review & Refine shows "Pantry Items" / "Fridge Items" sections
- [ ] Ingredients routed correctly (flour→pantry, milk→fridge)
- [ ] No TypeScript errors (`pnpm build` passes)

## Rollback Plan

If migration fails:
1. Restore `ingredientAliases` schema definition
2. Remove `userPantryStaples` schema
3. Run `pnpm db:generate` to create reverse migration
4. Apply reverse migration
