# Data Model: Drizzle ORM Schema Definitions

**Date**: 2026-01-19
**Phase**: 1 (Design & Contracts)
**Based on**: `.wip/db-model.md` v1.2

## Overview

Drizzle schema definitions for HomeCuistot meal planning database. Maps existing PostgreSQL schema to type-safe TypeScript interfaces with full RLS support.

---

## Schema Structure

```text
src/db/schema/
├── index.ts                  # Re-exports all schemas
├── enums.ts                  # PostgreSQL enums
├── ingredients.ts            # Ingredients + aliases
├── recipes.ts                # Recipes + recipe_ingredients
├── user-inventory.ts         # User inventory
├── user-recipes.ts           # User recipe collection
├── cooking-log.ts            # Cooking history
└── unrecognized-items.ts     # Voice extraction unknowns
```

---

## Entity Definitions

### Enums (`src/db/schema/enums.ts`)

```typescript
import { pgEnum } from 'drizzle-orm/pg-core'

// Ingredient categories for meal planning domain
export const ingredientCategoryEnum = pgEnum('ingredient_category', [
  'meat',
  'proteins_nonmeat',
  'legumes',
  'vegetables',
  'starches',
  'dairy',
  'canned_jarred',
])

// Recipe ingredient classification
export const ingredientTypeEnum = pgEnum('ingredient_type', [
  'anchor',    // Required for recipe
  'optional',  // Nice to have
  'assumed',   // Common pantry items (salt, pepper, oil)
])

// How recipe was added to user's collection
export const recipeSourceEnum = pgEnum('recipe_source', [
  'onboarding',  // Selected during initial setup
  'added',       // Manually added later
  'other',       // External import or API
])
```

**Relationships**: Referenced by multiple tables
**Validation**: Enforced at database level, typed in TypeScript

---

### Ingredients (`src/db/schema/ingredients.ts`)

```typescript
import { pgTable, uuid, text, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { ingredientCategoryEnum } from './enums'

// Canonical ingredient catalog (system-defined)
export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: ingredientCategoryEnum('category').notNull(),
  isAssumed: boolean('is_assumed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index('idx_ingredients_category').on(table.category),
  assumedIdx: index('idx_ingredients_is_assumed').on(table.isAssumed),
}))

// Voice recognition aliases (cilantro → coriander)
export const ingredientAliases = pgTable('ingredient_aliases', {
  id: uuid('id').primaryKey().defaultRandom(),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'cascade' }),
  alias: text('alias').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  aliasIdx: index('idx_ingredient_aliases_alias').on(table.alias),
  ingredientIdx: index('idx_ingredient_aliases_ingredient').on(table.ingredientId),
}))

// Relations for type-safe joins
export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  aliases: many(ingredientAliases),
  recipeIngredients: many(recipeIngredients), // Circular import resolved by Drizzle
  userInventory: many(userInventory),
}))

export const ingredientAliasesRelations = relations(ingredientAliases, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [ingredientAliases.ingredientId],
    references: [ingredients.id],
  }),
}))
```

**Fields**:
- `id`: UUID primary key
- `name`: Unique canonical ingredient name
- `category`: Enum for meal planning categorization
- `isAssumed`: True for common pantry items (salt, oil)
- `createdAt`: Timestamp for audit trail

**Relationships**:
- One ingredient → many aliases
- One ingredient → many recipe_ingredients entries
- One ingredient → many user_inventory entries

**Validation**:
- Name uniqueness enforced at DB level
- Category must be valid enum value
- Indexes on category + isAssumed for filtering queries

---

### Recipes (`src/db/schema/recipes.ts`)

```typescript
import { pgTable, uuid, text, boolean, timestamp, check, index } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { ingredientTypeEnum } from './enums'
import { ingredients } from './ingredients'

// Recipes (seeded system recipes + user-created)
export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  isSeeded: boolean('is_seeded').notNull().default(false),
  userId: uuid('user_id').references(() => sql`auth.users(id)`, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Seeded recipes have no user_id, user recipes must have user_id
  ownershipCheck: check(
    'recipe_ownership',
    sql`(${table.isSeeded} = true AND ${table.userId} IS NULL) OR (${table.isSeeded} = false AND ${table.userId} IS NOT NULL)`
  ),
}))

// Recipe-Ingredient junction (anchor/optional/assumed)
export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'restrict' }),
  ingredientType: ingredientTypeEnum('ingredient_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Unique constraint: recipe + ingredient combo
  uniqueRecipeIngredient: index('idx_recipe_ingredients_unique').on(table.recipeId, table.ingredientId).unique(),
  recipeIdx: index('idx_recipe_ingredients_recipe').on(table.recipeId),
  ingredientIdx: index('idx_recipe_ingredients_ingredient').on(table.ingredientId),
  typeIdx: index('idx_recipe_ingredients_type').on(table.ingredientType),
}))

// Relations for type-safe joins
export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  userRecipes: many(userRecipes),
  cookingLogs: many(cookingLog),
}))

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))
```

**Fields (recipes)**:
- `id`: UUID primary key
- `name`: Recipe display name
- `description`: Optional recipe summary
- `isSeeded`: True for system-provided recipes
- `userId`: Owner (null for seeded recipes)
- `createdAt/updatedAt`: Audit timestamps

**Fields (recipe_ingredients)**:
- `recipeId`: FK to recipes
- `ingredientId`: FK to ingredients
- `ingredientType`: anchor/optional/assumed classification

**Relationships**:
- One recipe → many recipe_ingredients
- One ingredient → many recipe_ingredients
- One recipe → many user_recipes (who saved it)

**Validation**:
- Ownership check: seeded recipes have no user, user recipes require user
- Unique recipe+ingredient combination
- ON DELETE RESTRICT for ingredients (prevent deletion if used in recipes)

---

### User Inventory (`src/db/schema/user-inventory.ts`)

```typescript
import { pgTable, uuid, integer, timestamp, check, index } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { ingredients } from './ingredients'

// User's current inventory with quantity levels
export const userInventory = pgTable('user_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => sql`auth.users(id)`, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'restrict' }),
  quantityLevel: integer('quantity_level').notNull().default(3),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Quantity must be 0-3 (out of stock, low, medium, high)
  quantityCheck: check('quantity_level_check', sql`${table.quantityLevel} BETWEEN 0 AND 3`),
  // Unique constraint: one entry per user+ingredient
  uniqueUserIngredient: index('idx_user_inventory_unique').on(table.userId, table.ingredientId).unique(),
  userIdx: index('idx_user_inventory_user').on(table.userId),
  quantityIdx: index('idx_user_inventory_quantity').on(table.userId, table.quantityLevel).where(sql`${table.quantityLevel} > 0`),
  // Covering index for recipe matching queries
  matchingIdx: index('idx_user_inventory_matching').on(table.userId, table.ingredientId, table.quantityLevel).where(sql`${table.quantityLevel} > 0`),
}))

export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [userInventory.ingredientId],
    references: [ingredients.id],
  }),
}))
```

**Fields**:
- `userId`: FK to auth.users (Supabase Auth)
- `ingredientId`: FK to ingredients
- `quantityLevel`: 0 (out), 1 (low), 2 (medium), 3 (high)
- `updatedAt`: Last modification timestamp

**Relationships**:
- One user → many inventory entries
- One ingredient → many inventory entries (across users)

**Validation**:
- Quantity must be 0-3
- Unique user+ingredient combination
- RLS: users only see their own inventory

**Indexes**:
- Covering index for Tier 1 recipe matching (user, ingredient, quantity > 0)

---

### User Recipes (`src/db/schema/user-recipes.ts`)

```typescript
import { pgTable, uuid, timestamp, index } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { recipeSourceEnum } from './enums'
import { recipes } from './recipes'

// User's recipe collection (selected/added)
export const userRecipes = pgTable('user_recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => sql`auth.users(id)`, { onDelete: 'cascade' }),
  recipeId: uuid('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  source: recipeSourceEnum('source').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Unique constraint: user can't save same recipe twice
  uniqueUserRecipe: index('idx_user_recipes_unique').on(table.userId, table.recipeId).unique(),
  userIdx: index('idx_user_recipes_user').on(table.userId),
}))

export const userRecipesRelations = relations(userRecipes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [userRecipes.recipeId],
    references: [recipes.id],
  }),
}))
```

**Fields**:
- `userId`: FK to auth.users
- `recipeId`: FK to recipes
- `source`: How recipe was added (onboarding/added/other)
- `createdAt`: When recipe was saved

**Relationships**:
- One user → many user_recipes
- One recipe → many user_recipes (multiple users can save same recipe)

**Validation**:
- Unique user+recipe combination
- RLS: users only see their own saved recipes

---

### Cooking Log (`src/db/schema/cooking-log.ts`)

```typescript
import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { recipes } from './recipes'

// Cooking history log with recipe name snapshot
export const cookingLog = pgTable('cooking_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => sql`auth.users(id)`, { onDelete: 'cascade' }),
  recipeId: uuid('recipe_id').references(() => recipes.id, { onDelete: 'set null' }), // Nullable to preserve history
  recipeName: text('recipe_name').notNull(), // Denormalized snapshot, survives recipe deletion
  cookedAt: timestamp('cooked_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index('idx_cooking_log_user').on(table.userId),
  userDateIdx: index('idx_cooking_log_user_date').on(table.userId, sql`${table.cookedAt} DESC`),
}))

export const cookingLogRelations = relations(cookingLog, ({ one }) => ({
  recipe: one(recipes, {
    fields: [cookingLog.recipeId],
    references: [recipes.id],
  }),
}))
```

**Fields**:
- `userId`: FK to auth.users
- `recipeId`: FK to recipes (nullable, SET NULL on delete)
- `recipeName`: Denormalized snapshot (preserves history if recipe deleted)
- `cookedAt`: When recipe was cooked

**Relationships**:
- One user → many cooking log entries
- One recipe → many cooking log entries

**Validation**:
- RLS: users only see their own cooking history
- Recipe name preserved even if recipe deleted (null recipeId)

**Indexes**:
- User + cookedAt DESC for recent cooking history queries

---

### Unrecognized Items (`src/db/schema/unrecognized-items.ts`)

```typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Voice extraction unknowns for later review/addition
export const unrecognizedItems = pgTable('unrecognized_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => sql`auth.users(id)`, { onDelete: 'cascade' }),
  rawText: text('raw_text').notNull(),
  context: text('context'), // 'fridge_scan', 'pantry_scan', 'add', 'remove'
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
```

**Fields**:
- `userId`: FK to auth.users
- `rawText`: Unmatched voice input
- `context`: Where item was scanned/added
- `resolvedAt`: When mapped to ingredient (nullable)
- `createdAt`: When first captured

**Relationships**:
- One user → many unrecognized items

**Validation**:
- RLS: users only see their own unrecognized items

**Usage**:
- Store voice recognition failures for later manual mapping
- Helps improve ingredient catalog over time

---

## Drizzle Client Configuration

### Database Client (`src/db/client.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Admin client (bypasses RLS) - use sparingly
const adminClient = postgres(process.env.DATABASE_URL!, { prepare: false })
export const adminDb = drizzle({ client: adminClient, schema })

// RLS-aware client factory
export function createUserDb(params: { accessToken: string }) {
  const userClient = postgres(process.env.DATABASE_URL!, {
    prepare: false,
    onconnect: async (connection) => {
      await connection.query(`
        SELECT set_config('request.jwt.claims', '${params.accessToken}', true);
        SELECT set_config('role', 'authenticated', true);
      `)
    }
  })
  return drizzle({ client: userClient, schema })
}

// Type exports for query results
export type Ingredient = typeof schema.ingredients.$inferSelect
export type NewIngredient = typeof schema.ingredients.$inferInsert
export type Recipe = typeof schema.recipes.$inferSelect
export type NewRecipe = typeof schema.recipes.$inferInsert
// ... (export types for all entities)
```

---

## RLS Policies (PostgreSQL, managed via Supabase)

**Note**: Drizzle supports RLS with `pgPolicy`, but existing Supabase RLS policies remain unchanged for now. Future: migrate to Drizzle RLS definitions.

**Current RLS Policies** (from `.wip/db-model.md`):
- `user_inventory`: users see only their own entries
- `user_recipes`: users see only their own saved recipes
- `cooking_log`: users see only their own cooking history
- `unrecognized_items`: users see only their own unrecognized items
- `recipes`: users see seeded recipes + their own custom recipes

**Enforcement**: Via dual client pattern (admin bypasses RLS, user client respects RLS)

---

## Key Queries (Drizzle ORM)

### Tier 1 Recipes (All Anchors Present)

```typescript
import { eq, notInArray, sql } from 'drizzle-orm'
import { createUserDb } from '@/db/client'
import { recipes, userRecipes, recipeIngredients, userInventory } from '@/db/schema'

export async function getTier1Recipes(params: { userId: string, accessToken: string }) {
  const db = createUserDb({ accessToken: params.accessToken })

  // Subquery: ingredient IDs user has in stock
  const inStockIngredients = db
    .select({ ingredientId: userInventory.ingredientId })
    .from(userInventory)
    .where(sql`${userInventory.userId} = ${params.userId} AND ${userInventory.quantityLevel} > 0`)

  // Subquery: recipes with missing anchors
  const recipesWithMissingAnchors = db
    .selectDistinct({ recipeId: recipeIngredients.recipeId })
    .from(recipeIngredients)
    .where(
      sql`${recipeIngredients.ingredientType} = 'anchor' AND ${recipeIngredients.ingredientId} NOT IN ${inStockIngredients}`
    )

  // Main query: recipes without missing anchors
  return db
    .select()
    .from(recipes)
    .innerJoin(userRecipes, eq(recipes.id, userRecipes.recipeId))
    .where(
      sql`${userRecipes.userId} = ${params.userId} AND ${recipes.id} NOT IN ${recipesWithMissingAnchors}`
    )
}
```

### Add to Inventory (with automatic trigger update)

```typescript
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'

export async function upsertInventory(params: {
  userId: string
  accessToken: string
  ingredientId: string
  quantityLevel: number
}) {
  const db = createUserDb({ accessToken: params.accessToken })

  await db
    .insert(userInventory)
    .values({
      userId: params.userId,
      ingredientId: params.ingredientId,
      quantityLevel: params.quantityLevel,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userInventory.userId, userInventory.ingredientId],
      set: {
        quantityLevel: params.quantityLevel,
        updatedAt: new Date(),
      },
    })
}
```

---

## Migration Strategy

**Decision** (from `research.md`): Generate Drizzle migrations → output to `supabase/migrations/`

**Workflow**:
1. **Initial Setup**: Introspect existing Supabase schema
   ```bash
   drizzle-kit introspect
   ```

2. **Schema Changes**: Modify Drizzle schema files

3. **Generate Migration**:
   ```bash
   drizzle-kit generate
   ```
   Output: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`

4. **Review SQL**: Manually inspect generated migration

5. **Apply**:
   ```bash
   # Local
   supabase db push

   # Production
   supabase db push --project-ref <project-id>
   ```

**Configuration** (`drizzle.config.ts`):
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

---

## Testing Strategy

### Schema Tests (`tests/db/schema.test.ts`)

```typescript
import { describe, it, expect } from 'vitest'
import { adminDb } from '@/db/client'
import { ingredients } from '@/db/schema'

describe('Drizzle Schema', () => {
  it('should query ingredients with correct types', async () => {
    const allIngredients = await adminDb.select().from(ingredients)

    expect(allIngredients[0]).toHaveProperty('id')
    expect(allIngredients[0]).toHaveProperty('name')
    expect(allIngredients[0].category).toMatch(/meat|proteins_nonmeat|legumes|vegetables|starches|dairy|canned_jarred/)
  })
})
```

### RLS Tests (`tests/integration/auth-flow.test.ts`)

```typescript
import { describe, it, expect } from 'vitest'
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'

describe('RLS Policies', () => {
  it('should enforce user inventory RLS', async () => {
    const user1Db = createUserDb({ accessToken: 'user1_token' })
    const user2Db = createUserDb({ accessToken: 'user2_token' })

    // User 1 adds inventory
    await user1Db.insert(userInventory).values({ userId: 'user1_id', ingredientId: 'ing_id', quantityLevel: 3 })

    // User 2 should not see user 1's inventory
    const user2Inventory = await user2Db.select().from(userInventory)
    expect(user2Inventory).not.toContainEqual(expect.objectContaining({ userId: 'user1_id' }))
  })
})
```

---

## Extensibility

**Future Schema Additions** (from `.wip/db-model.md` v2 roadmap):
- Shopping lists (shopping_lists, shopping_list_items)
- Meal planning (meal_plans, meal_plan_entries)
- Nutrition data (nutrition_data)
- Dietary restrictions (dietary_tags, recipe_dietary_tags)
- Ingredient substitutions (ingredient_substitutions)

**Approach**: Add schema files incrementally, generate migrations with `drizzle-kit generate`

---

## Summary

| Entity | Purpose | Key Relationships | RLS Enforced |
|--------|---------|-------------------|--------------|
| **ingredients** | Canonical ingredient catalog | → aliases, recipe_ingredients, user_inventory | No (public read) |
| **ingredient_aliases** | Voice recognition synonyms | → ingredients | No (public read) |
| **recipes** | System + user recipes | → recipe_ingredients, user_recipes, cooking_log | Yes (user-scoped) |
| **recipe_ingredients** | Recipe composition | → recipes, ingredients | No (via recipe RLS) |
| **user_inventory** | User's current stock | → ingredients | Yes (user-only) |
| **user_recipes** | Saved recipe collection | → recipes | Yes (user-only) |
| **cooking_log** | Cooking history | → recipes (nullable) | Yes (user-only) |
| **unrecognized_items** | Voice extraction failures | None | Yes (user-only) |

**Type Safety**: 100% - all queries validated at compile time via Drizzle inference
**RLS Support**: Dual client pattern with JWT token passing for auth context
**Migration Strategy**: Drizzle Kit → `supabase/migrations/` → manual review → apply
