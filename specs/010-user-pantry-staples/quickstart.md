# Quickstart: Schema Cleanup & User Pantry Staples Table

**Feature**: 010-user-pantry-staples
**Estimated Steps**: 2

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

---

## Verification Checklist

- [ ] `ingredient_aliases` table no longer exists
- [ ] `user_pantry_staples` table created with correct indexes
- [ ] No TypeScript errors (`pnpm build` passes)

## Production Migration

**Commands** (from `apps/nextjs/`):
```bash
pnpm db:migrate:prod    # Apply to production DB
```

## Rollback Plan

If migration fails:
1. Restore `ingredientAliases` schema definition
2. Remove `userPantryStaples` schema
3. Run `pnpm db:generate` to create reverse migration
4. Apply reverse migration
