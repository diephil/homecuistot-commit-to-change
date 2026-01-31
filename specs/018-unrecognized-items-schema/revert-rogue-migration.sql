-- Revert rogue migration a90e3f21b7a263761ad35f1fdb508879c4b3a543e8e9a9bbf8db9cb004058327
-- This reverts changes made to recipe_ingredients table

-- Step 1: Drop the new indexes first (before dropping the column they reference)
DROP INDEX IF EXISTS idx_recipe_ingredients_ingredient_unique;
DROP INDEX IF EXISTS idx_recipe_ingredients_unrecognized_unique;
DROP INDEX IF EXISTS idx_recipe_ingredients_unrecognized;

-- Step 2: Drop the XOR check constraint
ALTER TABLE recipe_ingredients DROP CONSTRAINT IF EXISTS exactly_one_reference;

-- Step 3: Drop the foreign key to unrecognized_items
ALTER TABLE recipe_ingredients DROP CONSTRAINT IF EXISTS recipe_ingredients_unrecognized_item_id_unrecognized_items_id_f;

-- Step 4: Drop the unrecognized_item_id column
ALTER TABLE recipe_ingredients DROP COLUMN IF EXISTS unrecognized_item_id;

-- Step 5: Make ingredient_id NOT NULL again
-- First, ensure no NULL values exist (there shouldn't be any)
-- UPDATE recipe_ingredients SET ingredient_id = (SELECT id FROM ingredients LIMIT 1) WHERE ingredient_id IS NULL;
ALTER TABLE recipe_ingredients ALTER COLUMN ingredient_id SET NOT NULL;

-- Step 6: Recreate the original unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_ingredients_unique ON recipe_ingredients (recipe_id, ingredient_id);

-- Step 7: Delete the rogue migration entry from drizzle tracking
DELETE FROM drizzle.__drizzle_migrations WHERE hash = 'a90e3f21b7a263761ad35f1fdb508879c4b3a543e8e9a9bbf8db9cb004058327';
