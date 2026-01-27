# Data Model: Inventory Page Rework

**Feature**: 014-inventory-page-rework | **Date**: 2026-01-27

## Existing Entities (No Changes Required)

### 1. ingredients

**Table**: `ingredients`
**Status**: ✅ Existing (5931 records)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default random | Unique identifier |
| name | text | NOT NULL, UNIQUE | Ingredient name (lowercase) |
| category | text | NOT NULL | One of 30 categories |
| created_at | timestamptz | NOT NULL, default now() | Creation timestamp |

**Notes**: Master ingredient list. No modifications needed.

---

### 2. user_inventory

**Table**: `user_inventory`
**Status**: ✅ Existing

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default random | Unique identifier |
| user_id | uuid | NOT NULL | User reference |
| ingredient_id | uuid | FK → ingredients.id, NOT NULL | Ingredient reference |
| quantity_level | integer | NOT NULL, CHECK(0-3), default 3 | Uses remaining (0=out, 3=full) |
| is_pantry_staple | boolean | NOT NULL, default false | Pantry staple flag |
| updated_at | timestamptz | NOT NULL, default now() | Last update timestamp |

**Indexes**:
- UNIQUE on (user_id, ingredient_id)
- Index on user_id
- Index on (user_id, quantity_level)
- Index on (user_id, is_pantry_staple)

**Notes**: Fully supports feature requirements. No schema changes.

---

## New Types (Application Layer Only)

### 3. Opik Prompt Definition

**Path**: `lib/prompts/inventory-update/prompt.ts`

```typescript
export const INVENTORY_UPDATE_PROMPT = {
  name: "inventory-update",
  description: "Extract ingredient names and quantity levels from voice or text input",
  prompt: `You are an inventory update assistant. Extract ingredient changes from user input.

Input: {{{input}}}

Extract each ingredient with:
1. ingredientName: lowercase, singular form (e.g., "tomato" not "Tomatoes")
2. quantityLevel: 0-3 based on context
3. confidence: high/medium/low

Quantity level rules:
- "just bought", "restocked", "fresh", "new", "full" → 3
- "enough for 2 meals", "some" → 2
- "running low", "almost out", "last bit" → 1
- "ran out", "finished", "none left", "used the last" → 0
- No context but mentioned → 3 (assume restocking)

Handle multiple ingredients. If same ingredient mentioned twice with different levels, use last value.

Return JSON matching the schema.`,
  metadata: { inputType: "audio|text", domain: "inventory", model: "gemini-2.0-flash" },
  tags: ["inventory", "extraction", "voice-input", "gemini"],
};
```

**Registration Script**: `scripts/register-inventory-prompt.ts`
**npm Scripts**: `prompt:inventory`, `prompt:inventory:prod`

---

### 4. InventoryUpdateExtraction (LLM Output)

**Purpose**: Temporary representation of LLM-parsed inventory changes before user confirmation.

```typescript
// types/inventory.ts
import { z } from 'zod';

// Schema for single ingredient update from LLM
export const inventoryItemUpdateSchema = z.object({
  ingredientName: z.string().min(1).max(100),
  quantityLevel: z.number().int().min(0).max(3),
  confidence: z.enum(['high', 'medium', 'low']),
});

// Schema for full LLM response
export const inventoryUpdateExtractionSchema = z.object({
  updates: z.array(inventoryItemUpdateSchema).min(1).max(50),
});

// Derived types
export type InventoryItemUpdate = z.infer<typeof inventoryItemUpdateSchema>;
export type InventoryUpdateExtraction = z.infer<typeof inventoryUpdateExtractionSchema>;

// Validated update with database ingredient match
export interface ValidatedInventoryUpdate {
  ingredientId: string;
  ingredientName: string;
  previousQuantity: number | null; // null if new to inventory
  proposedQuantity: number;
  confidence: 'high' | 'medium' | 'low';
}

// Full proposal after validation
export interface InventoryUpdateProposal {
  recognized: ValidatedInventoryUpdate[];
  unrecognized: string[];
}
```

**State Transitions**:
1. `idle` → User opens modal
2. `recording` → Voice/text input in progress
3. `processing` → LLM extraction in progress
4. `reviewing` → Displaying proposals to user
5. `saving` → Database commit in progress
6. `idle` → Complete (success or cancel)

---

### 5. InventoryDisplayItem

**Purpose**: Combined data for rendering inventory items in UI.

```typescript
// types/inventory.ts

// Quantity level type (strict 0-3)
export type QuantityLevel = 0 | 1 | 2 | 3;

// Display item combining user_inventory + ingredients data
export interface InventoryDisplayItem {
  id: string;              // user_inventory.id
  ingredientId: string;    // ingredients.id
  name: string;            // ingredients.name
  category: string;        // ingredients.category
  quantityLevel: QuantityLevel;
  isPantryStaple: boolean;
  updatedAt: Date;
}

// Grouped for display
export interface InventoryGroups {
  available: InventoryDisplayItem[];
  pantryStaples: InventoryDisplayItem[];
}
```

---

## Entity Relationships

```
┌─────────────┐         ┌──────────────────┐
│ ingredients │ 1 ───── * │  user_inventory  │
│             │           │                  │
│ id (PK)     │◀────────── ingredient_id (FK)│
│ name        │           │ user_id          │
│ category    │           │ quantity_level   │
└─────────────┘           │ is_pantry_staple │
                          │ updated_at       │
                          └──────────────────┘
```

**Cardinality**:
- One ingredient → Many user_inventory records (different users)
- One user → Many user_inventory records (their inventory)
- Unique constraint ensures one record per (user, ingredient)

---

## Validation Rules

### From Database Constraints
| Rule | Enforcement | Error |
|------|-------------|-------|
| Quantity 0-3 | CHECK constraint | "Quantity must be 0-3" |
| Unique (user, ingredient) | UNIQUE index | Handled by upsert |
| Valid ingredient_id | FK constraint | "Ingredient not found" |

### From Application Logic
| Rule | Enforcement | Error |
|------|-------------|-------|
| Ingredient name exists | Pre-save validation | "Unknown ingredient: X" |
| At least 1 update | Zod schema | "No changes detected" |
| Max 50 updates | Zod schema | "Too many updates at once" |

---

## Query Patterns

### Fetch User Inventory
```sql
SELECT
  ui.id,
  ui.ingredient_id,
  i.name,
  i.category,
  ui.quantity_level,
  ui.is_pantry_staple,
  ui.updated_at
FROM user_inventory ui
JOIN ingredients i ON ui.ingredient_id = i.id
WHERE ui.user_id = $1
ORDER BY
  ui.is_pantry_staple DESC,
  ui.quantity_level DESC,
  i.name ASC;
```

### Validate Ingredient Names
```sql
SELECT id, name
FROM ingredients
WHERE LOWER(name) = LOWER($1);
```

### Batch Upsert Inventory
```sql
INSERT INTO user_inventory (user_id, ingredient_id, quantity_level, is_pantry_staple)
VALUES
  ($1, $2, $3, false),
  ($1, $4, $5, false)
ON CONFLICT (user_id, ingredient_id)
DO UPDATE SET
  quantity_level = EXCLUDED.quantity_level,
  updated_at = NOW();
```

### Toggle Pantry Staple
```sql
UPDATE user_inventory
SET
  is_pantry_staple = NOT is_pantry_staple,
  updated_at = NOW()
WHERE id = $1 AND user_id = $2;
```

### Delete Inventory Item
```sql
DELETE FROM user_inventory
WHERE id = $1 AND user_id = $2;
```

---

## No Schema Migration Required

All required fields exist in current schema:
- ✅ `user_inventory.quantity_level` (0-3 range)
- ✅ `user_inventory.is_pantry_staple` (boolean flag)
- ✅ `ingredients` table (5931 records)
- ✅ RLS policies via Drizzle token authentication

Feature implementation uses existing database structure.
