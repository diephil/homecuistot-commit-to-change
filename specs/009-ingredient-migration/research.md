# Research Findings: Ingredient Migration

**Date**: 2026-01-26
**Feature**: 009-ingredient-migration
**Purpose**: Resolve technical unknowns for ingredient database migration and script reorganization

---

## Decision 1: Category Taxonomy Strategy

**Decision**: **REPLACE** existing 7 categories with 30 categories from taxonomy.md

**Rationale**:
1. **CSV data already uses 30 categories**: The en-ingredient-names.csv file contains ingredients categorized using the 30-category taxonomy
2. **No overlap with existing 7**: Current categories (proteins_nonmeat, starches, canned_jarred, legumes) don't map cleanly to the 30-category system
3. **Fresh start**: Project is in MVP phase with minimal existing data, replacement is safer than complex mapping
4. **Type safety**: Single enum prevents category validation issues

**Alternatives considered**:
- **Keep both systems**: Would require complex mapping logic, dual validation, and maintenance burden
- **Gradual migration**: Unnecessary complexity for MVP with limited existing data
- **Map old → new**: Old categories don't semantically align (e.g., "proteins_nonmeat" could be beans, nuts, fish, poultry)

**Impact**:
- **Code changes**: Update INGREDIENT_CATEGORIES in enums.ts from 7 to 30 values
- **Existing data**: Any existing ingredients in database with old categories will have invalid category values
  - **Mitigation**: Acceptable for MVP - can manually update if needed, or truncate and re-populate
- **Type checking**: Will surface all hardcoded category references that need updating

**Implementation**:
```typescript
// enums.ts - REPLACE entire array
export const INGREDIENT_CATEGORIES = [
  'non_classified', 'e100_e199', 'ferments', 'dairy', 'cheeses', 'salt',
  'meat', 'starch', 'oils_and_fats', 'alcohol', 'aroma', 'cereal', 'cocoa',
  'water', 'fruit', 'vegetables', 'beans', 'nuts', 'seed', 'plants',
  'mushroom', 'fish', 'molluscs', 'crustaceans', 'bee_ingredients',
  'synthesized', 'poultry', 'eggs', 'parts', 'compound_ingredients',
] as const
```

---

## Decision 2: Batch INSERT Structure

**Decision**: Use multiple INSERT statements with 100 rows per batch, ON CONFLICT DO NOTHING

**Rationale**:
1. **PostgreSQL limits**: Maximum 1000 parameters per prepared statement (2000 rows × 2 columns = 4000 params would fail)
2. **Balance**: 100 rows = 200 parameters, well under limit, good performance
3. **Idempotency**: ON CONFLICT DO NOTHING makes migration safe to re-run
4. **Transaction safety**: Each INSERT is atomic, partial failure doesn't corrupt data

**Alternatives considered**:
- **Single massive INSERT**: Would hit PostgreSQL parameter limit (1000 max)
- **50 rows per batch**: More SQL statements, slightly slower, no real benefit
- **200 rows per batch**: Would work but closer to limit, less safety margin
- **COPY command**: More complex, requires file handling, Drizzle migration doesn't support easily

**SQL Structure**:
```sql
-- Migration file: 0001_insert_ingredients.sql

-- Batch 1 (rows 1-100)
INSERT INTO ingredients (name, category) VALUES
  ('butter', 'dairy'),
  ('beef', 'meat'),
  ... (98 more rows)
ON CONFLICT (name) DO NOTHING;

-- Batch 2 (rows 101-200)
INSERT INTO ingredients (name, category) VALUES
  ('chicken', 'poultry'),
  ('salmon', 'fish'),
  ... (98 more rows)
ON CONFLICT (name) DO NOTHING;

-- Continue for all 2000+ rows...
```

**Escape Strategy**:
- Single quotes in ingredient names: Double them (`'` → `''`)
- Example: `"chef's salt"` → `('chef''s salt', 'salt')`
- All ingredient names wrapped in single quotes for SQL string literals

**Performance**:
- 2000 rows ÷ 100 per batch = ~20 INSERT statements
- Estimated execution time: <2 seconds (well under 5-second target)

---

## Decision 3: Data Embedding Strategy

**Decision**: **Embed CSV data directly in SQL file** as batch INSERT statements

**Rationale**:
1. **User request**: Explicit requirement for "batch sql statement insertions" in user input
2. **Drizzle compatibility**: SQL files are native migration format, no runtime parsing needed
3. **Simplicity**: No CSV parsing logic in migration runtime, just pure SQL
4. **Version control**: SQL file is self-contained, easier to review in PRs
5. **Deployment**: No external file dependencies, migration is portable

**Alternatives considered**:
- **Runtime CSV parsing**:
  - Rejected: More complex, requires file I/O during migration
  - Rejected: Doesn't match "batch sql statement insertions" request
  - Rejected: Introduces dependency on CSV file location
- **Drizzle TypeScript migration**:
  - Rejected: More verbose, harder to review SQL logic
  - Rejected: Doesn't leverage PostgreSQL's optimized batch INSERT
- **Separate seed script**:
  - Rejected: Not part of migration system, manual execution required
  - Rejected: Doesn't track in drizzle.__drizzle_migrations table

**Implementation approach**:
1. Generate SQL file programmatically from CSV (Node.js script or manual)
2. Read en-ingredient-names.csv
3. Parse rows, escape strings properly
4. Generate INSERT statements in batches of 100
5. Write to `src/db/migrations/NNNN_insert_ingredients.sql`
6. Manually create migration or use `pnpm db:generate` (with manual SQL file)

---

## Decision 4: Script Path Updates

**Decision**: Move script to apps/nextjs/scripts/, update paths to reference research/ directory

**Rationale**:
1. **Separation of concerns**: Code (script) in apps/, data (CSV, taxonomy.txt) in research/
2. **Research artifacts**: Keep research/ as read-only reference data
3. **Script purpose**: Utility for developers, belongs in app tooling
4. **Path structure**: Monorepo makes cross-directory references straightforward

**Paths to update**:

| Current Path (from research/scripts/) | New Path (from apps/nextjs/scripts/) | Change Required |
|--------------------------------------|-------------------------------------|-----------------|
| `../../research/food-ingredient-taxonomy.txt` | `../../../research/food-ingredient-taxonomy.txt` | Add one `../` |
| `../../research/` (output dir) | `../../../research/` (output dir) | Add one `../` |

**Updated script paths**:
```typescript
// OLD (research/scripts/extract-ingredients.ts)
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const researchDir = path.dirname(scriptDir); // research/
const inputPath = path.join(researchDir, "food-ingredient-taxonomy.txt");
const outputPath = path.join(researchDir, `${langCode}-ingredient-names.csv`);

// NEW (apps/nextjs/scripts/extract-ingredients.ts)
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const appDir = path.dirname(scriptDir); // apps/nextjs/
const repoRoot = path.dirname(path.dirname(appDir)); // repo root
const researchDir = path.join(repoRoot, "research");
const inputPath = path.join(researchDir, "food-ingredient-taxonomy.txt");
const outputPath = path.join(researchDir, `${langCode}-ingredient-names.csv`);
```

**Verification**:
```bash
cd apps/nextjs
node --loader ts-node/esm scripts/extract-ingredients.ts en
# Should output to research/en-ingredient-names.csv
```

**No changes needed**:
- Node.js built-in imports (fs, path, readline) - work from any location
- No external dependencies in script
- Script output remains in research/ directory

---

## Decision 5: Migration File Generation Approach

**Decision**: Create a **Node.js TypeScript script** to generate the SQL migration file from CSV

**Rationale**:
1. **Automation**: Manual SQL generation for 2000+ rows is error-prone
2. **Reusability**: Can regenerate if CSV data changes
3. **Validation**: Script can validate categories against taxonomy during generation
4. **Proper escaping**: Programmatic SQL generation ensures correct string escaping

**Generation script location**: `apps/nextjs/scripts/generate-ingredient-migration.ts`

**Script responsibilities**:
1. Read `research/en-ingredient-names.csv`
2. Parse CSV rows (skip header)
3. Validate category values against 30 INGREDIENT_CATEGORIES
4. Escape ingredient names for SQL (double single quotes)
5. Generate INSERT statements in batches of 100 rows
6. Write to `src/db/migrations/NNNN_insert_ingredients.sql`
7. Report statistics (total rows, categories, validation errors)

**Script structure**:
```typescript
// apps/nextjs/scripts/generate-ingredient-migration.ts

import * as fs from 'fs';
import * as path from 'path';

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

function generateInsertBatch(rows: IngredientRow[]): string {
  const values = rows
    .map(row => `  ('${escapeSqlString(row.name)}', '${row.category}')`)
    .join(',\n');

  return `INSERT INTO ingredients (name, category) VALUES\n${values}\nON CONFLICT (name) DO NOTHING;\n`;
}

async function main() {
  // Read CSV, parse, validate, generate SQL batches
  // Write to src/db/migrations/0001_insert_ingredients.sql
}
```

**Manual Drizzle step**:
After script generates SQL file, need to:
1. Get next migration number from `pnpm db:status`
2. Rename file to match Drizzle naming: `NNNN_insert_ingredients.sql`
3. Run `pnpm db:migrate` to apply

**Alternative**: Could integrate with Drizzle's migration generation, but manual approach is simpler for one-time data population.

---

## Summary

**Phase 0 Complete**: All technical unknowns resolved

| Decision Area | Resolution | Impact |
|---------------|-----------|--------|
| Category taxonomy | Replace with 30 categories | Update enums.ts, type check codebase |
| Batch INSERT structure | 100 rows per batch, ON CONFLICT | ~20 SQL statements, <2s execution |
| Data embedding | Embed in SQL file | Self-contained migration, no runtime CSV |
| Script paths | Move to apps/nextjs/scripts/ | Update path resolution, 3 levels up |
| Migration generation | Node.js script generates SQL | Automated, validated, reusable |

**Ready for Phase 1**: Data model design and quickstart guide creation

**Next actions**:
1. Create data-model.md with schema validation
2. Create quickstart.md with step-by-step execution guide
3. Update CLAUDE.md agent context
