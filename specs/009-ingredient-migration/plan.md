# Implementation Plan: Ingredient Database Migration and Script Reorganization

**Branch**: `009-ingredient-migration` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-ingredient-migration/spec.md`

## Summary

Migrate ingredient extraction script from research/ to apps/nextjs/scripts/, update TypeScript code to use 30-category taxonomy from taxonomy.md, and create Drizzle migration to populate ingredients table with 2000+ ingredients from CSV using batch SQL INSERT statements. Focus on data migration and code consistency for meal planning foundation.

## Technical Context

**Language/Version**: TypeScript 5+, Node.js
**Primary Dependencies**: drizzle-orm 0.45.1, drizzle-kit 0.31.8, postgres 3.4.8, @supabase/supabase-js
**Storage**: PostgreSQL (Supabase-hosted), ingredients table already exists
**Testing**: Manual validation + TypeScript type checking
**Target Platform**: Next.js 16 monorepo (apps/nextjs/)
**Project Type**: Web application - monorepo structure
**Performance Goals**: Migration <5 seconds for 2000+ ingredients, batch INSERT efficiency
**Constraints**: Drizzle migration system compatibility, idempotent migration, UTF-8 encoding
**Scale/Scope**: 2000+ ingredients, 30 categories, single migration file, script relocation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ MVP-First Development
- **Speed prioritized**: Script move + migration generation = straightforward tasks
- **Manual validation acceptable**: Migration can be validated manually by querying database
- **Happy path focus**: Primary path is clean database → run migration
- **Assessment**: PASS - Simple data migration, no complex feature logic

### ✅ Pragmatic Type Safety
- **Type safety at boundaries**: Category enum will be strongly typed
- **No type errors blocking**: TypeScript compilation must succeed
- **Strict at data model**: Ingredient category types enforced via const assertion
- **Assessment**: PASS - Using TypeScript literal types for 30 categories

### ✅ Essential Validation Only
- **Database operations validated**: Migration will use ON CONFLICT for duplicate handling
- **Input validation**: CSV parsing with error handling
- **User impact**: Migration affects database integrity (critical validation required)
- **Assessment**: PASS - Validation where it matters (DB operations)

### ✅ Test-Ready Infrastructure
- **Manual testing sufficient**: Migration can be tested by running `pnpm db:migrate` locally
- **Critical path**: Data migration is critical but can be manually verified
- **Post-MVP testing**: Can add automated migration tests later
- **Assessment**: PASS - Manual validation sufficient for MVP

### ✅ Type Derivation Over Duplication
- **Derive category types**: Use `as const` assertion + `typeof` for category enum
- **Single source of truth**: taxonomy.md → TypeScript const → database
- **No manual duplication**: Category list defined once, types derived
- **Assessment**: PASS - Category types derived from const array

### ✅ Named Parameters for Clarity
- **Script functions**: Already using named parameters (extractIngredients, writeCsv)
- **Consistency maintained**: Continue pattern for new functions
- **Assessment**: PASS - Existing code follows pattern

### ✅ Vibrant Neobrutalism Design System
- **Not applicable**: This feature is backend/data migration, no UI components
- **Assessment**: N/A

### 🟡 Non-Negotiable Safeguards
- **No user data loss**: Migration must be idempotent (ON CONFLICT DO NOTHING)
- **No SQL injection**: Use parameterized queries or safe Drizzle SQL builder
- **TypeScript compilation**: Must succeed with updated category types
- **No crashes**: Script must handle CSV parsing errors gracefully
- **Assessment**: REQUIRES ATTENTION - Must validate idempotency and SQL safety

**Gate Status**: ✅ PASS (with attention to safeguards)

**Violations to Justify**: None

## Project Structure

### Documentation (this feature)

```text
specs/009-ingredient-migration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Category mapping research
├── data-model.md        # Phase 1: Ingredient schema validation
├── quickstart.md        # Phase 1: Migration execution guide
├── contracts/           # Phase 1: Not applicable (no API changes)
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── enums.ts              # UPDATE: 30-category taxonomy
│   │   │   ├── ingredients.ts        # VERIFY: Schema compatibility
│   │   │   └── index.ts              # No changes needed
│   │   ├── migrations/               # CREATE: New migration file
│   │   │   └── NNNN_insert_ingredients.sql  # Generated by Phase 2
│   │   └── index.ts
│   └── scripts/                      # MOVE: Script relocation target
│       └── extract-ingredients.ts    # MOVED + UPDATED from research/
├── package.json
└── drizzle.config.ts                 # Existing config

research/
├── en-ingredient-names.csv           # SOURCE: Ingredient data
├── taxonomy.md                       # SOURCE: 30 categories
├── food-ingredient-taxonomy.txt      # Original taxonomy file
└── scripts/
    └── extract-ingredients.ts        # REMOVE: Will move to apps/nextjs/scripts/
```

**Structure Decision**: Monorepo web application structure. Script moves from research/scripts/ (temporary research location) to apps/nextjs/scripts/ (permanent tooling location). Migration file generated in apps/nextjs/src/db/migrations/ following Drizzle conventions.

## Complexity Tracking

> No violations to justify - plan adheres to constitution.

---

## Phase 0: Outline & Research

**Objective**: Resolve technical unknowns and establish category mapping strategy.

### Research Tasks

1. **Category Mapping Strategy**
   - **Question**: How to map 30 taxonomy.md categories to existing 7 INGREDIENT_CATEGORIES?
   - **Research needed**:
     - Compare current 7 categories vs taxonomy.md 30 categories
     - Determine if we're replacing or extending the enum
     - Identify if any existing code depends on current 7 categories
   - **Decision to document**: Replace vs extend strategy, migration path for existing data

2. **Drizzle SQL Migration Best Practices**
   - **Question**: How to structure batch INSERT in Drizzle migration for 2000+ rows?
   - **Research needed**:
     - Drizzle's SQL file migration format
     - Batch INSERT syntax for PostgreSQL (VALUES with multiple rows)
     - ON CONFLICT handling for idempotency
     - SQL string escaping for ingredient names with quotes/special chars
   - **Decision to document**: Batch size (100 rows per INSERT?), escape strategy

3. **CSV Parsing in Migration Context**
   - **Question**: Should migration read CSV at runtime or embed data in SQL?
   - **Research needed**:
     - Drizzle migration environment capabilities
     - Benefits of embedded SQL vs runtime CSV reading
     - User guidance preference for "batch SQL statement insertions"
   - **Decision to document**: Embed data in SQL file (per user request for "batch sql statement insertions")

4. **Script Import Path Updates**
   - **Question**: What relative paths need updating when moving script?
   - **Research needed**:
     - Current script dependencies (fs, path, readline are Node built-ins)
     - File paths referenced in script (food-ingredient-taxonomy.txt, output CSV)
     - Whether script will continue reading from research/ or move files too
   - **Decision to document**: Keep research/ data files, update script paths

### Research Output Location

`specs/009-ingredient-migration/research.md`

**Format**:
```markdown
# Research Findings: Ingredient Migration

## Decision 1: Category Taxonomy Strategy
**Decision**: [Replace existing 7 categories with 30 categories OR extend]
**Rationale**: [Why this approach chosen]
**Alternatives considered**: [Other options evaluated]
**Impact**: [Code changes required, migration strategy]

## Decision 2: Batch INSERT Structure
**Decision**: [Batch size, INSERT format, ON CONFLICT handling]
**Rationale**: [Performance + idempotency balance]
**Alternatives considered**: [Single INSERT vs multiple, batch sizes]
**SQL Example**: [Provide concrete SQL syntax]

## Decision 3: Data Embedding Strategy
**Decision**: [Embed CSV data in SQL file]
**Rationale**: [Matches "batch sql statement insertions" request, simpler migration]
**Alternatives considered**: [Runtime CSV reading rejected because...]

## Decision 4: Script Path Updates
**Decision**: [List of paths to update, keep data in research/]
**Rationale**: [Separate code from data, maintain research artifacts]
**Updated paths**: [Specific path changes]
```

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### Data Model

**Output**: `specs/009-ingredient-migration/data-model.md`

**Content**:
```markdown
# Data Model: Ingredient Migration

## Existing Schema Validation

### ingredients table (from schema/ingredients.ts)
```typescript
{
  id: uuid,                    // Primary key, defaultRandom()
  name: text,                  // NOT NULL, UNIQUE
  category: text,              // NOT NULL, typed as IngredientCategory
  isAssumed: boolean,          // NOT NULL, default false
  createdAt: timestamp         // NOT NULL, defaultNow()
}
```

**Indexes**:
- idx_ingredients_category (on category)
- idx_ingredients_is_assumed (on isAssumed)

**Constraints**:
- UNIQUE constraint on name (prevents duplicates)

**Schema Compatibility**: ✅ Compatible with 30-category migration
- category column uses text type (flexible for any string)
- UNIQUE constraint on name handles CSV duplicates automatically
- No schema changes required

## Updated Type Definition

### enums.ts (BEFORE)
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
```

### enums.ts (AFTER - from research.md decision)
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
```

**Type Derivation**: Uses `as const` + `typeof` pattern per Constitution Principle V

## Migration Data Structure

### Input: en-ingredient-names.csv
```csv
name,category
"butter",dairy
"beef",meat
...
```

**Row count**: 2000+ ingredients (from spec SC-001)

### Output: SQL INSERT Statements
```sql
INSERT INTO ingredients (name, category) VALUES
  ('butter', 'dairy'),
  ('beef', 'meat'),
  ...
ON CONFLICT (name) DO NOTHING;
```

**Batch strategy**: [From research.md - batch size, chunking approach]

## State Transitions

N/A - This is data population, no state machine

## Validation Rules

1. **Category validity**: Each ingredient.category MUST be one of 30 INGREDIENT_CATEGORIES
2. **Name uniqueness**: Handled by database UNIQUE constraint + ON CONFLICT
3. **UTF-8 encoding**: CSV and SQL files MUST use UTF-8
4. **SQL injection prevention**: Ingredient names MUST be properly escaped (single quotes doubled)
5. **Idempotency**: Migration MUST be safe to run multiple times (ON CONFLICT DO NOTHING)
```

### API Contracts

**Not Applicable** - This feature doesn't modify APIs, only database schema and internal types.

### Quickstart Guide

**Output**: `specs/009-ingredient-migration/quickstart.md`

**Content**:
```markdown
# Quickstart: Ingredient Migration

## Prerequisites

- Drizzle ORM configured (apps/nextjs/drizzle.config.ts)
- PostgreSQL database accessible (Supabase)
- Environment variables set (.env.local)

## Step 1: Update Category Types

**File**: `apps/nextjs/src/db/schema/enums.ts`

Replace INGREDIENT_CATEGORIES array with 30-category taxonomy:

```typescript
export const INGREDIENT_CATEGORIES = [
  'non_classified', 'e100_e199', 'ferments', 'dairy', 'cheeses', 'salt',
  'meat', 'starch', 'oils_and_fats', 'alcohol', 'aroma', 'cereal', 'cocoa',
  'water', 'fruit', 'vegetables', 'beans', 'nuts', 'seed', 'plants',
  'mushroom', 'fish', 'molluscs', 'crustaceans', 'bee_ingredients',
  'synthesized', 'poultry', 'eggs', 'parts', 'compound_ingredients',
] as const
```

**Verify**: Run `pnpm typecheck` - should show type errors for old category references

## Step 2: Move and Update Script

**From**: `research/scripts/extract-ingredients.ts`
**To**: `apps/nextjs/scripts/extract-ingredients.ts`

**Updates required**:
- Update relative paths for research/ directory access
- Update import paths if needed
- Verify script runs from new location

**Test**: Run script from apps/nextjs/
```bash
cd apps/nextjs
node --loader ts-node/esm scripts/extract-ingredients.ts en
```

## Step 3: Generate Migration File

**From**: `apps/nextjs/`

```bash
# Create migration file manually or use drizzle-kit
pnpm db:generate
```

**Migration file location**: `apps/nextjs/src/db/migrations/NNNN_insert_ingredients.sql`

**Migration content**: Batch INSERT statements from CSV data (see data-model.md)

## Step 4: Run Migration

**Development**:
```bash
cd apps/nextjs
pnpm db:migrate
```

**Verify**:
```bash
pnpm db:status
```

**Production** (after dev validation):
```bash
cd apps/nextjs
pnpm db:migrate:prod
```

## Step 5: Validate Migration

**Query ingredient count**:
```sql
SELECT COUNT(*) FROM ingredients;
-- Expected: 2000+
```

**Query by category**:
```sql
SELECT category, COUNT(*) FROM ingredients GROUP BY category ORDER BY category;
-- Expected: All 30 categories represented
```

**Check for duplicates** (should be 0):
```sql
SELECT name, COUNT(*) FROM ingredients GROUP BY name HAVING COUNT(*) > 1;
```

## Step 6: Update Code References

**Search for old category usage**:
```bash
cd apps/nextjs
grep -r "proteins_nonmeat\|canned_jarred" src/
```

**Update to new categories**: Replace hardcoded category strings with new taxonomy values

**Verify TypeScript compilation**:
```bash
pnpm typecheck
```

## Rollback

**If migration fails**:
```bash
cd apps/nextjs
# Drizzle tracks migrations in drizzle.__drizzle_migrations
# Manually delete migration entry and truncate ingredients table
psql $DATABASE_URL -c "DELETE FROM drizzle.__drizzle_migrations WHERE hash = '<migration_hash>';"
psql $DATABASE_URL -c "TRUNCATE ingredients CASCADE;"
```

## Troubleshooting

**Issue**: CSV parsing errors
**Solution**: Verify UTF-8 encoding, check for malformed CSV rows

**Issue**: Type errors after category update
**Solution**: Search codebase for old category references, update to new taxonomy

**Issue**: Migration fails with duplicate key error
**Solution**: Check for existing ingredients data, ON CONFLICT should handle this

**Issue**: Migration times out
**Solution**: Check batch size in SQL, consider splitting into multiple migrations
```

### Agent Context Update

Run the agent context update script:

```bash
cd /Users/philippediep/Documents/workspace/homecuistot-commit-to-change
.specify/scripts/bash/update-agent-context.sh claude
```

**Expected updates to CLAUDE.md**:
- Add note about 30-category ingredient taxonomy
- Reference new migration for ingredient population
- Document script location change (research/scripts → apps/nextjs/scripts)

---

## Phase 2: Tasks

**Not generated by `/speckit.plan`** - Use `/speckit.tasks` command after planning phase.

**Expected task structure preview**:
1. Research phase tasks (resolve clarifications)
2. Update INGREDIENT_CATEGORIES in enums.ts
3. Move extract-ingredients.ts script
4. Update script paths and test
5. Generate migration file with batch INSERTs
6. Test migration locally
7. Update code references to new categories
8. Run TypeScript type check
9. Validate migration success
10. Update documentation

---

## Implementation Notes

### Critical Path

1. Research: Category mapping decision (replace vs extend)
2. Update enums.ts with 30 categories
3. Generate migration file with embedded SQL INSERTs
4. Test migration idempotency
5. Move script (can be done in parallel with migration testing)

### Risk Mitigation

**Risk**: Migration fails midway through INSERT
**Mitigation**: Use transactions, batch INSERTs in reasonable chunks (100 rows)

**Risk**: Existing code breaks with new categories
**Mitigation**: TypeScript type checking will catch issues, search codebase first

**Risk**: CSV contains invalid data
**Mitigation**: Pre-validate CSV before generating migration, add error handling

**Risk**: Migration not idempotent
**Mitigation**: Use ON CONFLICT DO NOTHING, test multiple runs

### Dependencies

- Phase 0 must complete before Phase 1
- Category enum update must happen before migration generation
- Script move can happen in parallel with migration work

### Success Validation

- [ ] TypeScript compilation succeeds with new categories
- [ ] Migration file generated with 2000+ INSERT statements
- [ ] Migration runs successfully in <5 seconds
- [ ] Query shows all 2000+ ingredients inserted
- [ ] Query shows all 30 categories represented
- [ ] Script runs from new location
- [ ] No type errors in codebase

---

## Re-evaluation After Phase 1

**Constitution Check**: ✅ PASS

**Updated Assessment**:
- Data model validated, no schema changes required
- Type safety maintained with derived types
- Migration strategy documented with SQL examples
- Quickstart provides clear execution path

**No new violations introduced**

---

## Command Outputs Expected

After running this `/speckit.plan` command, the following files should exist:

1. ✅ `specs/009-ingredient-migration/plan.md` (this file)
2. 🔄 `specs/009-ingredient-migration/research.md` (Phase 0 - to be created)
3. 🔄 `specs/009-ingredient-migration/data-model.md` (Phase 1 - to be created)
4. 🔄 `specs/009-ingredient-migration/quickstart.md` (Phase 1 - to be created)
5. ⏭️  `specs/009-ingredient-migration/tasks.md` (Phase 2 - created by `/speckit.tasks`)

**Next Command**: Continue with Phase 0 research, or user can review plan first.
