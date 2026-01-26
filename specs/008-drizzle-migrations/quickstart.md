# Quickstart: Drizzle Migrations

## Overview

This project uses **Drizzle ORM** for database migrations with a **codebase-first** approach:
- Schema definitions in `src/db/schema/` are the source of truth
- `drizzle-kit generate` creates SQL migrations from schema changes
- `pnpm db:migrate` applies migrations with logging

## Commands

```bash
# From apps/nextjs/

# Generate migration from schema changes
pnpm db:generate

# Apply migrations to local database
pnpm db:migrate

# Apply migrations to production database
pnpm db:migrate:prod

# Mark existing migrations as applied (production only, run once)
pnpm db:baseline:prod

# Push schema directly (dev only, no migration file)
pnpm db:push

# Open Drizzle Studio (visual DB browser)
pnpm db:studio
```

## Initial Setup (One-Time)

When migrating from Supabase to Drizzle migrations:

**Local** (fresh reset):
```bash
# Reset local DB
supabase db reset  # or drop/create manually

# Apply migrations from scratch
pnpm db:migrate
```

**Production** (preserve data):
```bash
# Mark existing migrations as already applied
pnpm db:baseline:prod

# Verify - should show "already up to date"
pnpm db:migrate:prod
```

## Workflow: Making Schema Changes

### 1. Modify Schema

Edit files in `src/db/schema/`:

```typescript
// src/db/schema/ingredients.ts
export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: ingredientCategory('category').notNull(),
  isAssumed: boolean('is_assumed').default(false).notNull(),
  // NEW: Add a column
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
```

### 2. Generate Migration

```bash
pnpm db:generate
```

Output:
```
🔍 Reading schema from ./src/db/schema/index.ts
📝 Generating migration...
✅ Migration 0001_add_image_url.sql created
```

### 3. Review Migration

Check the generated SQL in `src/db/migrations/`:

```sql
-- 0001_add_image_url.sql
ALTER TABLE "ingredients" ADD COLUMN "image_url" text;
```

### 4. Apply Migration

```bash
pnpm db:migrate
```

Output:
```
🚀 Starting migrations...
📁 Migrations folder: ./src/db/migrations
📋 Applying migrations...
  → 0001_add_image_url.sql
✅ Migrations completed successfully
```

## File Structure

```
apps/nextjs/
├── drizzle.config.ts          # Drizzle Kit configuration
├── src/db/
│   ├── schema/                # Schema definitions (source of truth)
│   │   ├── index.ts           # Re-exports all schemas
│   │   ├── enums.ts           # PostgreSQL enums
│   │   ├── ingredients.ts
│   │   ├── recipes.ts
│   │   └── ...
│   ├── client.ts              # DB client (adminDb, userDb)
│   ├── migrate.ts             # Migration runner script
│   └── migrations/            # Generated SQL migrations
│       ├── meta/
│       │   └── _journal.json  # Migration tracking metadata
│       ├── 0000_initial.sql
│       └── 0001_*.sql
```

## Environment Variables

Required in `.env.local` and `.env.prod`:

```bash
# Direct connection (bypasses Supabase pooler) - required for migrations
DATABASE_URL_DIRECT=postgresql://user:pass@host:5432/db

# Pooled connection - used for app queries
DATABASE_URL=postgresql://user:pass@host:6543/db
```

## RLS Policies

Row Level Security policies are managed separately from schema migrations since Drizzle doesn't generate them automatically.

RLS policies are in: `src/db/migrations/rls-policies.sql`

Apply manually after schema migrations:
```bash
psql $DATABASE_URL_DIRECT -f src/db/migrations/rls-policies.sql
```

## Troubleshooting

### "No changes detected"
Schema hasn't changed since last migration. No action needed.

### "Migration already applied"
The migration tracking table shows this migration was already run. Check `__drizzle_migrations` table.

### Connection Error
Ensure `DATABASE_URL_DIRECT` is set and points to the direct connection (not pooled).

### Type Errors After Schema Change
Re-generate types: the schema files are the source of truth, TypeScript types are inferred automatically.
