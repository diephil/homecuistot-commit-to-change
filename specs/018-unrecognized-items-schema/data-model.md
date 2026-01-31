# Data Model: Unrecognized Items Schema Migration

**Date**: 2026-01-31
**Feature**: 018-unrecognized-items-schema

## Entity Changes

### user_inventory (MODIFIED)

| Column | Type | Nullable | Change |
|--------|------|----------|--------|
| id | uuid | NO | - |
| user_id | uuid | NO | - |
| ingredient_id | uuid | **YES** | CHANGED from NOT NULL |
| **unrecognized_item_id** | uuid | YES | NEW |
| quantity_level | integer | NO | - |
| is_pantry_staple | boolean | NO | - |
| updated_at | timestamp | NO | - |

**Constraints**:
- `xor_item_reference`: CHECK `(ingredient_id IS NOT NULL) != (unrecognized_item_id IS NOT NULL)`
- `idx_user_inventory_ingredient`: UNIQUE on (user_id, ingredient_id) WHERE ingredient_id IS NOT NULL
- `idx_user_inventory_unrecognized`: UNIQUE on (user_id, unrecognized_item_id) WHERE unrecognized_item_id IS NOT NULL
- `fk_ingredient`: REFERENCES ingredients(id) ON DELETE RESTRICT
- `fk_unrecognized_item`: REFERENCES unrecognized_items(id) ON DELETE RESTRICT

**Removed Constraints**:
- `idx_user_inventory_unique`: old UNIQUE on (user_id, ingredient_id) - replaced by partial indexes

---

### recipe_ingredients (MODIFIED)

| Column | Type | Nullable | Change |
|--------|------|----------|--------|
| id | uuid | NO | - |
| recipe_id | uuid | NO | - |
| ingredient_id | uuid | **YES** | CHANGED from NOT NULL |
| **unrecognized_item_id** | uuid | YES | NEW |
| ingredient_type | text | NO | - |
| created_at | timestamp | NO | - |

**Constraints**:
- `xor_item_reference`: CHECK `(ingredient_id IS NOT NULL) != (unrecognized_item_id IS NOT NULL)`
- `idx_recipe_ingredients_ingredient`: UNIQUE on (recipe_id, ingredient_id) WHERE ingredient_id IS NOT NULL
- `idx_recipe_ingredients_unrecognized`: UNIQUE on (recipe_id, unrecognized_item_id) WHERE unrecognized_item_id IS NOT NULL
- `fk_ingredient`: REFERENCES ingredients(id) ON DELETE RESTRICT
- `fk_unrecognized_item`: REFERENCES unrecognized_items(id) ON DELETE RESTRICT

**Removed Constraints**:
- `idx_recipe_ingredients_unique`: old UNIQUE on (recipe_id, ingredient_id) - replaced by partial indexes

---

### unrecognized_items (RELATIONS ONLY)

No column changes. Add Drizzle relations for reverse lookups:

```typescript
export const unrecognizedItemsRelations = relations(unrecognizedItems, ({ many }) => ({
  inventoryItems: many(userInventory),
  recipeIngredients: many(recipeIngredients),
}))
```

## Relationship Diagram

```
┌─────────────────────┐
│   ingredients       │
│   (existing)        │
└─────────┬───────────┘
          │ 0..1
          │
┌─────────┴───────────┐     ┌─────────────────────┐
│   user_inventory    │     │   unrecognized_items│
│   ingredient_id ────┼─XOR─┤   (existing)        │
│   unrecognized_id ──┼─────┘                     │
└─────────────────────┘     └─────────────────────┘
          │
          │ (same pattern)
          │
┌─────────┴───────────┐
│  recipe_ingredients │
│   ingredient_id ────┼─XOR─┐
│   unrecognized_id ──┼─────┤
└─────────────────────┘     │
                            │
              ┌─────────────┘
              │
     ┌────────┴────────┐
     │ unrecognized_   │
     │ items           │
     └─────────────────┘
```

## Migration Steps (Conceptual)

1. Add `unrecognized_item_id` column (nullable) to both tables
2. Alter `ingredient_id` to nullable in both tables
3. Add XOR check constraint to both tables
4. Drop old unique indexes
5. Add new partial unique indexes

## Validation Rules

| Rule | Enforcement |
|------|-------------|
| Exactly one of ingredient_id/unrecognized_item_id set | DB CHECK constraint |
| No duplicate (user, ingredient) pairs | Partial unique index |
| No duplicate (user, unrecognized_item) pairs | Partial unique index |
| No duplicate (recipe, ingredient) pairs | Partial unique index |
| No duplicate (recipe, unrecognized_item) pairs | Partial unique index |
| Referential integrity | Foreign key constraints |
