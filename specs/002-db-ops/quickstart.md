# Drizzle ORM Quickstart Guide

**Date**: 2026-01-19
**Version**: 1.0
**Target**: Next.js 16 + Supabase + Drizzle integration

## Prerequisites

- Existing Supabase project with PostgreSQL database
- Next.js 16+ with App Router
- TypeScript 5+ (strict mode)
- Node.js 18+
- Supabase Auth configured

---

## Installation

### 1. Install Dependencies

```bash
cd apps/nextjs

# Core packages
pnpm add drizzle-orm postgres

# Dev dependencies
pnpm add -D drizzle-kit vitest @vitejs/plugin-react
```

**Package Versions**:
- `drizzle-orm`: Latest (ORM library)
- `postgres`: Latest (`postgres-js` driver for Supabase)
- `drizzle-kit`: Latest (migration generator)
- `vitest`: Latest (testing framework)

---

### 2. Environment Configuration

Create or update `.env.local`:

```bash
# Transaction pooler (for application queries)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (for migrations/admin tasks)
DATABASE_URL_DIRECT="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Existing Supabase vars (keep these)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJ..."
```

**Local Development** (`.env.local`):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
DATABASE_URL_DIRECT="postgresql://postgres:postgres@localhost:54322/postgres"
```

**Getting Connection Strings**:
1. Supabase Dashboard → Project Settings → Database
2. Copy "Connection Pooling" string (Transaction mode) for `DATABASE_URL`
3. Copy "Connection String" (Direct) for `DATABASE_URL_DIRECT`

---

### 3. Drizzle Kit Configuration

Create `drizzle.config.ts` in `apps/nextjs/`:

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './supabase/migrations', // Critical: output to Supabase migrations
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT!, // Use direct connection for migrations
  },
})
```

---

### 4. Vitest Configuration

Create `vitest.config.ts` in `apps/nextjs/`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // Node environment for database tests
  },
})
```

---

## Project Structure

Create directory structure:

```bash
mkdir -p src/db/schema
mkdir -p supabase/migrations
mkdir -p tests/db
mkdir -p tests/integration
```

**Final Structure**:
```
apps/nextjs/
├── src/db/
│   ├── schema/
│   │   ├── index.ts              # Re-export all schemas
│   │   ├── enums.ts              # PostgreSQL enums
│   │   ├── ingredients.ts        # Ingredients + aliases
│   │   ├── recipes.ts            # Recipes + recipe_ingredients
│   │   ├── user-inventory.ts     # User inventory
│   │   ├── user-recipes.ts       # User recipe collection
│   │   ├── cooking-log.ts        # Cooking history
│   │   └── unrecognized-items.ts # Voice extraction unknowns
│   └── client.ts                 # Drizzle client + type exports
├── supabase/migrations/          # Migration files (generated + manual)
├── tests/
│   ├── db/                       # Schema + query tests
│   └── integration/              # RLS + auth flow tests
├── drizzle.config.ts
└── vitest.config.ts
```

---

## Schema Setup

### Step 1: Introspect Existing Database (Optional)

If you have existing Supabase tables:

```bash
pnpm drizzle-kit introspect
```

This generates TypeScript schemas from your current database. Review and customize as needed.

---

### Step 2: Create Schema Files

Example schema (see `data-model.md` for full definitions):

**`src/db/schema/enums.ts`**:
```typescript
import { pgEnum } from 'drizzle-orm/pg-core'

export const ingredientCategoryEnum = pgEnum('ingredient_category', [
  'meat',
  'proteins_nonmeat',
  'legumes',
  'vegetables',
  'starches',
  'dairy',
  'canned_jarred',
])

export const ingredientTypeEnum = pgEnum('ingredient_type', [
  'anchor',
  'optional',
  'assumed',
])

export const recipeSourceEnum = pgEnum('recipe_source', [
  'onboarding',
  'added',
  'other',
])
```

**`src/db/schema/ingredients.ts`**:
```typescript
import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { ingredientCategoryEnum } from './enums'

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
```

**`src/db/schema/index.ts`** (re-exports):
```typescript
export * from './enums'
export * from './ingredients'
export * from './recipes'
export * from './user-inventory'
export * from './user-recipes'
export * from './cooking-log'
export * from './unrecognized-items'
```

---

### Step 3: Create Database Client

**`src/db/client.ts`**:
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

// Type exports
export type Ingredient = typeof schema.ingredients.$inferSelect
export type NewIngredient = typeof schema.ingredients.$inferInsert
export type Recipe = typeof schema.recipes.$inferSelect
export type NewRecipe = typeof schema.recipes.$inferInsert
// ... (export types for all entities)
```

---

## Migration Workflow

### Generate Migration from Schema

```bash
# Generate migration SQL from Drizzle schema
pnpm drizzle-kit generate
```

Output: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`

**Example Generated Migration**:
```sql
-- supabase/migrations/20260119120000_add_ingredients_table.sql
CREATE TYPE "ingredient_category" AS ENUM ('meat', 'proteins_nonmeat', 'legumes', 'vegetables', 'starches', 'dairy', 'canned_jarred');

CREATE TABLE "ingredients" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "category" ingredient_category NOT NULL,
  "is_assumed" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "idx_ingredients_category" ON "ingredients"("category");
CREATE INDEX "idx_ingredients_is_assumed" ON "ingredients"("is_assumed");
```

---

### Review Migration

**CRITICAL**: Always manually review generated SQL before applying!

```bash
cat supabase/migrations/20260119120000_add_ingredients_table.sql
```

Check for:
- Destructive operations (DROP, TRUNCATE)
- Missing RLS policies
- Incorrect data types
- Foreign key constraints

---

### Apply Migration

**Local Development**:
```bash
supabase db push
```

**Production**:
```bash
supabase db push --project-ref <project-id>
```

**Alternative** (using Drizzle directly):
```bash
pnpm drizzle-kit migrate
```

---

### Verify Migration

```bash
# Check applied migrations
supabase db status

# Inspect tables in Supabase Studio
open https://supabase.com/dashboard/project/<project-id>/editor
```

---

## Usage Examples

### Server Component

```typescript
// app/(protected)/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'
import { userInventory, ingredients } from '@/db/schema'
import { eq, gt } from 'drizzle-orm'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const db = createUserDb({ accessToken: session.access_token })

  // Type-safe query with RLS enforcement
  const inventory = await db
    .select({
      id: userInventory.id,
      quantity: userInventory.quantityLevel,
      ingredientName: ingredients.name,
    })
    .from(userInventory)
    .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
    .where(gt(userInventory.quantityLevel, 0))

  return (
    <div>
      <h1>Your Inventory</h1>
      {inventory.map(item => (
        <div key={item.id}>
          {item.ingredientName}: Level {item.quantity}
        </div>
      ))}
    </div>
  )
}
```

---

### Server Action

```typescript
// app/actions/inventory.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

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

### API Route

```typescript
// app/api/inventory/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'
import { gt } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createUserDb({ accessToken: session.access_token })

  const inventory = await db
    .select()
    .from(userInventory)
    .where(gt(userInventory.quantityLevel, 0))

  return NextResponse.json({ inventory })
}
```

---

## Testing

### Setup Test Database

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:db": "vitest run tests/db"
  }
}
```

---

### Schema Test Example

```typescript
// tests/db/schema.test.ts
import { describe, it, expect } from 'vitest'
import { adminDb } from '@/db/client'
import { ingredients } from '@/db/schema'

describe('Drizzle Schema', () => {
  it('should query ingredients with correct types', async () => {
    const allIngredients = await adminDb.select().from(ingredients)

    expect(allIngredients).toBeInstanceOf(Array)
    if (allIngredients.length > 0) {
      expect(allIngredients[0]).toHaveProperty('id')
      expect(allIngredients[0]).toHaveProperty('name')
      expect(allIngredients[0]).toHaveProperty('category')
    }
  })

  it('should enforce enum constraints', async () => {
    const validCategories = ['meat', 'proteins_nonmeat', 'legumes', 'vegetables', 'starches', 'dairy', 'canned_jarred']
    const allIngredients = await adminDb.select().from(ingredients)

    allIngredients.forEach(ing => {
      expect(validCategories).toContain(ing.category)
    })
  })
})
```

---

### RLS Test Example

```typescript
// tests/integration/auth-flow.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createUserDb, adminDb } from '@/db/client'
import { userInventory, ingredients } from '@/db/schema'

describe('RLS Policies', () => {
  beforeEach(async () => {
    // Clean up test data
    await adminDb.delete(userInventory).where(/* test user IDs */)
  })

  it('should enforce user inventory RLS', async () => {
    // Setup: Create inventory for user1 (using admin client)
    await adminDb.insert(userInventory).values({
      userId: 'user1-uuid',
      ingredientId: 'ingredient-uuid',
      quantityLevel: 3,
    })

    // Test: User2 should not see user1's inventory
    const user2Db = createUserDb({ accessToken: 'user2_token' })
    const user2Inventory = await user2Db.select().from(userInventory)

    expect(user2Inventory).not.toContainEqual(
      expect.objectContaining({ userId: 'user1-uuid' })
    )
  })
})
```

---

### Run Tests

```bash
# Run all tests
pnpm test

# Run database tests only
pnpm test:db

# Watch mode
pnpm test -- --watch
```

---

## Troubleshooting

### Issue: Prepared Statement Error

**Error**: `prepared statements are not supported`

**Solution**: Ensure `prepare: false` in client configuration:
```typescript
const client = postgres(process.env.DATABASE_URL!, { prepare: false })
```

---

### Issue: RLS Policies Not Enforced

**Symptoms**: User sees all data, not just their own

**Solution**: Verify user client is created with valid `accessToken`:
```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session) throw new Error('Unauthorized')

const db = createUserDb({ accessToken: session.access_token })
```

**Debug**: Check session variables in PostgreSQL:
```sql
SELECT current_setting('request.jwt.claims', true);
SELECT current_setting('role', true);
```

---

### Issue: Type Errors in Queries

**Symptoms**: TypeScript complains about column names

**Solution**: Ensure schema types are imported correctly:
```typescript
import { ingredients } from '@/db/schema'

// ✅ Correct
const result = await db.select().from(ingredients)

// ❌ Wrong (missing import)
const result = await db.select().from('ingredients')
```

---

### Issue: Migration Conflicts

**Error**: `relation already exists`

**Solution**: Check existing migrations:
```bash
supabase db status
```

Delete duplicate migrations or use `IF NOT EXISTS`:
```sql
CREATE TABLE IF NOT EXISTS ingredients (...);
```

---

### Issue: Connection Timeout

**Symptoms**: Queries hang or timeout

**Solution**: Verify connection string and network access:
```bash
# Test connection
psql "$DATABASE_URL"
```

Check Supabase project settings → Database → Connection Pooling enabled.

---

## Quick Reference Commands

```bash
# Generate migration from schema
pnpm drizzle-kit generate

# Apply migrations locally
supabase db push

# Apply migrations to production
supabase db push --project-ref <project-id>

# Check migration status
supabase db status

# Run tests
pnpm test

# Introspect existing database
pnpm drizzle-kit introspect

# Validate schema
pnpm drizzle-kit check
```

---

## Next Steps

1. ✅ **Setup Complete**: Drizzle integrated with Supabase
2. 📝 **Create Schemas**: Define remaining tables from `data-model.md`
3. 🧪 **Write Tests**: Add integration tests for RLS policies
4. 🔄 **Generate Migrations**: Run `drizzle-kit generate` for schema changes
5. 🚀 **Deploy**: Apply migrations to production

**Additional Resources**:
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Supabase + Drizzle Guide](https://orm.drizzle.team/docs/connect-supabase)
- [data-model.md](./data-model.md): Full schema definitions
- [database-client-api.md](./contracts/database-client-api.md): API contract
- [research.md](./research.md): Technical decisions rationale

---

## Checklist

- [ ] Install dependencies (`drizzle-orm`, `postgres`, `drizzle-kit`, `vitest`)
- [ ] Configure `DATABASE_URL` and `DATABASE_URL_DIRECT` in `.env.local`
- [ ] Create `drizzle.config.ts` with `out: './supabase/migrations'`
- [ ] Create `vitest.config.ts` with `environment: 'node'`
- [ ] Create `src/db/schema/` directory and schema files
- [ ] Create `src/db/client.ts` with admin and user client
- [ ] Generate migration: `pnpm drizzle-kit generate`
- [ ] Review generated SQL in `supabase/migrations/`
- [ ] Apply migration: `supabase db push`
- [ ] Write basic schema test in `tests/db/`
- [ ] Write RLS integration test in `tests/integration/`
- [ ] Run tests: `pnpm test`
- [ ] Test user client in Server Component or API route
- [ ] Verify RLS enforcement with different users
- [ ] Update `AGENTS.md` with Drizzle patterns (see next todo)

**Done!** Drizzle ORM integrated with Supabase + Next.js 16.
