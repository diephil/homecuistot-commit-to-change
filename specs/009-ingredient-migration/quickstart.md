# Quickstart: Ingredient Migration

**Date**: 2026-01-26
**Feature**: 009-ingredient-migration
**Purpose**: Step-by-step guide for executing ingredient database migration

---

## Prerequisites

**Required**:
- ✅ Drizzle ORM configured (`apps/nextjs/drizzle.config.ts`)
- ✅ PostgreSQL database accessible (Supabase)
- ✅ Environment variables set (`.env.local`)
- ✅ Node.js and pnpm installed

**Verify setup**:
```bash
cd apps/nextjs
pnpm db:status
# Should show Drizzle connection working
```

---

## Overview

**Total steps**: 6 main steps + validation
**Estimated time**: 20-30 minutes
**Risk level**: Low (idempotent migration, no schema changes)

**Workflow**:
1. Update category types in enums.ts (5 min)
2. Move and update script (5 min)
3. Create migration generation script (10 min)
4. Generate migration SQL file (2 min)
5. Run migration (1 min)
6. Update code references (5-10 min)
7. Validate (5 min)

---

## Step 1: Update Category Types

**Objective**: Replace 7-category enum with 30-category taxonomy

**File**: `apps/nextjs/src/db/schema/enums.ts`

**Action**: Replace entire `INGREDIENT_CATEGORIES` array

**BEFORE**:
```typescript
export const INGREDIENT_CATEGORIES = [
  'meat',
  'proteins_nonmeat',
  'legumes',
  'vegetables',
  'starches',
  'dairy',
  'canned_jarred',
] as const
```

**AFTER**:
```typescript
export const INGREDIENT_CATEGORIES = [
  'non_classified',
  'e100_e199',
  'ferments',
  'dairy',
  'cheeses',
  'salt',
  'meat',
  'starch',
  'oils_and_fats',
  'alcohol',
  'aroma',
  'cereal',
  'cocoa',
  'water',
  'fruit',
  'vegetables',
  'beans',
  'nuts',
  'seed',
  'plants',
  'mushroom',
  'fish',
  'molluscs',
  'crustaceans',
  'bee_ingredients',
  'synthesized',
  'poultry',
  'eggs',
  'parts',
  'compound_ingredients',
] as const
```

**Important**: Keep the `as const` and type definition unchanged:
```typescript
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]
```

**Verify**:
```bash
cd apps/nextjs
pnpm typecheck
# EXPECTED: Type errors for old category references (e.g., 'proteins_nonmeat')
# This is GOOD - surfaces code that needs updating
```

**Commit checkpoint** (optional but recommended):
```bash
git add apps/nextjs/src/db/schema/enums.ts
git commit -m "feat(009): update ingredient categories to 30-category taxonomy"
```

---

## Step 2: Move and Update Script

**Objective**: Relocate extract-ingredients.ts to proper location with updated paths

### 2a. Create target directory

```bash
mkdir -p apps/nextjs/scripts
```

### 2b. Copy script

```bash
cp research/scripts/extract-ingredients.ts apps/nextjs/scripts/extract-ingredients.ts
```

### 2c. Update script paths

**File**: `apps/nextjs/scripts/extract-ingredients.ts`

**Find**:
```typescript
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const researchDir = path.dirname(scriptDir);
```

**Replace with**:
```typescript
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const appDir = path.dirname(scriptDir); // apps/nextjs/
const repoRoot = path.dirname(path.dirname(appDir)); // repo root
const researchDir = path.join(repoRoot, "research");
```

**Full updated function**:
```typescript
async function main() {
  const langCode = process.argv[2] || "en";
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const appDir = path.dirname(scriptDir); // apps/nextjs/
  const repoRoot = path.dirname(path.dirname(appDir)); // repo root
  const researchDir = path.join(repoRoot, "research");

  const inputPath = path.join(researchDir, "food-ingredient-taxonomy.txt");
  const outputPath = path.join(researchDir, `${langCode}-ingredient-names.csv`);

  console.log(`Extracting ${langCode} ingredients from taxonomy...`);
  // ... rest unchanged
}
```

### 2d. Test script from new location

```bash
cd apps/nextjs
tsx scripts/extract-ingredients.ts en
# OR if tsx not available:
node --loader ts-node/esm scripts/extract-ingredients.ts en
```

**Expected output**:
```
Extracting en ingredients from taxonomy...
Found 2000+ ingredient names
Written to /path/to/research/en-ingredient-names.csv

Category breakdown:
  dairy: 240
  meat: 189
  cereal: 280
  ... (all 30 categories)
```

### 2e. Remove old script (after verification)

```bash
git rm research/scripts/extract-ingredients.ts
```

**Commit checkpoint**:
```bash
git add apps/nextjs/scripts/extract-ingredients.ts
git commit -m "feat(009): move extract-ingredients script to apps/nextjs/scripts"
```

---

## Step 3: Create Migration Generation Script

**Objective**: Build automated script to generate SQL migration from CSV

**File**: `apps/nextjs/scripts/generate-ingredient-migration.ts`

**Full script**:
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INGREDIENT_CATEGORIES = [
  'non_classified', 'e100_e199', 'ferments', 'dairy', 'cheeses', 'salt',
  'meat', 'starch', 'oils_and_fats', 'alcohol', 'aroma', 'cereal', 'cocoa',
  'water', 'fruit', 'vegetables', 'beans', 'nuts', 'seed', 'plants',
  'mushroom', 'fish', 'molluscs', 'crustaceans', 'bee_ingredients',
  'synthesized', 'poultry', 'eggs', 'parts', 'compound_ingredients',
] as const;

interface IngredientRow {
  name: string;
  category: string;
}

function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

function generateInsertBatch(rows: IngredientRow[], batchNum: number): string {
  const values = rows
    .map(row => `  ('${escapeSqlString(row.name)}', '${row.category}')`)
    .join(',\n');

  return `-- Batch ${batchNum} (${rows.length} rows)\nINSERT INTO ingredients (name, category) VALUES\n${values}\nON CONFLICT (name) DO NOTHING;\n\n`;
}

function parseCsv(csvContent: string): IngredientRow[] {
  const lines = csvContent.trim().split('\n');
  const rows: IngredientRow[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quoted names with commas)
    const match = line.match(/^"([^"]*)"\s*,\s*(.+)$/);
    if (!match) {
      console.warn(`Skipping malformed line ${i + 1}: ${line}`);
      continue;
    }

    const name = match[1];
    const category = match[2].trim();

    // Validate category
    if (!INGREDIENT_CATEGORIES.includes(category as any)) {
      throw new Error(`Invalid category '${category}' for ingredient '${name}' at line ${i + 1}`);
    }

    rows.push({ name, category });
  }

  return rows;
}

async function main() {
  // Paths
  const scriptDir = __dirname;
  const appDir = path.dirname(scriptDir);
  const repoRoot = path.dirname(path.dirname(appDir));
  const csvPath = path.join(repoRoot, 'research', 'en-ingredient-names.csv');

  // Read and parse CSV
  console.log('Reading CSV:', csvPath);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(csvContent);

  console.log(`Parsed ${rows.length} ingredients`);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  for (const row of rows) {
    categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
  }

  console.log('\nCategory breakdown:');
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Generate SQL in batches
  const BATCH_SIZE = 100;
  const batches: string[] = [];

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    batches.push(generateInsertBatch(batch, Math.floor(i / BATCH_SIZE) + 1));
  }

  // Build full SQL content
  const sqlContent = `-- Migration: Insert ingredients from taxonomy CSV
-- Generated: ${new Date().toISOString()}
-- Source: research/en-ingredient-names.csv
-- Total ingredients: ${rows.length}
-- Batches: ${batches.length}

${batches.join('')}`;

  // Determine migration filename
  const migrationsDir = path.join(appDir, 'src', 'db', 'migrations');

  // Get next migration number
  const existingMigrations = fs.readdirSync(migrationsDir)
    .filter(f => f.match(/^\d+_.*\.sql$/))
    .map(f => parseInt(f.split('_')[0]))
    .filter(n => !isNaN(n));

  const nextNum = existingMigrations.length > 0
    ? Math.max(...existingMigrations) + 1
    : 1;

  const migrationFile = path.join(migrationsDir, `${String(nextNum).padStart(4, '0')}_insert_ingredients.sql`);

  // Write migration file
  fs.writeFileSync(migrationFile, sqlContent, 'utf-8');

  console.log(`\n✅ Migration generated: ${path.relative(process.cwd(), migrationFile)}`);
  console.log(`   Total batches: ${batches.length}`);
  console.log(`   Total ingredients: ${rows.length}`);
  console.log('\nNext steps:');
  console.log('  1. Review the migration file');
  console.log('  2. Run: pnpm db:migrate');
}

main().catch(console.error);
```

**Save to**: `apps/nextjs/scripts/generate-ingredient-migration.ts`

---

## Step 4: Generate Migration SQL File

**Objective**: Run generation script to create migration

```bash
cd apps/nextjs
tsx scripts/generate-ingredient-migration.ts
```

**Expected output**:
```
Reading CSV: /path/to/research/en-ingredient-names.csv
Parsed 2000 ingredients

Category breakdown:
  cereal: 280
  dairy: 240
  meat: 189
  ... (all 30 categories)

✅ Migration generated: src/db/migrations/0001_insert_ingredients.sql
   Total batches: 20
   Total ingredients: 2000

Next steps:
  1. Review the migration file
  2. Run: pnpm db:migrate
```

**Verify migration file**:
```bash
ls -lh src/db/migrations/*insert_ingredients.sql
# Should show new SQL file, ~200-300KB

head -20 src/db/migrations/*insert_ingredients.sql
# Should show SQL header and first batch
```

**Commit checkpoint**:
```bash
git add src/db/migrations/*insert_ingredients.sql
git add scripts/generate-ingredient-migration.ts
git commit -m "feat(009): add ingredient migration SQL file"
```

---

## Step 5: Run Migration

**Objective**: Apply migration to populate ingredients table

### 5a. Development database

**Run migration**:
```bash
cd apps/nextjs
pnpm db:migrate
```

**Expected output**:
```
Migrating...
✔ migrations applied
```

**Verify migration status**:
```bash
pnpm db:status
```

**Expected**:
- Migration `NNNN_insert_ingredients.sql` shown as applied
- No pending migrations

### 5b. Check results

**Connect to database**:
```bash
# Option 1: Drizzle Studio
pnpm db:studio
# Opens browser at http://localhost:4983

# Option 2: psql
psql $DATABASE_URL

# Option 3: Supabase Dashboard
# Go to project → Table Editor → ingredients
```

**Run validation queries**:
```sql
-- Count total ingredients
SELECT COUNT(*) FROM ingredients;
-- Expected: 2000+

-- Count by category
SELECT category, COUNT(*) as count
FROM ingredients
GROUP BY category
ORDER BY count DESC;
-- Expected: All 30 categories present

-- Sample ingredients
SELECT * FROM ingredients LIMIT 10;

-- Check for duplicates (should be 0)
SELECT name, COUNT(*) as count
FROM ingredients
GROUP BY name
HAVING COUNT(*) > 1;
-- Expected: 0 rows
```

### 5c. Test idempotency (optional but recommended)

**Run migration again**:
```bash
pnpm db:migrate
```

**Expected**: No new rows inserted (migration already applied in Drizzle tracking)

**Or manually test**:
```sql
-- Run one INSERT batch manually
INSERT INTO ingredients (name, category) VALUES
  ('butter', 'dairy'),
  ('milk', 'dairy')
ON CONFLICT (name) DO NOTHING;

-- Query count - should be unchanged
SELECT COUNT(*) FROM ingredients;
```

---

## Step 6: Update Code References

**Objective**: Update codebase to use new 30-category taxonomy

### 6a. Find old category references

```bash
cd apps/nextjs
grep -r "proteins_nonmeat\|canned_jarred\|starches\|legumes" src/
```

**Expected**: May find references in:
- Old test files
- Hardcoded category lists
- Legacy filters or dropdowns

### 6b. Update references

For each file found:

**BEFORE**:
```typescript
const categories = ['meat', 'proteins_nonmeat', 'dairy'];
```

**AFTER**:
```typescript
import { INGREDIENT_CATEGORIES } from '@/db/schema/enums';

const categories = INGREDIENT_CATEGORIES; // All 30 categories
// OR for subset:
const categories = ['meat', 'dairy', 'poultry', 'fish'] as const;
```

**Type-safe category checks**:
```typescript
import { IngredientCategory } from '@/db/schema/enums';

function filterByCategory(category: IngredientCategory) {
  // TypeScript enforces valid category values
}
```

### 6c. Verify TypeScript compilation

```bash
cd apps/nextjs
pnpm typecheck
```

**Expected**: Zero type errors

**If errors remain**:
- Check error messages for file + line number
- Update hardcoded category strings to new taxonomy values
- Consider using `INGREDIENT_CATEGORIES` constant instead of hardcoding

### 6d. Test locally

```bash
cd apps/nextjs
pnpm dev
```

Visit app in browser, test any features using ingredient categories:
- Recipe filtering by category
- Ingredient search/autocomplete
- Pantry management

**Commit checkpoint**:
```bash
git add -A
git commit -m "feat(009): update code references to new category taxonomy"
```

---

## Step 7: Validate Migration Success

**Objective**: Comprehensive validation of migration

### Validation Checklist

- [ ] **Type safety**: `pnpm typecheck` passes with zero errors
- [ ] **Ingredient count**: `SELECT COUNT(*) FROM ingredients` returns 2000+
- [ ] **Category coverage**: All 30 categories present in database
- [ ] **No duplicates**: Zero duplicate ingredient names
- [ ] **No NULL values**: All rows have valid name and category
- [ ] **Migration tracked**: Shows in `pnpm db:status` as applied
- [ ] **Script runs**: `tsx scripts/extract-ingredients.ts en` works from new location
- [ ] **App runs**: `pnpm dev` starts without errors
- [ ] **Features work**: Ingredient-related features function correctly

### Validation Queries

```sql
-- 1. Count ingredients (SC-001)
SELECT COUNT(*) FROM ingredients;
-- Expected: >= 2000

-- 2. Category distribution
SELECT category, COUNT(*)
FROM ingredients
GROUP BY category
ORDER BY category;
-- Expected: All 30 categories with counts

-- 3. Check data integrity
SELECT
  COUNT(CASE WHEN name IS NULL THEN 1 END) as null_names,
  COUNT(CASE WHEN category IS NULL THEN 1 END) as null_categories,
  COUNT(DISTINCT name) as unique_names,
  COUNT(*) as total_rows
FROM ingredients;
-- Expected: null_names=0, null_categories=0, unique_names=total_rows

-- 4. Sample data quality
SELECT * FROM ingredients
WHERE category = 'dairy'
ORDER BY name
LIMIT 5;
-- Expected: Real dairy ingredients (butter, milk, cheese, etc.)
```

### Performance Check

```sql
EXPLAIN ANALYZE
SELECT * FROM ingredients WHERE category = 'meat';
-- Expected: Uses idx_ingredients_category index, fast execution
```

---

## Step 8: Production Deployment (when ready)

**DO NOT run immediately** - test thoroughly in development first

### Production migration

```bash
cd apps/nextjs

# Verify production connection
pnpm db:status:prod

# Run migration
pnpm db:migrate:prod

# Verify
pnpm db:status:prod
```

### Post-deployment validation

Run same validation queries as Step 7, but against production database.

---

## Rollback Procedure

**If migration needs to be rolled back**:

### Option 1: Truncate and remove migration (clean slate)

```bash
cd apps/nextjs

# Get migration hash
pnpm db:status
# Note the hash of insert_ingredients migration

# Connect to database
psql $DATABASE_URL

# Rollback
BEGIN;
DELETE FROM drizzle.__drizzle_migrations WHERE hash = 'MIGRATION_HASH';
TRUNCATE ingredients CASCADE;
COMMIT;
```

### Option 2: Delete specific ingredients (partial rollback)

```sql
-- Delete only ingredients from this migration
DELETE FROM ingredients
WHERE created_at >= '2026-01-26'  -- adjust date
AND is_assumed = false;
```

### Option 3: Re-run migration (if data issue)

```bash
# Fix data issue in CSV or generation script
# Regenerate migration file
tsx scripts/generate-ingredient-migration.ts

# Truncate and re-run
psql $DATABASE_URL -c "TRUNCATE ingredients CASCADE;"
pnpm db:migrate
```

---

## Troubleshooting

### Issue: CSV parsing errors

**Symptoms**: Generation script fails with "malformed line" error

**Solution**:
1. Check CSV file encoding: `file -I research/en-ingredient-names.csv`
2. Should show: `utf-8`
3. If not, convert: `iconv -f ISO-8859-1 -t UTF-8 old.csv > new.csv`
4. Check for malformed CSV rows (missing quotes, extra commas)

### Issue: Type errors after category update

**Symptoms**: `pnpm typecheck` fails with category type mismatches

**Solution**:
```bash
# Find all old category references
grep -r "proteins_nonmeat\|canned_jarred\|starches" apps/nextjs/src/

# Update each file with new category values
# Use INGREDIENT_CATEGORIES constant instead of hardcoding
```

### Issue: Migration fails with duplicate key error

**Symptoms**: Migration fails with `ERROR: duplicate key value violates unique constraint "ingredients_name_key"`

**Solution**:
1. Check if ingredients already exist: `SELECT COUNT(*) FROM ingredients;`
2. If non-zero, decide:
   - **Keep existing**: Migration will skip duplicates (ON CONFLICT DO NOTHING)
   - **Replace all**: Truncate first: `TRUNCATE ingredients CASCADE;`
3. Re-run migration

### Issue: Migration times out

**Symptoms**: Migration hangs or takes >5 seconds

**Solution**:
1. Check database connection: `psql $DATABASE_URL -c "SELECT 1;"`
2. Reduce batch size in generation script (100 → 50)
3. Regenerate migration file
4. Check database load (might be busy with other operations)

### Issue: Script can't find research/ directory

**Symptoms**: `ENOENT: no such file or directory, open '.../food-ingredient-taxonomy.txt'`

**Solution**:
1. Verify path calculation in script
2. Check current directory: `pwd` (should be in `apps/nextjs/`)
3. Verify file exists: `ls -la research/food-ingredient-taxonomy.txt` (from repo root)
4. Update script paths if monorepo structure changed

### Issue: Drizzle can't find migration file

**Symptoms**: `pnpm db:migrate` doesn't detect new migration

**Solution**:
1. Check migration filename format: Should be `NNNN_description.sql`
2. Verify file location: `apps/nextjs/src/db/migrations/`
3. Check drizzle.config.ts `migrations` path
4. Run: `pnpm db:generate` to refresh Drizzle's migration detection

---

## Success Criteria Verification

After completing all steps, verify spec success criteria:

- [x] **SC-001**: Database contains all 2000+ unique ingredients from CSV ✓
- [x] **SC-002**: Migration completes in under 5 seconds ✓
- [x] **SC-003**: 100% of ingredients have valid 30-category taxonomy values ✓
- [x] **SC-004**: Script executes successfully from apps/nextjs/scripts/ location ✓
- [x] **SC-005**: Zero TypeScript compilation errors related to category types ✓
- [x] **SC-006**: Migration can be rolled back without orphaned data ✓

---

## Next Steps

**After successful migration**:

1. **Update CLAUDE.md**: Document new 30-category taxonomy
2. **Create tests** (optional for MVP): Add migration validation tests
3. **Update UI** (if applicable): Reflect new categories in filters/dropdowns
4. **User-facing changes** (if any): Update help text, documentation
5. **Monitor**: Check production for any category-related issues

**Related tasks** (out of scope for this feature):
- Build ingredient search UI
- Add ingredient autocomplete
- Create category filter components
- Implement dietary restrictions based on categories
