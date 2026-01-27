-- Migration: Schema Refactor
-- Created: 2026-01-27
-- Description: Consolidate pantry staples, rename recipes table, drop junction table

-- STEP 1: Add isPantryStaple column to user_inventory
ALTER TABLE "user_inventory" ADD COLUMN "is_pantry_staple" boolean DEFAULT false NOT NULL;

-- STEP 2: Create index for pantry staples
CREATE INDEX IF NOT EXISTS "idx_user_inventory_pantry" ON "user_inventory" USING btree ("user_id","is_pantry_staple") WHERE "is_pantry_staple" = true;

-- STEP 3: Migrate data from user_pantry_staples to user_inventory
-- Insert missing inventory entries for orphaned pantry staples
INSERT INTO "user_inventory" ("user_id", "ingredient_id", "quantity_level", "is_pantry_staple", "updated_at")
SELECT ups.user_id, ups.ingredient_id, 3, true, NOW()
FROM "user_pantry_staples" ups
LEFT JOIN "user_inventory" ui ON ups.user_id = ui.user_id AND ups.ingredient_id = ui.ingredient_id
WHERE ui.id IS NULL;

-- Update existing inventory entries to set isPantryStaple flag
UPDATE "user_inventory" ui
SET "is_pantry_staple" = true
FROM "user_pantry_staples" ups
WHERE ui.user_id = ups.user_id AND ui.ingredient_id = ups.ingredient_id;

-- STEP 4: Drop user_pantry_staples table
DROP TABLE "user_pantry_staples";

-- STEP 5: Drop user_recipes junction table (no longer needed - recipes already belong to users)
DROP TABLE "user_recipes";

-- STEP 6: Rename recipes table to user_recipes
ALTER TABLE "recipes" RENAME TO "user_recipes";

-- STEP 7: Drop RLS policies that depend on isSeeded column
DROP POLICY IF EXISTS "Users can view seeded and own recipes" ON "user_recipes";
DROP POLICY IF EXISTS "Users can insert their own recipes" ON "user_recipes";
DROP POLICY IF EXISTS "Users can update their own recipes" ON "user_recipes";
DROP POLICY IF EXISTS "Users can delete their own recipes" ON "user_recipes";

-- STEP 8: Drop isSeeded column and related constraint/index
ALTER TABLE "user_recipes" DROP CONSTRAINT IF EXISTS "recipe_ownership";
ALTER TABLE "user_recipes" DROP COLUMN "is_seeded";
DROP INDEX IF EXISTS "idx_recipes_user_seeded";

-- STEP 9: Make userId NOT NULL (assumes all existing recipes have userId)
ALTER TABLE "user_recipes" ALTER COLUMN "user_id" SET NOT NULL;

-- STEP 10: Rename recipes index
ALTER INDEX "idx_recipes_user" RENAME TO "idx_user_recipes_user";

-- STEP 11: Recreate RLS policies (without isSeeded logic)
CREATE POLICY "Users can view own recipes" ON "user_recipes" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON "user_recipes" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON "user_recipes" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON "user_recipes" FOR DELETE USING (auth.uid() = user_id);
