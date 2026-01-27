# Data Model: Database Schema Refactoring

**Feature**: 012-schema-refactor
**Date**: 2026-01-27

## Entity Changes Overview

| Table | Change Type | Details |
|-------|-------------|---------|
| user_inventory | ADD COLUMN | isPantryStaple boolean NOT NULL DEFAULT false |
| user_pantry_staples | DROP TABLE | Replaced by isPantryStaple flag |
| recipes | RENAME + MODIFY | → user_recipes, remove isSeeded, remove constraint, userId NOT NULL |
| user_recipes | RENAME | → user_saved_recipes |
| recipe_ingredients | UPDATE FK | recipeId references user_recipes (auto-update) |

---

## Updated Entity Schemas

### 1. user_inventory (Modified)

**Purpose**: User's ingredient inventory with quantity tracking and pantry staple flags

**Columns**:
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL
- `ingredient_id` UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT
- `quantity_level` INTEGER NOT NULL DEFAULT 3 CHECK (quantity_level BETWEEN 0 AND 3)
- `is_pantry_staple` BOOLEAN NOT NULL DEFAULT false **[NEW]**
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Indexes**:
- UNIQUE INDEX `idx_user_inventory_unique` ON (user_id, ingredient_id)
- INDEX `idx_user_inventory_user` ON (user_id)
- INDEX `idx_user_inventory_quantity` ON (user_id, quantity_level) WHERE quantity_level > 0
- INDEX `idx_user_inventory_matching` ON (user_id, ingredient_id, quantity_level) WHERE quantity_level > 0
- **[NEW]** INDEX `idx_user_inventory_pantry` ON (user_id, is_pantry_staple) WHERE is_pantry_staple = true

**Relations**:
- ingredient → ingredients (many-to-one)

**Validation**:
- quantity_level: 0-3 range enforced via CHECK constraint
- user_id + ingredient_id: unique per user

**Migration Impact**:
- Existing rows: isPantryStaple defaults to false
- Pantry staple data migrated from user_pantry_staples via UPDATE

---

### 2. user_pantry_staples (Deleted)

**Status**: ~~DROPPED after migration~~

**Reason**: Functionality consolidated into user_inventory.isPantryStaple

**Data Migration**:
```sql
-- Before drop: migrate data to user_inventory
UPDATE user_inventory ui
SET is_pantry_staple = true
FROM user_pantry_staples ups
WHERE ui.user_id = ups.user_id AND ui.ingredient_id = ups.ingredient_id;

-- Handle orphaned pantry staples (no inventory entry)
INSERT INTO user_inventory (user_id, ingredient_id, quantity_level, is_pantry_staple, updated_at)
SELECT ups.user_id, ups.ingredient_id, 3, true, NOW()
FROM user_pantry_staples ups
LEFT JOIN user_inventory ui ON ups.user_id = ui.user_id AND ups.ingredient_id = ui.ingredient_id
WHERE ui.id IS NULL;

-- Drop table
DROP TABLE user_pantry_staples;
```

---

### 3. user_recipes (Renamed from recipes)

**Purpose**: User-created recipes (all recipes are now user-owned)

**Columns**:
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `name` TEXT NOT NULL
- `description` TEXT
- ~~`is_seeded` BOOLEAN~~ **[REMOVED]**
- `user_id` UUID NOT NULL **[CHANGED: was nullable, now NOT NULL]**
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Indexes**:
- INDEX `idx_user_recipes_user` ON (user_id) **[RENAMED from idx_recipes_user]**
- ~~INDEX `idx_recipes_user_seeded`~~ **[REMOVED]**

**Constraints**:
- ~~CHECK `recipe_ownership`~~ **[REMOVED]**

**Relations**:
- recipeIngredients → recipe_ingredients (one-to-many)
- savedByUsers → user_saved_recipes (one-to-many)
- cookingLogs → cooking_log (one-to-many)

**Migration Impact**:
```sql
-- Rename table
ALTER TABLE recipes RENAME TO user_recipes;

-- Remove isSeeded column
ALTER TABLE user_recipes DROP COLUMN is_seeded;

-- Make userId NOT NULL (assumes all existing recipes have userId)
ALTER TABLE user_recipes ALTER COLUMN user_id SET NOT NULL;

-- Drop check constraint
ALTER TABLE user_recipes DROP CONSTRAINT IF EXISTS recipe_ownership;
```

---

### 4. user_saved_recipes (Renamed from user_recipes)

**Purpose**: Junction table linking users to recipes they've saved/bookmarked

**Columns**:
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL
- `recipe_id` UUID NOT NULL REFERENCES user_recipes(id) ON DELETE CASCADE
- `source` TEXT NOT NULL (RecipeSource enum)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Indexes**:
- UNIQUE INDEX `idx_user_saved_recipes_unique` ON (user_id, recipe_id) **[RENAMED]**
- INDEX `idx_user_saved_recipes_user` ON (user_id) **[RENAMED]**
- INDEX `idx_user_saved_recipes_source` ON (source) **[RENAMED]**

**Relations**:
- recipe → user_recipes (many-to-one)

**Migration Impact**:
```sql
-- Rename table
ALTER TABLE user_recipes RENAME TO user_saved_recipes;

-- Indexes auto-renamed by PostgreSQL with table rename
-- Foreign key to recipes updates automatically (OID-based)
```

---

### 5. recipe_ingredients (Foreign Key Update)

**Purpose**: Ingredients required for a recipe

**Columns**:
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `recipe_id` UUID NOT NULL REFERENCES user_recipes(id) ON DELETE CASCADE **[FK target renamed]**
- `ingredient_id` UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT
- `ingredient_type` TEXT NOT NULL (IngredientType enum)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Indexes**:
- UNIQUE INDEX `idx_recipe_ingredients_unique` ON (recipe_id, ingredient_id)
- INDEX `idx_recipe_ingredients_recipe` ON (recipe_id)
- INDEX `idx_recipe_ingredients_ingredient` ON (ingredient_id)
- INDEX `idx_recipe_ingredients_type` ON (ingredient_type)

**Relations**:
- recipe → user_recipes (many-to-one)
- ingredient → ingredients (many-to-one)

**Migration Impact**:
- Foreign key constraint automatically updates when recipes → user_recipes rename happens
- No manual FK modification needed (PostgreSQL handles via OID)

---

## Schema Diagram (Before → After)

### Before

```
user_inventory          user_pantry_staples
├─ id                   ├─ id
├─ user_id              ├─ user_id
├─ ingredient_id ────┐  ├─ ingredient_id ────┐
├─ quantity_level    │  └─ created_at        │
└─ updated_at        │                        │
                     │                        │
                     ▼                        ▼
                ingredients ─────────────────┘
                ├─ id
                └─ ...

recipes                 user_recipes (junction)
├─ id ───────────────┐  ├─ id
├─ name              │  ├─ user_id
├─ is_seeded         │  ├─ recipe_id ────────┘
├─ user_id (nullable)│  ├─ source
└─ ...               │  └─ created_at
                     │
                     ▼
        recipe_ingredients
        ├─ recipe_id
        ├─ ingredient_id
        └─ ...
```

### After

```
user_inventory
├─ id
├─ user_id
├─ ingredient_id ─────┐
├─ quantity_level     │
├─ is_pantry_staple ✨│  (NEW: replaces user_pantry_staples table)
└─ updated_at         │
                      │
                      ▼
                ingredients
                ├─ id
                └─ ...

user_recipes            user_saved_recipes (renamed)
├─ id ───────────────┐  ├─ id
├─ name              │  ├─ user_id
├─ user_id (NOT NULL)│  ├─ recipe_id ────────┘
└─ ...               │  ├─ source
                     │  └─ created_at
                     │
                     ▼
        recipe_ingredients
        ├─ recipe_id
        ├─ ingredient_id
        └─ ...
```

---

## Validation Rules

### user_inventory.isPantryStaple
- **Type**: Boolean
- **Constraint**: NOT NULL DEFAULT false
- **Business Logic**:
  - true = ingredient is always stocked (pantry staple)
  - false = regular inventory item
  - Can be toggled by user at any time

### user_recipes.userId
- **Type**: UUID
- **Constraint**: NOT NULL (changed from nullable)
- **Business Logic**: All recipes must belong to a user (no system/seeded recipes)

### Migration Data Integrity
- **Pre-migration check**: Verify all recipes have userId populated
- **Post-migration check**: Row count validation
  ```sql
  -- Pantry staple count should match
  SELECT COUNT(*) FROM user_pantry_staples;  -- Before
  SELECT COUNT(*) FROM user_inventory WHERE is_pantry_staple = true;  -- After

  -- Recipe count should match
  SELECT COUNT(*) FROM recipes;  -- Before
  SELECT COUNT(*) FROM user_recipes;  -- After
  ```

---

## State Transitions

### user_inventory.isPantryStaple
```
[New Inventory Item]
        ↓
  isPantryStaple = false
        ↓
   User marks as pantry staple
        ↓
  isPantryStaple = true
        ↓
   User unmarks
        ↓
  isPantryStaple = false
```

**Constraints**:
- Pantry staple flag independent of quantityLevel
- User can have pantry staples with quantityLevel = 0 (temporarily out of stock)
- Deleting inventory item also removes pantry staple status

---

## Index Strategy

### New Index: user_inventory.isPantryStaple

**Purpose**: Optimize pantry staple queries

**Query Patterns**:
```sql
-- Get user's pantry staples
SELECT * FROM user_inventory WHERE user_id = ? AND is_pantry_staple = true;

-- Count pantry staples
SELECT COUNT(*) FROM user_inventory WHERE user_id = ? AND is_pantry_staple = true;
```

**Index Design**:
```sql
CREATE INDEX idx_user_inventory_pantry
ON user_inventory (user_id, is_pantry_staple)
WHERE is_pantry_staple = true;
```

**Rationale**:
- Partial index (WHERE clause) reduces index size
- Most inventory items are NOT pantry staples (isPantryStaple=false)
- Covering index for common pantry staple queries

---

## Schema Export (TypeScript Types)

```typescript
// Derived from updated schema files

export type UserInventory = {
  id: string;
  userId: string;
  ingredientId: string;
  quantityLevel: 0 | 1 | 2 | 3;
  isPantryStaple: boolean;  // NEW
  updatedAt: Date;
};

export type UserRecipe = {
  id: string;
  name: string;
  description: string | null;
  userId: string;  // NOT NULL now
  createdAt: Date;
  updatedAt: Date;
  // isSeeded removed
};

export type UserSavedRecipe = {
  id: string;
  userId: string;
  recipeId: string;
  source: RecipeSource;
  createdAt: Date;
};

export type RecipeIngredient = {
  id: string;
  recipeId: string;  // References user_recipes.id
  ingredientId: string;
  ingredientType: IngredientType;
  createdAt: Date;
};
```
