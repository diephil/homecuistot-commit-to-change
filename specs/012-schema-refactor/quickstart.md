# Quickstart: Database Schema Refactoring

**Feature**: 012-schema-refactor
**Time Estimate**: 15-30 minutes (includes schema changes, migration generation, local testing, production deployment)

## Prerequisites

- Working Next.js development environment
- Local Supabase database running OR connection to local PostgreSQL
- Production Supabase database access credentials configured
- Drizzle ORM 0.45.1 installed

## Workflow Overview

```
1. Update schema files (TypeScript)
   ↓
2. Generate migration (Drizzle)
   ↓
3. Review generated SQL
   ↓
4. Apply to local database
   ↓
5. Validate locally
   ↓
6. Apply to production
   ↓
7. Validate production
```

---

## Step 1: Update Schema Files

Navigate to schema directory:
```bash
cd apps/nextjs/src/db/schema
```

### 1.1 Update user-inventory.ts

Add isPantryStaple column:
```typescript
// File: user-inventory.ts
import { pgTable, uuid, integer, timestamp, check, index, uniqueIndex, boolean } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { ingredients } from './ingredients'

export const userInventory = pgTable('user_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'restrict' }),
  quantityLevel: integer('quantity_level').notNull().default(3),
  isPantryStaple: boolean('is_pantry_staple').notNull().default(false), // NEW
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('quantity_level_check', sql`${table.quantityLevel} BETWEEN 0 AND 3`),
  uniqueIndex('idx_user_inventory_unique').on(table.userId, table.ingredientId),
  index('idx_user_inventory_user').on(table.userId),
  index('idx_user_inventory_quantity').on(table.userId, table.quantityLevel).where(sql`${table.quantityLevel} > 0`),
  index('idx_user_inventory_matching').on(table.userId, table.ingredientId, table.quantityLevel).where(sql`${table.quantityLevel} > 0`),
  index('idx_user_inventory_pantry').on(table.userId, table.isPantryStaple).where(sql`${table.isPantryStaple} = true`), // NEW
])

// Relations unchanged
export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [userInventory.ingredientId],
    references: [ingredients.id],
  }),
}))
```

### 1.2 Rename recipes.ts → user-recipes.ts

```bash
mv recipes.ts user-recipes.ts
```

Update content:
```typescript
// File: user-recipes.ts (formerly recipes.ts)
import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { IngredientType } from './enums'
import { ingredients } from './ingredients'
import { userSavedRecipes } from './user-saved-recipes'
import { cookingLog } from './cooking-log'

export const userRecipes = pgTable('user_recipes', {  // RENAMED from recipes
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  // isSeeded: REMOVED
  userId: uuid('user_id').notNull(),  // CHANGED: now NOT NULL
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // recipe_ownership check constraint REMOVED
  index('idx_user_recipes_user').on(table.userId),
  // idx_recipes_user_seeded index REMOVED
])

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id').notNull().references(() => userRecipes.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'restrict' }),
  ingredientType: text('ingredient_type').$type<IngredientType>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_recipe_ingredients_unique').on(table.recipeId, table.ingredientId),
  index('idx_recipe_ingredients_recipe').on(table.recipeId),
  index('idx_recipe_ingredients_ingredient').on(table.ingredientId),
  index('idx_recipe_ingredients_type').on(table.ingredientType),
])

// Relations
export const userRecipesRelations = relations(userRecipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  savedByUsers: many(userSavedRecipes),
  cookingLog: many(cookingLog),
}))

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(userRecipes, {
    fields: [recipeIngredients.recipeId],
    references: [userRecipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))
```

### 1.3 Rename user-recipes.ts → user-saved-recipes.ts

```bash
mv user-recipes.ts user-saved-recipes.ts
```

Update content:
```typescript
// File: user-saved-recipes.ts (formerly user-recipes.ts)
import { pgTable, uuid, timestamp, index, uniqueIndex, text } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { RecipeSource } from './enums'
import { userRecipes } from './user-recipes'

export const userSavedRecipes = pgTable('user_saved_recipes', {  // RENAMED from user_recipes
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  recipeId: uuid('recipe_id').notNull().references(() => userRecipes.id, { onDelete: 'cascade' }),
  source: text('source').$type<RecipeSource>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_user_saved_recipes_unique').on(table.userId, table.recipeId),
  index('idx_user_saved_recipes_user').on(table.userId),
  index('idx_user_saved_recipes_source').on(table.source),
])

// Relations
export const userSavedRecipesRelations = relations(userSavedRecipes, ({ one }) => ({
  recipe: one(userRecipes, {
    fields: [userSavedRecipes.recipeId],
    references: [userRecipes.id],
  }),
}))
```

### 1.4 Delete user-pantry-staples.ts

```bash
rm user-pantry-staples.ts
```

### 1.5 Update index.ts

```bash
# File: index.ts
export * from './ingredients'
export * from './user-inventory'
# export * from './user-pantry-staples'  // REMOVE
export * from './user-recipes'  // RENAMED from './recipes'
export * from './user-saved-recipes'  // RENAMED from './user-recipes'
export * from './cooking-log'
export * from './unrecognized-items'
export * from './enums'
```

---

## Step 2: Generate Migration

From `apps/nextjs/` directory:

```bash
cd /Users/philippediep/Documents/workspace/homecuistot-commit-to-change/apps/nextjs
pnpm db:generate
```

**Expected Output**:
```
Drizzle Kit: Generating migrations...
✓ Generated migration: 0004_schema_refactor.sql
```

---

## Step 3: Review Generated SQL

Open the generated migration file:

```bash
cat src/db/migrations/0004_*.sql
```

**What to Check**:
1. ✅ `ALTER TABLE user_inventory ADD COLUMN is_pantry_staple BOOLEAN NOT NULL DEFAULT false`
2. ✅ `ALTER TABLE recipes RENAME TO user_recipes`
3. ✅ `ALTER TABLE user_recipes RENAME TO user_saved_recipes` (junction table)
4. ✅ `ALTER TABLE user_recipes DROP COLUMN is_seeded`
5. ✅ `ALTER TABLE user_recipes ALTER COLUMN user_id SET NOT NULL`
6. ✅ `DROP TABLE user_pantry_staples`
7. ⚠️ **MISSING**: Data migration SQL (Drizzle doesn't auto-generate data migrations)

**Manual Edit Required**: Add data migration SQL before `DROP TABLE user_pantry_staples`

```sql
-- Manual addition: Migrate pantry staples data BEFORE dropping table

-- Step 1: Insert missing inventory entries for orphaned pantry staples
INSERT INTO user_inventory (user_id, ingredient_id, quantity_level, is_pantry_staple, updated_at)
SELECT ups.user_id, ups.ingredient_id, 3, true, NOW()
FROM user_pantry_staples ups
LEFT JOIN user_inventory ui ON ups.user_id = ui.user_id AND ups.ingredient_id = ui.ingredient_id
WHERE ui.id IS NULL;

-- Step 2: Update existing inventory entries to set isPantryStaple flag
UPDATE user_inventory ui
SET is_pantry_staple = true
FROM user_pantry_staples ups
WHERE ui.user_id = ups.user_id AND ui.ingredient_id = ups.ingredient_id;

-- Step 3: NOW safe to drop table
DROP TABLE user_pantry_staples;
```

---

## Step 4: Apply Migration Locally

```bash
pnpm db:migrate
```

**Expected Output**:
```
Applying migration: 0004_schema_refactor.sql
✓ Migration applied successfully
```

---

## Step 5: Validate Locally

Run validation queries:

```bash
pnpm db:studio
```

Or use psql:
```sql
-- Check pantry staples migrated
SELECT COUNT(*) FROM user_inventory WHERE is_pantry_staple = true;

-- Check tables renamed
\dt user_recipes
\dt user_saved_recipes

-- Verify user_pantry_staples dropped
\dt user_pantry_staples  -- Should return "Did not find any relation"

-- Check recipe userId all NOT NULL
SELECT COUNT(*) FROM user_recipes WHERE user_id IS NULL;  -- Should be 0
```

**Checklist**:
- [ ] user_inventory.isPantryStaple column exists
- [ ] user_recipes table exists (formerly recipes)
- [ ] user_saved_recipes table exists (formerly user_recipes junction)
- [ ] user_pantry_staples table dropped
- [ ] All recipes have userId populated
- [ ] Row counts match pre-migration

---

## Step 6: Apply Migration to Production

**IMPORTANT**: Backup production database before proceeding

```bash
# From apps/nextjs/
pnpm db:migrate:prod
```

**Pre-flight Checks**:
1. ✅ Local migration tested successfully
2. ✅ Production database backup created
3. ✅ Rollback script ready (`specs/012-schema-refactor/contracts/rollback.sql`)
4. ✅ Off-peak hours (if applicable)

**Expected Output**:
```
Connecting to production database...
Applying migration: 0004_schema_refactor.sql
✓ Migration applied successfully
```

---

## Step 7: Validate Production

```bash
pnpm db:status:prod
```

**Manual Verification** (connect to production DB):
```sql
-- Row count validation
SELECT 'user_inventory with isPantryStaple=true' as check_name, COUNT(*) FROM user_inventory WHERE is_pantry_staple = true;
SELECT 'user_recipes' as check_name, COUNT(*) FROM user_recipes;
SELECT 'user_saved_recipes' as check_name, COUNT(*) FROM user_saved_recipes;

-- Table existence
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('user_recipes', 'user_saved_recipes', 'user_inventory');

-- Verify dropped table
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_pantry_staples';  -- Should return 0 rows
```

**Production Checklist**:
- [ ] Migration status shows 0004_schema_refactor applied
- [ ] Row counts match pre-migration snapshot
- [ ] Application endpoints still functional
- [ ] No 500 errors in logs

---

## Rollback Procedure (If Needed)

**Only if migration fails or critical issue discovered**

```bash
# Connect to production DB
psql $DATABASE_URL

# Run rollback script
\i /path/to/specs/012-schema-refactor/contracts/rollback.sql

# Verify rollback
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_pantry_staples';  -- Should exist again
```

---

## Common Issues & Solutions

### Issue: Drizzle doesn't generate data migration SQL

**Solution**: Manually add data migration steps to generated SQL file before `DROP TABLE`

### Issue: userId has NULL values, cannot make NOT NULL

**Solution**: Check for seeded recipes or orphaned recipes. Either assign userId or delete orphaned recipes:
```sql
-- Find orphaned recipes
SELECT id, name FROM recipes WHERE user_id IS NULL;

-- Option A: Delete orphaned recipes
DELETE FROM recipes WHERE user_id IS NULL;

-- Option B: Assign to a system user
UPDATE recipes SET user_id = '[SYSTEM_USER_ID]' WHERE user_id IS NULL;
```

### Issue: Foreign key constraint error during table rename

**Solution**: This shouldn't happen (PostgreSQL handles FK updates automatically). If it does, check:
```sql
-- List FK constraints
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f' AND (conrelid::regclass::text = 'recipes' OR confrelid::regclass::text = 'recipes');
```

---

## Next Steps After Migration

1. Update application code to use renamed tables (`userRecipes`, `userSavedRecipes`)
2. Update queries to use `isPantryStaple` instead of joining `user_pantry_staples`
3. Update TypeScript types (auto-updated by Drizzle if using schema derivation)
4. Test all recipe and pantry staple features
5. Remove legacy code referencing old table names
6. Update API documentation with new schema

---

## Commands Reference

```bash
# Local Development
pnpm db:generate          # Generate migration from schema changes
pnpm db:migrate           # Apply migrations to local DB
pnpm db:status            # Show applied migrations + schema status
pnpm db:push              # Push schema directly (no migration, dev only)
pnpm db:studio            # Open Drizzle Studio GUI

# Production
pnpm db:migrate:prod      # Apply migrations to production DB
pnpm db:status:prod       # Show production migration status

# Troubleshooting
pnpm db:drop              # Drop local database (DESTRUCTIVE)
pnpm db:seed              # Re-seed local database
```
