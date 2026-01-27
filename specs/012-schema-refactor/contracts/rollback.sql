-- Rollback Script: 012 Schema Refactor
-- IMPORTANT: Run this ONLY if migration needs to be reverted
-- Restores schema to pre-migration state

-- STEP 1: Drop new RLS policies on user_recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON "user_recipes";
DROP POLICY IF EXISTS "Users can insert own recipes" ON "user_recipes";
DROP POLICY IF EXISTS "Users can update own recipes" ON "user_recipes";
DROP POLICY IF EXISTS "Users can delete own recipes" ON "user_recipes";

-- STEP 2: Rename user_recipes back to recipes
ALTER TABLE "user_recipes" RENAME TO "recipes";

-- STEP 3: Rename index back
ALTER INDEX "idx_user_recipes_user" RENAME TO "idx_recipes_user";

-- STEP 4: Make userId nullable again
ALTER TABLE "recipes" ALTER COLUMN "user_id" DROP NOT NULL;

-- STEP 5: Add back isSeeded column
ALTER TABLE "recipes" ADD COLUMN "is_seeded" BOOLEAN NOT NULL DEFAULT false;

-- STEP 6: Recreate index on isSeeded
CREATE INDEX "idx_recipes_user_seeded" ON "recipes" ("user_id", "is_seeded");

-- STEP 7: Restore recipe_ownership check constraint
ALTER TABLE "recipes" ADD CONSTRAINT "recipe_ownership"
  CHECK ((is_seeded = true AND user_id IS NULL) OR (is_seeded = false AND user_id IS NOT NULL));

-- STEP 8: Recreate original RLS policies (with isSeeded logic)
CREATE POLICY "Users can view seeded and own recipes" ON "recipes" FOR SELECT
  USING (is_seeded = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own recipes" ON "recipes" FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_seeded = false);
CREATE POLICY "Users can update their own recipes" ON "recipes" FOR UPDATE
  USING (auth.uid() = user_id AND is_seeded = false);
CREATE POLICY "Users can delete their own recipes" ON "recipes" FOR DELETE
  USING (auth.uid() = user_id AND is_seeded = false);

-- STEP 9: Recreate user_recipes junction table
CREATE TABLE "user_recipes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recreate indexes for junction table
CREATE UNIQUE INDEX "idx_user_recipes_unique" ON "user_recipes" (user_id, recipe_id);
CREATE INDEX "idx_user_recipes_user" ON "user_recipes" (user_id);
CREATE INDEX "idx_user_recipes_source" ON "user_recipes" (source);

-- Enable RLS on junction table
ALTER TABLE "user_recipes" ENABLE ROW LEVEL SECURITY;

-- STEP 10: Recreate user_pantry_staples table
CREATE TABLE "user_pantry_staples" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recreate indexes
CREATE UNIQUE INDEX "idx_user_pantry_staples_unique" ON "user_pantry_staples" (user_id, ingredient_id);
CREATE INDEX "idx_user_pantry_staples_user" ON "user_pantry_staples" (user_id);

-- Enable RLS on user_pantry_staples
ALTER TABLE "user_pantry_staples" ENABLE ROW LEVEL SECURITY;

-- Populate from user_inventory.isPantryStaple
INSERT INTO "user_pantry_staples" (user_id, ingredient_id, created_at)
SELECT user_id, ingredient_id, updated_at
FROM "user_inventory"
WHERE is_pantry_staple = true;

-- STEP 11: Remove isPantryStaple from user_inventory
DROP INDEX IF EXISTS "idx_user_inventory_pantry";
ALTER TABLE "user_inventory" DROP COLUMN "is_pantry_staple";

-- STEP 12: Delete migration record
DELETE FROM drizzle.__drizzle_migrations
WHERE hash = '32a26f78743160c9532e65218f79380f75e761cab59bd03680d18706f52e5c9d';

-- VERIFICATION QUERIES
-- Run these after rollback to verify data integrity

-- Check pantry staples count
SELECT COUNT(*) FROM "user_pantry_staples";  -- Should match pre-migration count

-- Check recipes count
SELECT COUNT(*) FROM "recipes";  -- Should match pre-migration count

-- Check junction table exists
SELECT COUNT(*) FROM "user_recipes";  -- Should return count (table exists)

-- Verify tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_pantry_staples', 'recipes', 'user_recipes');
-- Should return all 3 tables

-- Verify user_recipes does NOT exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_recipes';
-- Should return the junction table only (not a renamed recipes table)
