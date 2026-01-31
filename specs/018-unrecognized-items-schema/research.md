# Research: Unrecognized Items Schema Migration

**Date**: 2026-01-31
**Feature**: 018-unrecognized-items-schema

## Research Topics

### 1. Drizzle ORM Check Constraints for XOR Pattern

**Decision**: Use `check()` constraint with SQL expression

**Rationale**: Drizzle supports check constraints via the `check()` function in table definition. For XOR (exactly one must be set), use:
```typescript
check('xor_item_reference', sql`(ingredient_id IS NOT NULL) != (unrecognized_item_id IS NOT NULL)`)
```

**Alternatives considered**:
- Application-level validation only: Rejected - DB constraint ensures data integrity
- Trigger-based: Rejected - overcomplicated for simple XOR

### 2. Drizzle ORM Partial Unique Indexes

**Decision**: Use `uniqueIndex()` with `.where()` clause

**Rationale**: Drizzle supports partial indexes via the `.where()` method on indexes:
```typescript
uniqueIndex('idx_user_inventory_ingredient').on(table.userId, table.ingredientId).where(sql`${table.ingredientId} IS NOT NULL`)
uniqueIndex('idx_user_inventory_unrecognized').on(table.userId, table.unrecognizedItemId).where(sql`${table.unrecognizedItemId} IS NOT NULL`)
```

**Alternatives considered**:
- Single composite index with COALESCE: Rejected - doesn't enforce uniqueness per column
- No uniqueness constraint: Rejected - allows duplicate items per user

### 3. Nullable Foreign Key References in Drizzle

**Decision**: Use `.references()` without `.notNull()` chain

**Rationale**: Simply omit `.notNull()` to make column nullable:
```typescript
ingredientId: uuid('ingredient_id').references(() => ingredients.id, { onDelete: 'restrict' })
// Note: no .notNull() = nullable
```

**Alternatives considered**: None - this is standard Drizzle pattern

### 4. Migration Strategy for Existing Data

**Decision**: ALTER TABLE with ADD COLUMN and ALTER COLUMN

**Rationale**:
- Existing rows have `ingredient_id` set (NOT NULL currently)
- Adding `unrecognized_item_id` as nullable is safe
- Changing `ingredient_id` to nullable is safe (existing values preserved)
- XOR constraint will pass for all existing rows (ingredient_id set, unrecognized_item_id NULL)

**Alternatives considered**:
- Drop and recreate table: Rejected - data loss risk
- Create new table and migrate: Rejected - unnecessary complexity

## No Unresolved Issues

All technical approaches verified against Drizzle ORM 0.45.1 patterns.
