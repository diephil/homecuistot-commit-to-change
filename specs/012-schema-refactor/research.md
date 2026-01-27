# Phase 0: Research & Decision Log

**Feature**: Database Schema Refactoring (012-schema-refactor)
**Date**: 2026-01-27

## Research Task 1: Migration Strategy for user_pantry_staples → user_inventory.isPantryStaple

### Question
How to handle pantry staples without corresponding inventory entries?

### Investigation
Analyzed schema files:
- `user_pantry_staples.ts`: Links userId + ingredientId with unique constraint
- `user_inventory.ts`: Links userId + ingredientId with unique constraint + quantityLevel

### Decision: **Create inventory entries with default quantityLevel**

**Rationale**:
- Pantry staples = ingredients user always has → should appear in inventory
- Default quantityLevel = 3 (full stock) makes logical sense for "always stocked" items
- Preserves all user data (no information loss)
- Simplifies user experience (no orphaned pantry staples)

**Implementation**:
```sql
-- Migration step: Insert missing inventory entries for pantry staples
INSERT INTO user_inventory (user_id, ingredient_id, quantity_level, updated_at)
SELECT ups.user_id, ups.ingredient_id, 3, NOW()
FROM user_pantry_staples ups
LEFT JOIN user_inventory ui ON ups.user_id = ui.user_id AND ups.ingredient_id = ui.ingredient_id
WHERE ui.id IS NULL;

-- Migration step: Update existing inventory entries to set isPantryStaple
UPDATE user_inventory ui
SET is_pantry_staple = true
FROM user_pantry_staples ups
WHERE ui.user_id = ups.user_id AND ui.ingredient_id = ups.ingredient_id;
```

**Alternatives Rejected**:
- Skip orphaned staples → Data loss, poor UX
- Set quantityLevel = 0 → Contradicts "pantry staple" meaning

---

## Research Task 2: Table Rename Conflict Resolution

### Question
What should the `user_recipes` junction table be renamed to?

### Investigation
Examined existing table naming patterns:
- `user_inventory` - user-specific inventory
- `user_pantry_staples` - user-specific pantry staples (being removed)
- `recipes` - recipes (being renamed to `user_recipes`)
- `recipe_ingredients` - recipe-to-ingredient junction
- `cooking_log` - user cooking activity log
- `unrecognized_items` - user-specific unrecognized items

### Decision: **user_saved_recipes**

**Rationale**:
- Follows existing `user_*` naming convention
- "Saved" clearly indicates bookmarked/favorited relationship
- Distinguishes from `user_recipes` (the recipes table itself)
- Semantically accurate: users "save" recipes they want to keep

**Schema Impact**:
- File rename: `user-recipes.ts` → `user-saved-recipes.ts`
- Table rename: `user_recipes` → `user_saved_recipes`
- All foreign keys and indexes updated accordingly

**Alternatives Rejected**:
- `user_recipe_bookmarks` → Too verbose
- `user_favorite_recipes` → "Favorite" implies rating system not yet implemented
- `user_recipe_saves` → Awkward grammar

---

## Research Task 3: Rollback Strategy

### Question
How to rollback if migration fails?

### Investigation
Drizzle ORM migration behavior:
- Drizzle tracks applied migrations in `drizzle.__drizzle_migrations` table
- No built-in rollback command in Drizzle Kit
- Migrations are transactional (PostgreSQL DDL in transactions)

### Decision: **Manual rollback SQL + delete migration record**

**Rationale**:
- Drizzle doesn't provide automated rollback
- PostgreSQL transaction rollback handles failed migrations automatically
- For manual rollback after successful migration, need reverse SQL

**Rollback SQL** (to be created alongside migration):
```sql
-- Rollback script: 012_schema_refactor_rollback.sql

-- 1. Restore user_pantry_staples table
CREATE TABLE user_pantry_staples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Populate from user_inventory.isPantryStaple
INSERT INTO user_pantry_staples (user_id, ingredient_id, created_at)
SELECT user_id, ingredient_id, updated_at
FROM user_inventory
WHERE is_pantry_staple = true;

-- 3. Remove isPantryStaple column
ALTER TABLE user_inventory DROP COLUMN is_pantry_staple;

-- 4. Rename user_recipes back to recipes
ALTER TABLE user_recipes RENAME TO recipes;

-- 5. Rename user_saved_recipes back to user_recipes
ALTER TABLE user_saved_recipes RENAME TO user_recipes;

-- 6. Add back isSeeded column and constraint
ALTER TABLE recipes ADD COLUMN is_seeded BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE recipes ADD CONSTRAINT recipe_ownership
  CHECK ((is_seeded = true AND user_id IS NULL) OR (is_seeded = false AND user_id IS NOT NULL));

-- 7. Delete migration record
DELETE FROM drizzle.__drizzle_migrations WHERE hash = '[migration_hash]';
```

**Alternatives Rejected**:
- Automated rollback tool → Drizzle doesn't support, would need custom tooling
- Snapshot/restore DB → Too slow, risky for production

---

## Research Task 4: Foreign Key Cascade Behavior

### Question
What's the impact of renaming recipes table on existing foreign keys?

### Investigation
PostgreSQL foreign key behavior during table rename:
- Foreign keys are tied to table OID, not name
- `ALTER TABLE RENAME` updates system catalogs but preserves OIDs
- Foreign key constraints remain valid after table rename
- Drizzle generates `ALTER TABLE RENAME` for table renames

### Decision: **Foreign keys auto-update, no manual intervention**

**Rationale**:
- PostgreSQL handles FK updates automatically during table rename
- Drizzle schema change → generates correct migration SQL
- No cascade delete/update behavior changes needed

**Verification Steps**:
1. Check generated migration SQL for correct `ALTER TABLE RENAME`
2. Verify FK constraints still exist after migration (`\d+ user_recipes` in psql)
3. Test FK cascade behavior (delete recipe → orphaned recipe_ingredients deleted)

**Alternatives Rejected**:
- Manual FK drop/recreate → Unnecessary, error-prone

---

## Additional Research: Production Data Volume

### Question
What's the migration duration estimate?

### Investigation
Current production data estimate (MVP phase):
- user_pantry_staples: <1000 rows (low user count)
- user_inventory: <5000 rows
- recipes: <500 rows
- user_recipes (junction): <2000 rows

### Decision: **Migration should complete <5 seconds**

**Rationale**:
- Small data volume (MVP phase)
- DDL operations (ALTER TABLE) are fast on small tables
- Data migration queries use indexed columns (userId, ingredientId)

**Monitoring**:
```sql
-- Pre-migration row counts
SELECT 'user_pantry_staples' as table_name, COUNT(*) FROM user_pantry_staples
UNION ALL
SELECT 'user_inventory', COUNT(*) FROM user_inventory
UNION ALL
SELECT 'recipes', COUNT(*) FROM recipes
UNION ALL
SELECT 'user_recipes', COUNT(*) FROM user_recipes;

-- Post-migration validation
SELECT 'user_inventory (with isPantryStaple=true)', COUNT(*)
FROM user_inventory WHERE is_pantry_staple = true;
```

**Downtime**: Zero-downtime not required for MVP (acceptable brief downtime during deployment)

---

## Summary of Decisions

| Research Area | Decision | Rationale |
|---------------|----------|-----------|
| Orphaned pantry staples | Create inventory entries (quantityLevel=3) | No data loss, logical default |
| Junction table rename | `user_saved_recipes` | Follows conventions, semantically clear |
| Rollback strategy | Manual SQL + delete migration record | Drizzle limitation, PostgreSQL transaction safety |
| Foreign key behavior | Auto-update via PostgreSQL | OID-based FKs survive rename |
| Migration duration | <5 seconds (MVP data volume) | Small dataset, indexed queries |

**All research tasks resolved. Ready for Phase 1: Design & Contracts.**
