-- Enable RLS on user-scoped tables
-- These tables contain user-specific data and must enforce row-level security

-- user_inventory: Users can only access their own inventory
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
ON user_inventory FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory"
ON user_inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
ON user_inventory FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory"
ON user_inventory FOR DELETE
USING (auth.uid() = user_id);

-- user_recipes: Users can only access their own saved recipes
ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved recipes"
ON user_recipes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved recipes"
ON user_recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes"
ON user_recipes FOR DELETE
USING (auth.uid() = user_id);

-- cooking_log: Users can only access their own cooking history
ALTER TABLE cooking_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cooking log"
ON cooking_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cooking log"
ON cooking_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- unrecognized_items: Users can only access their own unrecognized items
ALTER TABLE unrecognized_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unrecognized items"
ON unrecognized_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unrecognized items"
ON unrecognized_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own unrecognized items"
ON unrecognized_items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own unrecognized items"
ON unrecognized_items FOR DELETE
USING (auth.uid() = user_id);

-- recipes: Users can see seeded recipes + their own custom recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view seeded and own recipes"
ON recipes FOR SELECT
USING (
  is_seeded = true OR
  user_id = auth.uid()
);

CREATE POLICY "Users can insert their own recipes"
ON recipes FOR INSERT
WITH CHECK (
  is_seeded = false AND
  user_id = auth.uid()
);

CREATE POLICY "Users can update their own recipes"
ON recipes FOR UPDATE
USING (
  is_seeded = false AND
  user_id = auth.uid()
)
WITH CHECK (
  is_seeded = false AND
  user_id = auth.uid()
);

CREATE POLICY "Users can delete their own recipes"
ON recipes FOR DELETE
USING (
  is_seeded = false AND
  user_id = auth.uid()
);

-- Public tables (no RLS needed):
-- - ingredients (catalog, read-only for all)
-- - ingredient_aliases (catalog, read-only for all)
-- - recipe_ingredients (access controlled via recipes RLS)
