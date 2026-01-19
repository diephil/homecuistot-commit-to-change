# Database Client API Contract

**Date**: 2026-01-19
**Version**: 1.0
**Phase**: 1 (Design)

## Overview

Drizzle database client API for HomeCuistot meal planning app. Defines client initialization, RLS enforcement, and query patterns.

---

## Client Types

### Admin Client (`adminDb`)

**Purpose**: Administrative operations bypassing RLS
**Use Cases**: Migrations, seed data, system operations, admin dashboards
**Security**: Server-only, never expose to client

```typescript
import { adminDb } from '@/db/client'

// Type-safe admin operations
const allUsers = await adminDb.select().from(users)
```

**Restrictions**:
- NEVER use in API routes handling user requests
- NEVER use in Server Actions called from client
- ONLY use in:
  - Migration scripts
  - Seed data scripts
  - Admin-only API routes (with separate auth check)
  - Background jobs

---

### User Client (`createUserDb()`)

**Purpose**: User-scoped operations respecting RLS
**Use Cases**: All user-facing features
**Security**: Requires valid Supabase session token

```typescript
import { createUserDb } from '@/db/client'
import { createClient } from '@/utils/supabase/server'

// Server Action example
export async function myAction() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const db = createUserDb({ accessToken: session.access_token })

  // Queries automatically filtered by RLS
  const myInventory = await db.select().from(userInventory)
}
```

**Requirements**:
- MUST validate session before creating client
- MUST pass `accessToken` from Supabase session
- Client automatically sets PostgreSQL session variables:
  - `request.jwt.claims`: JWT token for `auth.uid()` in RLS
  - `role`: Set to `authenticated`

---

## API Methods

### Client Initialization

#### `adminDb: DrizzleClient`

**Signature**:
```typescript
export const adminDb: ReturnType<typeof drizzle>
```

**Returns**: Singleton Drizzle client with admin privileges

**Example**:
```typescript
import { adminDb } from '@/db/client'
import { ingredients } from '@/db/schema'

const allIngredients = await adminDb.select().from(ingredients)
```

---

#### `createUserDb(params: { accessToken: string }): DrizzleClient`

**Parameters**:
- `accessToken`: JWT token from Supabase session

**Returns**: Drizzle client with RLS enforcement

**Example**:
```typescript
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'

const db = createUserDb({ accessToken: session.access_token })
const inventory = await db.select().from(userInventory)
// Automatically filtered to current user via RLS
```

**Error Handling**:
```typescript
try {
  const db = createUserDb({ accessToken: invalidToken })
  await db.select().from(userInventory)
} catch (error) {
  // Database connection error or auth failure
  console.error('DB Error:', error)
}
```

---

## Query Patterns

### CRUD Operations

#### Select (Read)

```typescript
import { eq, and, gt } from 'drizzle-orm'
import { userInventory } from '@/db/schema'

// Select all
const all = await db.select().from(userInventory)

// Select with where clause
const inStock = await db
  .select()
  .from(userInventory)
  .where(gt(userInventory.quantityLevel, 0))

// Select with joins
const inventoryWithIngredients = await db
  .select({
    id: userInventory.id,
    quantity: userInventory.quantityLevel,
    ingredientName: ingredients.name,
  })
  .from(userInventory)
  .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
```

---

#### Insert (Create)

```typescript
import { userInventory } from '@/db/schema'

// Single insert
const [newEntry] = await db
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

// Upsert (insert or update)
await db
  .insert(userInventory)
  .values({ userId: 'user-uuid', ingredientId: 'ing-uuid', quantityLevel: 3 })
  .onConflictDoUpdate({
    target: [userInventory.userId, userInventory.ingredientId],
    set: { quantityLevel: 3, updatedAt: new Date() },
  })
```

---

#### Update

```typescript
import { eq, and } from 'drizzle-orm'
import { userInventory } from '@/db/schema'

// Update with where clause
await db
  .update(userInventory)
  .set({ quantityLevel: 2, updatedAt: new Date() })
  .where(
    and(
      eq(userInventory.userId, 'user-uuid'),
      eq(userInventory.ingredientId, 'ingredient-uuid')
    )
  )

// Update with returning
const [updated] = await db
  .update(userInventory)
  .set({ quantityLevel: 0 })
  .where(eq(userInventory.id, 'entry-uuid'))
  .returning()
```

---

#### Delete

```typescript
import { eq, lt } from 'drizzle-orm'
import { userInventory } from '@/db/schema'

// Delete with where clause
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

---

### Complex Queries

#### Joins

```typescript
import { eq } from 'drizzle-orm'
import { recipes, recipeIngredients, ingredients } from '@/db/schema'

// Recipe with ingredients
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

---

#### Aggregations

```typescript
import { count, eq, sql } from 'drizzle-orm'
import { recipeIngredients, userInventory } from '@/db/schema'

// Count recipes by user
const recipeCounts = await db
  .select({
    userId: userRecipes.userId,
    recipeCount: count(userRecipes.id),
  })
  .from(userRecipes)
  .groupBy(userRecipes.userId)

// Average quantity level
const avgQuantity = await db
  .select({
    avgLevel: sql<number>`AVG(${userInventory.quantityLevel})`,
  })
  .from(userInventory)
  .where(eq(userInventory.userId, 'user-uuid'))
```

---

#### Subqueries

```typescript
import { inArray, sql } from 'drizzle-orm'
import { recipes, recipeIngredients, userInventory } from '@/db/schema'

// Recipes user can make (Tier 1)
const inStockIngredients = db
  .select({ id: userInventory.ingredientId })
  .from(userInventory)
  .where(sql`${userInventory.userId} = 'user-uuid' AND ${userInventory.quantityLevel} > 0`)

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

---

### Transactions

```typescript
import { db } from '@/db/client'
import { userInventory, cookingLog } from '@/db/schema'

await db.transaction(async (tx) => {
  // Log cooking event
  await tx.insert(cookingLog).values({
    userId: 'user-uuid',
    recipeId: 'recipe-uuid',
    recipeName: 'Pasta Carbonara',
  })

  // Decrement inventory
  await tx
    .update(userInventory)
    .set({ quantityLevel: sql`${userInventory.quantityLevel} - 1` })
    .where(
      and(
        eq(userInventory.userId, 'user-uuid'),
        inArray(userInventory.ingredientId, ['ing1', 'ing2', 'ing3'])
      )
    )
})
```

---

## Type Inference

### Inferred Types

```typescript
import { ingredients, recipes } from '@/db/schema'

// Select type (with all columns)
type Ingredient = typeof ingredients.$inferSelect
// { id: string, name: string, category: 'meat' | 'vegetables' | ..., isAssumed: boolean, createdAt: Date }

// Insert type (required fields only, omits defaults)
type NewIngredient = typeof ingredients.$inferInsert
// { id?: string, name: string, category: 'meat' | ..., isAssumed?: boolean, createdAt?: Date }

// Query result type
const result = await db.select({
  id: ingredients.id,
  name: ingredients.name,
}).from(ingredients)
type QueryResult = typeof result[0]
// { id: string, name: string }
```

---

### Custom Type Exports

```typescript
// src/db/client.ts
export type Ingredient = typeof ingredients.$inferSelect
export type NewIngredient = typeof ingredients.$inferInsert
export type Recipe = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert
export type UserInventory = typeof userInventory.$inferSelect
export type NewUserInventory = typeof userInventory.$inferInsert
// ... (all entities)

// Usage
import type { Ingredient, UserInventory } from '@/db/client'

function processIngredient(ing: Ingredient) {
  console.log(ing.name, ing.category)
}
```

---

## Error Handling

### Database Errors

```typescript
import { DatabaseError } from 'pg'

try {
  await db.insert(userInventory).values({
    userId: 'user-uuid',
    ingredientId: 'invalid-uuid', // Foreign key constraint
    quantityLevel: 3,
  })
} catch (error) {
  if (error instanceof DatabaseError) {
    if (error.code === '23503') {
      // Foreign key violation
      throw new Error('Invalid ingredient ID')
    }
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Inventory entry already exists')
    }
  }
  throw error
}
```

**Common PostgreSQL Error Codes**:
- `23503`: Foreign key violation
- `23505`: Unique constraint violation
- `23514`: Check constraint violation
- `42P01`: Undefined table
- `42703`: Undefined column

---

### RLS Errors

```typescript
try {
  const db = createUserDb({ accessToken: expiredToken })
  await db.select().from(userInventory)
} catch (error) {
  // Auth failure or RLS policy rejection
  console.error('RLS Error:', error)
  throw new Error('Unauthorized access')
}
```

**Symptoms**:
- Empty result sets when data exists (RLS filtered all rows)
- Connection errors with invalid tokens
- Permission denied errors for write operations

---

## Performance Considerations

### Connection Pooling

**Configuration** (from `research.md`):
- Use Transaction pooler: `DATABASE_URL` with `?pgbouncer=true`
- Disable prepared statements: `prepare: false`
- Pool size: 1 for serverless clients

```typescript
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Critical for Transaction pooler
})
```

---

### Query Optimization

**Use Indexes**:
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
  )
```

**Batch Inserts**:
```typescript
// Good: Single insert with array
await db.insert(userInventory).values([
  { userId: 'user-uuid', ingredientId: 'ing1', quantityLevel: 3 },
  { userId: 'user-uuid', ingredientId: 'ing2', quantityLevel: 2 },
])

// Bad: Multiple individual inserts
for (const item of items) {
  await db.insert(userInventory).values(item) // N queries instead of 1
}
```

**Select Only Needed Columns**:
```typescript
// Good: Select specific columns
const names = await db
  .select({ name: ingredients.name })
  .from(ingredients)

// Bad: Select all columns when only name needed
const all = await db.select().from(ingredients) // Transfers unnecessary data
```

---

## Security Best Practices

### 1. Always Validate Sessions

```typescript
// ✅ Correct
export async function updateInventory() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const db = createUserDb({ accessToken: session.access_token })
  // ... safe to query
}

// ❌ Wrong
export async function updateInventory() {
  const db = adminDb // Bypasses RLS!
  // ... anyone can access any data
}
```

---

### 2. Never Expose Admin Client

```typescript
// ✅ Correct: Admin client in server-only script
// scripts/seed-data.ts
import { adminDb } from '@/db/client'

await adminDb.insert(ingredients).values(seedIngredients)

// ❌ Wrong: Admin client in API route
// app/api/inventory/route.ts
import { adminDb } from '@/db/client'

export async function GET() {
  return adminDb.select().from(userInventory) // All users' data exposed!
}
```

---

### 3. Sanitize User Input

```typescript
import { like, sql } from 'drizzle-orm'

// ✅ Correct: Parameterized query
const searchTerm = userInput
const results = await db
  .select()
  .from(ingredients)
  .where(like(ingredients.name, `%${searchTerm}%`))

// ❌ Wrong: SQL injection risk
const results = await db.execute(
  sql`SELECT * FROM ingredients WHERE name LIKE '%${userInput}%'`
)
```

---

### 4. Use Transactions for Multi-Step Operations

```typescript
// ✅ Correct: Atomic operation
await db.transaction(async (tx) => {
  await tx.insert(cookingLog).values({ ... })
  await tx.update(userInventory).set({ ... })
})

// ❌ Wrong: Partial failure possible
await db.insert(cookingLog).values({ ... })
await db.update(userInventory).set({ ... }) // Fails, cooking logged but inventory unchanged
```

---

## Integration with Next.js

### Server Components

```typescript
// app/(protected)/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const db = createUserDb({ accessToken: session.access_token })
  const inventory = await db.select().from(userInventory)

  return <div>{inventory.map(item => <div key={item.id}>{item.quantity}</div>)}</div>
}
```

---

### Server Actions

```typescript
// app/actions/inventory.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'

export async function updateInventoryQuantity(ingredientId: string, quantity: number) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const db = createUserDb({ accessToken: session.access_token })

  await db
    .update(userInventory)
    .set({ quantityLevel: quantity, updatedAt: new Date() })
    .where(
      and(
        eq(userInventory.userId, session.user.id),
        eq(userInventory.ingredientId, ingredientId)
      )
    )

  revalidatePath('/dashboard')
}
```

---

### API Routes

```typescript
// app/api/inventory/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createUserDb({ accessToken: session.access_token })
  const inventory = await db.select().from(userInventory)

  return NextResponse.json({ inventory })
}
```

---

## Environment Variables

**Required**:
```bash
# Transaction pooler (for app queries)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (for migrations)
DATABASE_URL_DIRECT="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

**Local Development**:
```bash
# Local Supabase (Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
```

---

## Summary

| Feature | Admin Client | User Client |
|---------|-------------|-------------|
| **Usage** | Migrations, seeds, admin ops | All user-facing features |
| **RLS** | Bypassed | Enforced via JWT token |
| **Auth** | None required | Requires valid session |
| **Access** | All data | User-scoped only |
| **Security** | Server-only scripts | API routes, Server Actions, Components |
| **Connection** | Singleton | Factory (new client per request) |

**Key Principles**:
1. Always validate session before creating user client
2. Never expose admin client in user-facing code
3. Use transactions for multi-step operations
4. Select only needed columns for performance
5. Leverage RLS for automatic data filtering
