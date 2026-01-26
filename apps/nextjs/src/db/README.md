# Database Layer Documentation

Drizzle ORM integration with Supabase PostgreSQL for HomeCuistot meal planning app.

## Quick Start

```typescript
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'

// In Server Component, Server Action, or API Route
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/login')

const db = createUserDb({ accessToken: session.access_token })
const inventory = await db.select().from(userInventory)
```

## Common Query Patterns

### Basic CRUD Operations

#### SELECT (Read)

```typescript
import { eq, gt, and } from 'drizzle-orm'
import { userInventory, ingredients } from '@/db/schema'

// Select all
const all = await db.select().from(userInventory)

// Select with WHERE clause
const inStock = await db
  .select()
  .from(userInventory)
  .where(gt(userInventory.quantityLevel, 0))

// Select specific columns
const names = await db
  .select({
    id: ingredients.id,
    name: ingredients.name,
  })
  .from(ingredients)
```

#### INSERT (Create)

```typescript
// Single insert
const [newItem] = await db
  .insert(userInventory)
  .values({
    userId: 'user-uuid',
    ingredientId: 'ingredient-uuid',
    quantityLevel: 3,
  })
  .returning()

// Bulk insert
await db.insert(userInventory).values([
  { userId: 'user-uuid', ingredientId: 'ing1', quantityLevel: 3 },
  { userId: 'user-uuid', ingredientId: 'ing2', quantityLevel: 2 },
])

// Upsert (insert or update on conflict)
await db
  .insert(userInventory)
  .values({
    userId: 'user-uuid',
    ingredientId: 'ing-uuid',
    quantityLevel: 3,
  })
  .onConflictDoUpdate({
    target: [userInventory.userId, userInventory.ingredientId],
    set: { quantityLevel: 3, updatedAt: new Date() },
  })
```

#### UPDATE

```typescript
// Update with WHERE
await db
  .update(userInventory)
  .set({
    quantityLevel: 2,
    updatedAt: new Date(),
  })
  .where(eq(userInventory.id, 'entry-uuid'))

// Update with returning
const [updated] = await db
  .update(userInventory)
  .set({ quantityLevel: 0 })
  .where(eq(userInventory.id, 'entry-uuid'))
  .returning()
```

#### DELETE

```typescript
// Delete with WHERE
await db
  .delete(userInventory)
  .where(
    and(
      eq(userInventory.userId, 'user-uuid'),
      eq(userInventory.quantityLevel, 0)
    )
  )

// Delete with returning (for audit)
const [deleted] = await db
  .delete(userInventory)
  .where(eq(userInventory.id, 'entry-uuid'))
  .returning()
```

### Joins

```typescript
import { eq } from 'drizzle-orm'
import { userInventory, ingredients, recipes, recipeIngredients } from '@/db/schema'

// Simple join
const inventoryWithIngredients = await db
  .select({
    id: userInventory.id,
    quantity: userInventory.quantityLevel,
    ingredientName: ingredients.name,
    category: ingredients.category,
  })
  .from(userInventory)
  .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))

// Multi-table join
const recipeDetails = await db
  .select({
    recipeId: recipes.id,
    recipeName: recipes.name,
    ingredientName: ingredients.name,
    ingredientType: recipeIngredients.ingredientType,
  })
  .from(recipes)
  .innerJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
  .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
  .where(eq(recipes.id, 'recipe-uuid'))
```

### Aggregations

```typescript
import { count, avg, sql } from 'drizzle-orm'
import { userRecipes, userInventory } from '@/db/schema'

// Count
const recipeCounts = await db
  .select({
    userId: userRecipes.userId,
    recipeCount: count(userRecipes.id),
  })
  .from(userRecipes)
  .groupBy(userRecipes.userId)

// Average
const avgQuantity = await db
  .select({
    avgLevel: avg(userInventory.quantityLevel),
  })
  .from(userInventory)
  .where(eq(userInventory.userId, 'user-uuid'))

// Custom SQL aggregation
const stats = await db
  .select({
    total: count(userInventory.id),
    avgQuantity: sql<number>`AVG(${userInventory.quantityLevel})`,
    maxQuantity: sql<number>`MAX(${userInventory.quantityLevel})`,
  })
  .from(userInventory)
```

### Transactions

```typescript
import { cookingLog, userInventory } from '@/db/schema'

// Atomic multi-step operation
await db.transaction(async (tx) => {
  // 1. Log cooking event
  await tx.insert(cookingLog).values({
    userId: 'user-uuid',
    recipeId: 'recipe-uuid',
    recipeName: 'Pasta Carbonara',
  })

  // 2. Decrement inventory
  await tx
    .update(userInventory)
    .set({
      quantityLevel: sql`${userInventory.quantityLevel} - 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userInventory.userId, 'user-uuid'),
        eq(userInventory.ingredientId, 'ingredient-uuid')
      )
    )
})

// Transaction with error handling
try {
  await db.transaction(async (tx) => {
    // Operations
  })
} catch (error) {
  console.error('Transaction failed, rolled back:', error)
}
```

### Subqueries

```typescript
import { inArray, notInArray, sql } from 'drizzle-orm'
import { recipes, recipeIngredients, userInventory } from '@/db/schema'

// Recipes user can make (Tier 1)
const inStockIngredients = db
  .select({ id: userInventory.ingredientId })
  .from(userInventory)
  .where(
    and(
      eq(userInventory.userId, 'user-uuid'),
      gt(userInventory.quantityLevel, 0)
    )
  )

const availableRecipes = await db
  .select()
  .from(recipes)
  .where(
    sql`NOT EXISTS (
      SELECT 1 FROM ${recipeIngredients}
      WHERE ${recipeIngredients.recipeId} = ${recipes.id}
        AND ${recipeIngredients.ingredientType} = 'anchor'
        AND ${recipeIngredients.ingredientId} NOT IN ${inStockIngredients}
    )`
  )
```

## RLS (Row Level Security) Usage

### When to Use User Client vs Admin Client

#### User Client (`createUserDb`) - RLS Enforced

Use for ALL user-facing operations:

```typescript
// ✅ Server Component
export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const db = createUserDb({ accessToken: session.access_token })
  const inventory = await db.select().from(userInventory)
  // Automatically filtered to current user
}

// ✅ Server Action
'use server'
export async function updateInventory(ingredientId: string, quantity: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const db = createUserDb({ accessToken: session.access_token })
  await db.update(userInventory).set({ quantityLevel: quantity })
  // RLS ensures user can only update their own data
}

// ✅ API Route
export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createUserDb({ accessToken: session.access_token })
  const data = await db.select().from(userInventory)
  return NextResponse.json({ data })
}
```

#### Admin Client (`adminDb`) - RLS Bypassed

Use ONLY for:
- Migration scripts
- Seed data scripts
- Background jobs
- System operations

```typescript
// ✅ Seed script
import { adminDb } from '@/db/client'

async function seedIngredients() {
  await adminDb.insert(ingredients).values([
    { name: 'Chicken', category: 'meat' },
    { name: 'Onion', category: 'vegetables' },
  ])
}

// ❌ NEVER in user-facing code
export async function GET() {
  const db = adminDb // WRONG: Bypasses RLS, exposes all users' data!
  return NextResponse.json(await db.select().from(userInventory))
}
```

### RLS Policy Examples

Current RLS policies (managed via Supabase dashboard or migrations):

```sql
-- user_inventory: Users see only their own entries
CREATE POLICY "Users can only see their own inventory"
ON user_inventory FOR SELECT
USING (auth.uid()::text = user_id);

-- recipes: Users see seeded recipes + their own custom recipes
CREATE POLICY "Users can see public and own recipes"
ON recipes FOR SELECT
USING (
  is_seeded = true OR
  user_id = auth.uid()::text
);

-- user_recipes: Users see only their saved recipes
CREATE POLICY "Users can only see their own saved recipes"
ON user_recipes FOR SELECT
USING (auth.uid()::text = user_id);
```

### Testing RLS

```typescript
import { describe, it, expect } from 'vitest'
import { createUserDb, adminDb } from '@/db/client'
import { userInventory } from '@/db/schema'

describe('RLS Tests', () => {
  it('should enforce user isolation', async () => {
    // Setup: Admin adds data for user1
    await adminDb.insert(userInventory).values({
      userId: 'user1-uuid',
      ingredientId: 'ing-uuid',
      quantityLevel: 3,
    })

    // User2 client should not see user1's data
    const user2Db = createUserDb({ accessToken: 'user2-token' })
    const user2Inventory = await user2Db.select().from(userInventory)

    expect(user2Inventory).not.toContainEqual(
      expect.objectContaining({ userId: 'user1-uuid' })
    )
  })
})
```

## Type Safety

### Inferred Types

```typescript
import { ingredients, recipes } from '@/db/schema'

// Select type (all columns)
type Ingredient = typeof ingredients.$inferSelect
// { id: string, name: string, category: 'meat' | 'vegetables' | ..., createdAt: Date }

// Insert type (required fields only)
type NewIngredient = typeof ingredients.$inferInsert
// { id?: string, name: string, category: 'meat' | ..., createdAt?: Date }

// Query result type
const result = await db.select({
  id: ingredients.id,
  name: ingredients.name,
}).from(ingredients)

type QueryResult = typeof result[0]
// { id: string, name: string }
```

### Exported Types

```typescript
// From @/db/client
import type {
  Ingredient,
  NewIngredient,
  Recipe,
  UserInventory,
} from '@/db/client'

function processIngredient(ing: Ingredient) {
  console.log(ing.name, ing.category)
}
```

## Performance Tips

### 1. Select Only Needed Columns

```typescript
// ✅ Good: Select specific columns
const names = await db
  .select({ name: ingredients.name })
  .from(ingredients)

// ❌ Bad: Select all columns when only name needed
const all = await db.select().from(ingredients)
```

### 2. Use Batch Operations

```typescript
// ✅ Good: Single bulk insert
await db.insert(userInventory).values([
  { userId: 'user', ingredientId: 'ing1', quantityLevel: 3 },
  { userId: 'user', ingredientId: 'ing2', quantityLevel: 2 },
])

// ❌ Bad: Multiple individual inserts
for (const item of items) {
  await db.insert(userInventory).values(item)
}
```

### 3. Leverage Indexes

```typescript
// Covering index exists on (user_id, ingredient_id, quantity_level)
const inStock = await db
  .select()
  .from(userInventory)
  .where(
    and(
      eq(userInventory.userId, 'user-uuid'),
      gt(userInventory.quantityLevel, 0)
    )
  ) // Uses index efficiently
```

### 4. Use Prepared Statements (when possible)

```typescript
// Note: Prepared statements disabled (`prepare: false`) for Supabase Transaction pooler
// For direct connections, prepared statements are auto-cached by postgres-js driver
```

## Error Handling

### Common PostgreSQL Errors

```typescript
import { DatabaseError } from 'pg'

try {
  await db.insert(userInventory).values({ ... })
} catch (error) {
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case '23503': // Foreign key violation
        throw new Error('Invalid ingredient ID')
      case '23505': // Unique constraint violation
        throw new Error('Inventory entry already exists')
      case '23514': // Check constraint violation
        throw new Error('Quantity level must be 0-3')
      default:
        throw error
    }
  }
}
```

### RLS Errors

```typescript
try {
  const db = createUserDb({ accessToken: invalidToken })
  await db.select().from(userInventory)
} catch (error) {
  // Token validation or RLS policy rejection
  console.error('Auth error:', error)
  throw new Error('Unauthorized access')
}
```

## Migration Workflow

### Generate Migration

```bash
# Modify schema files in src/db/schema/
# Then generate migration
pnpm drizzle-kit generate
```

### Review & Apply

```bash
# Review generated SQL
cat supabase/migrations/YYYYMMDDHHMMSS_description.sql

# Apply locally
supabase db push

# Apply to production
supabase db push --project-ref <project-id>
```

## Resources

- **Full Schema Definitions**: `/specs/003-db-ops/data-model.md`
- **API Contract**: `/specs/003-db-ops/contracts/database-client-api.md`
- **Setup Guide**: `/specs/003-db-ops/quickstart.md`
- **Drizzle Docs**: https://orm.drizzle.team
- **Supabase RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
