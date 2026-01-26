# Data Model: Ingredient Migration

**Date**: 2026-01-26
**Feature**: 009-ingredient-migration
**Purpose**: Validate schema compatibility and document data structures

---

## Existing Schema Validation

### ingredients table

**Source**: `apps/nextjs/src/db/schema/ingredients.ts`

**Schema Definition**:
```typescript
export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: text('category').$type<IngredientCategory>().notNull(),
  isAssumed: boolean('is_assumed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_ingredients_category').on(table.category),
  index('idx_ingredients_is_assumed').on(table.isAssumed),
])
```

**PostgreSQL Schema**:
```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  is_assumed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_is_assumed ON ingredients(is_assumed);
```

**Constraints**:
- **Primary Key**: `id` (UUID, auto-generated)
- **Unique**: `name` (prevents duplicate ingredient names)
- **Not Null**: `name`, `category`, `isAssumed`, `createdAt`
- **Default Values**: `id` (random UUID), `isAssumed` (false), `createdAt` (now)

**Indexes**:
- `idx_ingredients_category`: Fast category filtering (used for dietary filtering)
- `idx_ingredients_is_assumed`: Fast filtering of assumed vs explicit ingredients

**Relations** (from schema):
- `ingredientAliases`: One-to-many (ingredient has many aliases)
- `recipeIngredients`: One-to-many (ingredient appears in many recipes)
- `userInventory`: One-to-many (ingredient appears in many user inventories)

### Schema Compatibility Analysis

**✅ Compatible with 30-category migration**:
1. **Text column**: `category` uses `TEXT` type (not enum), accepts any string value
2. **Unique constraint**: `name` UNIQUE prevents CSV duplicates automatically
3. **TypeScript typing**: `$type<IngredientCategory>()` is compile-time only, no DB constraint
4. **No FK constraints**: Category values not enforced by database, only TypeScript
5. **Indexes unchanged**: Existing indexes work with new category values

**No schema changes required** - Migration is pure data population.

---

## Updated Type Definitions

### BEFORE: Current Categories (7 total)

**File**: `apps/nextjs/src/db/schema/enums.ts`

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

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]
// Type resolves to: 'meat' | 'proteins_nonmeat' | 'legumes' | 'vegetables' | 'starches' | 'dairy' | 'canned_jarred'
```

### AFTER: Taxonomy Categories (30 total)

**File**: `apps/nextjs/src/db/schema/enums.ts` (UPDATED)

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

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]
// Type resolves to: 'non_classified' | 'e100_e199' | 'ferments' | ... (all 30 values)
```

**Type Derivation Pattern** (Constitution Principle V):
- ✅ Single source of truth: `INGREDIENT_CATEGORIES` array
- ✅ Derived type: `typeof` extracts type from const array
- ✅ Array indexer: `[number]` creates union of all array values
- ✅ Compile-time safety: TypeScript enforces valid category values

**Category Mapping to Taxonomy**:

| Taxonomy Source | Category Value | Description |
|-----------------|---------------|-------------|
| taxonomy.md line 9 | `non_classified` | Uncategorized items |
| taxonomy.md line 10 | `e100_e199` | Food additives/colorants |
| taxonomy.md line 11 | `ferments` | Fermented products |
| taxonomy.md line 12 | `dairy` | Milk products |
| taxonomy.md line 13 | `cheeses` | Cheese varieties |
| taxonomy.md line 14 | `salt` | Salt types |
| taxonomy.md line 15 | `meat` | Red meat, game |
| taxonomy.md line 16 | `starch` | Starches, thickeners |
| taxonomy.md line 17 | `oils_and_fats` | Cooking oils, fats |
| taxonomy.md line 18 | `alcohol` | Alcoholic ingredients |
| taxonomy.md line 19 | `aroma` | Flavorings, extracts |
| taxonomy.md line 20 | `cereal` | Grains, flour |
| taxonomy.md line 21 | `cocoa` | Chocolate, cocoa |
| taxonomy.md line 22 | `water` | Water types |
| taxonomy.md line 23 | `fruit` | Fruits |
| taxonomy.md line 24 | `vegetables` | Vegetables |
| taxonomy.md line 25 | `beans` | Legumes |
| taxonomy.md line 26 | `nuts` | Tree nuts |
| taxonomy.md line 27 | `seed` | Seeds |
| taxonomy.md line 28 | `plants` | Herbs, spices |
| taxonomy.md line 29 | `mushroom` | Fungi |
| taxonomy.md line 30 | `fish` | Fish |
| taxonomy.md line 31 | `molluscs` | Shellfish (clams, oysters) |
| taxonomy.md line 32 | `crustaceans` | Shellfish (shrimp, crab) |
| taxonomy.md line 33 | `bee_ingredients` | Honey, propolis |
| taxonomy.md line 34 | `synthesized` | Artificial ingredients |
| taxonomy.md line 35 | `poultry` | Chicken, turkey, duck |
| taxonomy.md line 36 | `eggs` | Eggs |
| taxonomy.md line 37 | `parts` | Animal parts/offal |
| taxonomy.md line 38 | `compound_ingredients` | Multi-ingredient items |

---

## Migration Data Structure

### Input: CSV Format

**File**: `research/en-ingredient-names.csv`

**Format**:
```csv
name,category
"imazalil",non_classified
"frying",non_classified
"caramel syrup",e100_e199
"caramelised sugar syrup",e100_e199
"ferment",ferments
"dairy",dairy
"butter",dairy
"cheese",cheeses
"salt",salt
"beef",meat
```

**Characteristics**:
- **Header row**: `name,category` (skip in processing)
- **Quoted names**: Ingredient names wrapped in double quotes
- **UTF-8 encoding**: Supports special characters (e.g., "crème fraîche")
- **Row count**: 2000+ ingredients (spec SC-001)
- **Duplicates**: Possible duplicate names (CSV shows "salt" as both category and ingredient)

**CSV Parsing Requirements**:
1. Skip header row (line 1)
2. Parse CSV with proper quote handling (names may contain commas)
3. Trim whitespace from fields
4. Validate category against INGREDIENT_CATEGORIES (fail on invalid)
5. Handle duplicate names (ON CONFLICT will skip)

### Output: SQL INSERT Statements

**File**: `apps/nextjs/src/db/migrations/NNNN_insert_ingredients.sql`

**Format**:
```sql
-- Migration: Insert ingredients from taxonomy CSV
-- Generated: 2026-01-26
-- Source: research/en-ingredient-names.csv
-- Total rows: 2000+

-- Batch 1 (rows 1-100)
INSERT INTO ingredients (name, category) VALUES
  ('imazalil', 'non_classified'),
  ('frying', 'non_classified'),
  ('caramel syrup', 'e100_e199'),
  ('caramelised sugar syrup', 'e100_e199'),
  ('ferment', 'ferments'),
  ('dairy', 'dairy'),
  ('butter', 'dairy'),
  ('cheese', 'cheeses'),
  ('salt', 'salt'),
  ('beef', 'meat'),
  ... (90 more rows)
ON CONFLICT (name) DO NOTHING;

-- Batch 2 (rows 101-200)
INSERT INTO ingredients (name, category) VALUES
  ... (100 rows)
ON CONFLICT (name) DO NOTHING;

-- Continue for all batches...
```

**SQL Generation Rules**:
1. **Batch size**: 100 rows per INSERT statement
2. **String escaping**: Single quotes doubled (`'` → `''`)
   - Example: `"chef's salt"` → `'chef''s salt'`
3. **ON CONFLICT**: `DO NOTHING` for idempotency
4. **Column order**: `(name, category)` matches table definition
5. **No ID column**: UUID generated automatically by database
6. **No isAssumed**: Defaults to `false`
7. **No createdAt**: Defaults to `NOW()`

**Example String Escaping**:
```sql
-- CSV: "crème fraîche",dairy
-- SQL: ('crème fraîche', 'dairy')  -- UTF-8 supported

-- CSV: "chef's salt",salt
-- SQL: ('chef''s salt', 'salt')  -- Single quote doubled

-- CSV: "milk, whole",dairy
-- SQL: ('milk, whole', 'dairy')  -- Comma preserved in quoted name
```

---

## State Transitions

**Not Applicable** - This feature is data population, no state machine.

Ingredients are static reference data with no lifecycle states.

---

## Validation Rules

### 1. Category Validity

**Rule**: Each `ingredient.category` MUST be one of 30 INGREDIENT_CATEGORIES

**Validation point**: During SQL migration file generation

**Implementation**:
```typescript
const validCategories = new Set(INGREDIENT_CATEGORIES);

for (const row of csvRows) {
  if (!validCategories.has(row.category)) {
    throw new Error(`Invalid category '${row.category}' for ingredient '${row.name}'`);
  }
}
```

**Error handling**: Generation script fails if invalid category found

### 2. Name Uniqueness

**Rule**: Ingredient names MUST be unique (case-sensitive)

**Validation point**: Database enforcement via UNIQUE constraint

**Implementation**:
```sql
-- UNIQUE constraint in schema
name TEXT NOT NULL UNIQUE

-- ON CONFLICT in migration
ON CONFLICT (name) DO NOTHING;
```

**Error handling**: Duplicate names silently skipped (idempotent)

### 3. UTF-8 Encoding

**Rule**: CSV and SQL files MUST use UTF-8 encoding

**Validation point**: File reading/writing in generation script

**Implementation**:
```typescript
// Read CSV with explicit UTF-8 encoding
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Write SQL with explicit UTF-8 encoding
fs.writeFileSync(sqlPath, sqlContent, 'utf-8');
```

**Error handling**: Node.js throws error on invalid UTF-8

### 4. SQL Injection Prevention

**Rule**: Ingredient names MUST be properly escaped for SQL

**Validation point**: SQL string generation

**Implementation**:
```typescript
function escapeSqlString(str: string): string {
  // Double all single quotes
  return str.replace(/'/g, "''");
}

// Usage
const sqlValue = `'${escapeSqlString(ingredientName)}'`;
```

**Test cases**:
- `"milk"` → `'milk'` (no escaping needed)
- `"chef's salt"` → `'chef''s salt'` (single quote doubled)
- `"it's ok"` → `'it''s ok'` (multiple quotes handled)

### 5. Idempotency

**Rule**: Migration MUST be safe to run multiple times

**Validation point**: SQL INSERT statement structure

**Implementation**:
```sql
INSERT INTO ingredients (name, category) VALUES (...)
ON CONFLICT (name) DO NOTHING;
```

**Behavior**:
- First run: Inserts all ingredients
- Second run: Skips all (names already exist)
- Partial run: Inserts only new ingredients

**Test**: Run migration twice, verify count unchanged on second run

---

## Performance Considerations

### Migration Execution Time

**Target**: <5 seconds (spec SC-002)

**Actual estimate**:
- 2000 rows ÷ 100 per batch = 20 INSERT statements
- ~0.1s per INSERT (network + DB overhead)
- Total: ~2 seconds

**Well under target** ✅

### Index Impact

**Existing indexes**:
- `idx_ingredients_category`: Built automatically after INSERT
- `idx_ingredients_is_assumed`: Not affected (default value used)

**Index build time**: Included in <2s estimate, negligible for 2000 rows

### Database Size

**Estimated row size**:
- UUID: 16 bytes
- name (avg 20 chars): ~20 bytes
- category (avg 15 chars): ~15 bytes
- is_assumed: 1 byte
- created_at: 8 bytes
- Total per row: ~60 bytes

**Total size for 2000 rows**: ~120 KB (negligible)

---

## Summary

**Schema Status**: ✅ No changes required - existing schema compatible

**Type Safety**: ✅ Derived types via `as const` + `typeof` pattern

**Validation**: ✅ All rules defined with clear implementation

**Performance**: ✅ Migration <2s (target <5s)

**Ready for**: Quickstart guide creation and implementation
