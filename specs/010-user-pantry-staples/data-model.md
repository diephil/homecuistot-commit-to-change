# Data Model: Schema Cleanup & User Pantry Staples Table

**Feature**: 010-user-pantry-staples
**Date**: 2026-01-26

## Database Entities

### 1. userPantryStaples (NEW - for future use)

User-specific "always have" ingredients. Table created but UI not implemented in this feature.

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
