# Implementation Plan: Drizzle-Only Migrations

**Branch**: `008-drizzle-migrations` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-drizzle-migrations/spec.md`

## Summary

Migrate from Supabase-managed migrations to Drizzle-only migrations for vendor-agnostic schema management. Configure `drizzle-kit` to generate migrations to `apps/nextjs/src/db/migrations`, enable verbose logging, and create npm scripts for the migration workflow.

**Environment Strategy**:
- **Local**: Reset DB, apply migrations fresh
- **Production**: Preserve data, use baseline script to mark existing migrations as applied

## Technical Context

**Language/Version**: TypeScript 5+, Node.js
**Primary Dependencies**: drizzle-orm 0.45.1, drizzle-kit 0.31.8, postgres 3.4.8
**Storage**: PostgreSQL (Supabase-hosted, accessed directly)
**Testing**: vitest (manual testing for migrations)
**Target Platform**: Node.js server (Next.js 16)
**Project Type**: Web application (monorepo)
**Performance Goals**: Migration execution < 30s
**Constraints**: Must preserve RLS policies, zero data loss
**Scale/Scope**: ~10 tables, 2 environments (local, production)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | Simple config change, no over-engineering |
| II. Pragmatic Type Safety | ✅ PASS | Using existing typed Drizzle schema |
| III. Essential Validation Only | ✅ PASS | Migration validation built into Drizzle |
| IV. Test-Ready Infrastructure | ✅ PASS | Manual testing acceptable per MVP |
| V. Type Derivation | ✅ PASS | No new types needed |
| VI. Named Parameters | ✅ PASS | No new functions with params |
| VII. Neobrutalism Design | N/A | No UI changes |
| Non-Negotiables | ✅ PASS | No prod data loss - baseline; local can reset |

## Project Structure

### Documentation (this feature)

```text
specs/008-drizzle-migrations/
├── plan.md              # This file
├── research.md          # Technology decisions
├── quickstart.md        # Developer workflow guide
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
apps/nextjs/
├── drizzle.config.ts        # Updated: out → src/db/migrations
├── package.json             # Updated: new db:* scripts
├── src/db/
│   ├── schema/              # Existing schema definitions (source of truth)
│   │   ├── index.ts
│   │   ├── enums.ts
│   │   ├── ingredients.ts
│   │   ├── recipes.ts
│   │   ├── user-inventory.ts
│   │   ├── user-recipes.ts
│   │   ├── cooking-log.ts
│   │   └── unrecognized-items.ts
│   ├── client.ts            # Existing DB client
│   ├── migrate.ts           # NEW: Programmatic migration runner with logging
│   ├── baseline.ts          # NEW: Marks existing migrations as applied (prod only)
│   └── migrations/          # NEW: Drizzle migration output (copied from supabase/)
│       ├── meta/
│       │   └── _journal.json
│       └── 0000_*.sql       # Generated migration files
└── supabase/
    └── migrations/          # TO DELETE: Old Supabase migrations
```

**Structure Decision**: Monorepo web app. Migrations colocated with schema in `src/db/migrations/`.

## Implementation Steps

### Step 1: Update drizzle.config.ts

Update output directory and enable verbose logging:

```typescript
import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL_DIRECT) {
  throw new Error('DATABASE_URL_DIRECT is required in environment')
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',  // Changed from ./supabase/migrations
  dialect: 'postgresql',
  verbose: true,  // Enable logging
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
})
```

### Step 2: Create migrate.ts Script

Programmatic migration runner with logging:

```typescript
// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL_DIRECT
  if (!connectionString) {
    throw new Error('DATABASE_URL_DIRECT is required')
  }

  console.log('🚀 Starting migrations...')
  console.log(`📁 Migrations folder: ./src/db/migrations`)

  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)

  try {
    console.log('📋 Applying migrations...')
    await migrate(db, { migrationsFolder: './src/db/migrations' })
    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigrations()
```

### Step 3: Add npm Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx --env-file=.env.local src/db/migrate.ts",
    "db:migrate:prod": "tsx --env-file=.env.prod src/db/migrate.ts",
    "db:baseline:prod": "tsx --env-file=.env.prod src/db/baseline.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Step 4: Copy Existing Migrations

Copy existing migrations to new location:

```bash
# From apps/nextjs/
mkdir -p src/db/migrations/meta
cp supabase/migrations/0000_striped_scarlet_witch.sql src/db/migrations/
cp supabase/migrations/0001_enable_rls_policies.sql src/db/migrations/
cp supabase/migrations/meta/_journal.json src/db/migrations/meta/
cp supabase/migrations/meta/0000_snapshot.json src/db/migrations/meta/
```

### Step 5: Update Journal for Second Migration

Update `src/db/migrations/meta/_journal.json` to include both migrations:

```json
{
  "version": "7",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "7",
      "when": 1768855549563,
      "tag": "0000_striped_scarlet_witch",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "7",
      "when": 1768855549564,
      "tag": "0001_enable_rls_policies",
      "breakpoints": true
    }
  ]
}
```

### Step 6: Create Baseline Script (Production Only)

Create `src/db/baseline.ts` to mark existing migrations as applied in production:

```typescript
// src/db/baseline.ts
import postgres from 'postgres'

async function baseline() {
  const connectionString = process.env.DATABASE_URL_DIRECT
  if (!connectionString) {
    throw new Error('DATABASE_URL_DIRECT is required')
  }

  const sql = postgres(connectionString)

  console.log('🔧 Creating Drizzle migrations table...')

  // Create migrations table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `

  console.log('📝 Inserting baseline migration records...')

  // Insert records for already-applied migrations
  const migrations = [
    { hash: '0000_striped_scarlet_witch', created_at: 1768855549563 },
    { hash: '0001_enable_rls_policies', created_at: 1768855549564 },
  ]

  for (const m of migrations) {
    // Check if already exists
    const existing = await sql`
      SELECT 1 FROM "__drizzle_migrations" WHERE hash = ${m.hash}
    `
    if (existing.length === 0) {
      await sql`
        INSERT INTO "__drizzle_migrations" (hash, created_at)
        VALUES (${m.hash}, ${m.created_at})
      `
      console.log(`  ✓ Marked ${m.hash} as applied`)
    } else {
      console.log(`  → ${m.hash} already marked`)
    }
  }

  console.log('✅ Baseline complete')
  await sql.end()
}

baseline()
```

### Step 7: Apply to Environments

**Local** (fresh DB reset):
```bash
# Reset local Supabase DB
supabase db reset  # or drop/create manually

# Apply migrations from scratch
pnpm db:migrate
```

**Production** (preserve data):
```bash
# Run baseline to mark existing migrations as applied
pnpm db:baseline:prod

# Verify - should show "already up to date"
pnpm db:migrate:prod
```

### Step 8: Validation - Replace Enums with Indexed Text

Test the migration system end-to-end by making a real schema change:

**Schema Change**: Remove PostgreSQL enum types, replace with indexed text columns.

1. **Update schema files** in `src/db/schema/`:
   - `enums.ts`: Remove `pgEnum` definitions
   - `ingredients.ts`: Change `ingredientCategory` from enum to `text`
   - `recipes.ts`: Change `recipeSource` from enum to `text`
   - `recipe-ingredients.ts`: Change `ingredientType` from enum to `text`

2. **Generate migration**:
   ```bash
   pnpm db:generate
   # Creates: src/db/migrations/0002_*.sql with ALTER statements
   ```

3. **Review generated SQL** - should contain:
   - DROP TYPE statements for enums
   - ALTER COLUMN to text
   - CREATE INDEX for text columns

4. **Apply to local**:
   ```bash
   pnpm db:migrate
   ```

5. **Apply to production**:
   ```bash
   pnpm db:migrate:prod
   ```

6. **Verify**: Query database to confirm columns are now `text` type with indexes.

### Step 9: Cleanup Old Migrations

Delete `supabase/migrations/` folder after confirming new system works on both environments.

## RLS Policy Handling

The existing RLS migration (`0001_enable_rls_policies.sql`) uses Supabase-specific `auth.uid()` functions. Options:

1. **Keep as separate SQL file** - Run manually or via custom script
2. **Include in Drizzle migration** - Add RLS statements to generated migration

**Recommendation**: Keep RLS policies as a separate SQL file in `src/db/migrations/` and apply via custom script, since Drizzle doesn't natively generate RLS policies.

## Complexity Tracking

No constitution violations - simple configuration change with no new abstractions.
