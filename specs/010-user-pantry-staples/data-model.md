# Data Model: User Pantry Staples

**Feature**: 010-user-pantry-staples
**Date**: 2026-01-26

## Database Entities

### 1. userPantryStaples (NEW)

User-specific "always have" ingredients.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, default random | |
| user_id | UUID | NOT NULL | FK to auth.users (Supabase) |
| ingredient_id | UUID | NOT NULL, FK | References ingredients.id, CASCADE DELETE |
| created_at | TIMESTAMP WITH TZ | NOT NULL, default NOW | |

**Indexes**:
- `idx_user_pantry_staples_unique`: UNIQUE(user_id, ingredient_id)
- `idx_user_pantry_staples_user`: INDEX(user_id)

**Drizzle Schema**:
```typescript
import { pgTable, uuid, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { ingredients } from './ingredients'

export const userPantryStaples = pgTable('user_pantry_staples', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  ingredientId: uuid('ingredient_id').notNull()
    .references(() => ingredients.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_user_pantry_staples_unique').on(table.userId, table.ingredientId),
  index('idx_user_pantry_staples_user').on(table.userId),
])

export const userPantryStaplesRelations = relations(userPantryStaples, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [userPantryStaples.ingredientId],
    references: [ingredients.id],
  }),
}))
```

### 2. ingredientAliases (REMOVE)

Drop table and all relations.

**Migration SQL**:
```sql
DROP TABLE IF EXISTS ingredient_aliases CASCADE;
```

**Schema Changes**:
- Remove `ingredientAliases` table definition
- Remove `ingredientAliasesRelations`
- Remove `aliases: many(ingredientAliases)` from `ingredientsRelations`

---

## Application Types

### StorageLocation

```typescript
export const StorageLocationSchema = z.enum(['pantry', 'fridge'])
export type StorageLocation = z.infer<typeof StorageLocationSchema>
```

### ExtractedIngredient (LLM Output)

```typescript
export const ExtractedIngredientSchema = z.object({
  name: z.string(),
  storageLocation: StorageLocationSchema,
})
export type ExtractedIngredient = z.infer<typeof ExtractedIngredientSchema>
```

### OnboardingUpdate (Modified)

```typescript
export const OnboardingUpdateSchema = z.object({
  add: z.object({
    dishes: z.array(z.string()),
    ingredients: z.array(ExtractedIngredientSchema),  // CHANGED: was z.array(z.string())
  }),
  remove: z.object({
    dishes: z.array(z.string()),
    ingredients: z.array(z.string()),  // Remove by name only (unchanged)
  }),
})
export type OnboardingUpdate = z.infer<typeof OnboardingUpdateSchema>
```

### OnboardingState (Unchanged)

State already has `pantry` and `fridge` arrays - will use those instead of merged `ingredients`.

```typescript
export interface OnboardingState {
  currentStep: 1 | 2 | 3;
  dishes: string[];
  fridge: string[];      // Use for fridge storage
  pantry: string[];      // Use for pantry storage
  ingredients: string[]; // Derived: [...pantry, ...fridge]
  hasVoiceChanges: boolean;
  voiceFailureCount: number;
}
```

---

## Entity Relationships

```
┌─────────────────┐
│   ingredients   │
│─────────────────│
│ id (PK)         │
│ name            │
│ category        │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│  userPantryStaples   │
│──────────────────────│
│ id (PK)              │
│ user_id              │◄─── Supabase auth.users
│ ingredient_id (FK)   │
│ created_at           │
│ UNIQUE(user_id,      │
│   ingredient_id)     │
└──────────────────────┘
```

---

## Validation Rules

| Entity | Rule | Enforcement |
|--------|------|-------------|
| userPantryStaples | No duplicate user-ingredient pairs | DB unique constraint |
| userPantryStaples | Valid ingredient reference | FK constraint + CASCADE |
| ExtractedIngredient | storageLocation must be 'pantry' or 'fridge' | Zod enum validation |
| ExtractedIngredient | name must be non-empty string | Zod string validation |

---

## State Transitions

### Adding Ingredient (LLM extraction)

```
LLM Output: { name: "flour", storageLocation: "pantry" }
     │
     ▼
Validate via Zod ExtractedIngredientSchema
     │
     ▼
Route to state.pantry or state.fridge based on storageLocation
     │
     ▼
Deduplicate (case-insensitive)
     │
     ▼
Update UI (separate sections)
```

### Removing Ingredient

```
LLM Output: { ingredients: ["flour"] } in remove.ingredients
     │
     ▼
Remove from BOTH state.pantry AND state.fridge (case-insensitive)
```
