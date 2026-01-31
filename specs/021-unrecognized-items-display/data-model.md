# Data Model: Unrecognized Items Display

**Date**: 2026-01-31
**Feature**: 021-unrecognized-items-display

## Entity Overview

This feature leverages existing database schema without modifications. All entities are already defined in Drizzle ORM schema.

### User Inventory Entry (Existing)

**Table**: `user_inventory`
**Schema Location**: `apps/nextjs/src/db/schema/user-inventory.ts`

**Purpose**: Represents an item in user's inventory, can reference either a recognized ingredient OR an unrecognized item (XOR constraint).

**Fields**:
```typescript
{
  id: uuid (PK, default random)
  userId: uuid (NOT NULL)
  ingredientId: uuid | null (FK → ingredients.id, onDelete: restrict)
  unrecognizedItemId: uuid | null (FK → unrecognized_items.id, onDelete: restrict)
  quantityLevel: integer (NOT NULL, default 3, CHECK 0-3)
  isPantryStaple: boolean (NOT NULL, default false)
  updatedAt: timestamp (NOT NULL, default now())
}
```

**Constraints**:
- XOR constraint: `(ingredientId IS NOT NULL) != (unrecognizedItemId IS NOT NULL)` — exactly one must be set
- Unique index on `(userId, ingredientId)` where `ingredientId IS NOT NULL`
- Unique index on `(userId, unrecognizedItemId)` where `unrecognizedItemId IS NOT NULL`

**Relations**:
- `ingredient`: one-to-one with `ingredients` table (nullable)
- `unrecognizedItem`: one-to-one with `unrecognized_items` table (nullable)

**Validation Rules** (Feature-Specific):
- FR-003: Cannot modify `quantityLevel` when `unrecognizedItemId IS NOT NULL`
- FR-004: Cannot modify `isPantryStaple` when `unrecognizedItemId IS NOT NULL`
- FR-007: Can delete entry when `unrecognizedItemId IS NOT NULL` (only removes inventory entry, not unrecognized_items record)

---

### Unrecognized Item (Existing)

**Table**: `unrecognized_items`
**Schema Location**: `apps/nextjs/src/db/schema/unrecognized-items.ts`

**Purpose**: Persistent record of items the system could not match to ingredient database. Preserved for potential future matching.

**Fields**:
```typescript
{
  id: uuid (PK, default random)
  userId: uuid (NOT NULL)
  rawText: text (NOT NULL)
  context: text | null
  resolvedAt: timestamp | null (with timezone)
  createdAt: timestamp (NOT NULL, default now())
  updatedAt: timestamp (NOT NULL, default now())
}
```

**Relations**:
- Referenced by `user_inventory.unrecognizedItemId`

**Validation Rules** (Feature-Specific):
- FR-008: Record MUST NOT be deleted when user deletes inventory entry
- FR-010: `rawText` used as display name in UI

**State Transitions**:
- Created → Unresolved (resolvedAt = NULL)
- Unresolved → Resolved (resolvedAt = timestamp) — future feature, out of scope for this feature

---

### Recognized Ingredient (Existing, Reference Only)

**Table**: `ingredients`
**Schema Location**: `apps/nextjs/src/db/schema/ingredients.ts`

**Purpose**: Standard ingredient from system's ingredient database with full metadata and taxonomy.

**Fields** (relevant subset):
```typescript
{
  id: uuid (PK)
  name: text (NOT NULL)
  category: text (NOT NULL) // One of 30 ingredient taxonomy categories
  // ... other metadata fields
}
```

**Relations**:
- Referenced by `user_inventory.ingredientId`

**Note**: This entity is not modified by this feature. Included for completeness to understand inventory item distinction.

---

## Derived TypeScript Types

All types derived from Drizzle schema per Constitution Principle V (no manual duplication).

### InventoryItem (Derived)

```typescript
import { userInventory, ingredients, unrecognizedItems } from '@/db/schema';

// Base inventory entry type
type UserInventoryEntry = typeof userInventory.$inferSelect;

// Inventory item with relations (from Drizzle query.userInventory.findMany with relations)
export type InventoryItemWithRelations = UserInventoryEntry & {
  ingredient: (typeof ingredients.$inferSelect) | null;
  unrecognizedItem: (typeof unrecognizedItems.$inferSelect) | null;
};

// Type guard: is this an unrecognized item?
export function isUnrecognizedItem(item: InventoryItemWithRelations): item is UnrecognizedInventoryItem {
  return item.unrecognizedItemId !== null && item.unrecognizedItem !== null;
}

// Narrowed type for unrecognized items
export type UnrecognizedInventoryItem = InventoryItemWithRelations & {
  unrecognizedItemId: string; // NOT NULL
  unrecognizedItem: NonNullable<InventoryItemWithRelations['unrecognizedItem']>; // NOT NULL
  ingredientId: null;
  ingredient: null;
};

// Narrowed type for recognized items
export type RecognizedInventoryItem = InventoryItemWithRelations & {
  ingredientId: string; // NOT NULL
  ingredient: NonNullable<InventoryItemWithRelations['ingredient']>; // NOT NULL
  unrecognizedItemId: null;
  unrecognizedItem: null;
};
```

### DeleteUnrecognizedItemParams (Derived from Service Function)

```typescript
// Named parameter object per Constitution Principle VI
export type DeleteUnrecognizedItemParams = {
  userId: string;
  inventoryId: string;
};

// Server Action return type
export type DeleteUnrecognizedItemResult = {
  success: boolean;
  error?: string;
};
```

---

## Query Patterns

### Fetch Inventory with Unrecognized Items

```typescript
import { db } from '@/db';
import { userInventory } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getInventoryWithUnrecognized(userId: string): Promise<InventoryItemWithRelations[]> {
  return db.query.userInventory.findMany({
    where: eq(userInventory.userId, userId),
    with: {
      ingredient: true,
      unrecognizedItem: true,
    },
    orderBy: (userInventory, { desc }) => [desc(userInventory.updatedAt)],
  });
}
```

**Sorting Logic** (FR-001 compliance):
```typescript
// Post-query sorting: recognized first, unrecognized last
const sortedInventory = rawInventory.reduce<{
  recognized: RecognizedInventoryItem[];
  unrecognized: UnrecognizedInventoryItem[];
}>((acc, item) => {
  if (isUnrecognizedItem(item)) {
    acc.unrecognized.push(item);
  } else {
    acc.recognized.push(item as RecognizedInventoryItem);
  }
  return acc;
}, { recognized: [], unrecognized: [] });

// Flatten: recognized items first, unrecognized items last
const finalInventory = [...sortedInventory.recognized, ...sortedInventory.unrecognized];
```

### Delete Unrecognized Item

```typescript
import { db } from '@/db';
import { userInventory } from '@/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';

export async function deleteUnrecognizedInventoryItem(params: DeleteUnrecognizedItemParams): Promise<void> {
  const { userId, inventoryId } = params;

  // Safety: only delete if unrecognizedItemId IS NOT NULL
  await db.delete(userInventory)
    .where(and(
      eq(userInventory.id, inventoryId),
      eq(userInventory.userId, userId),
      isNotNull(userInventory.unrecognizedItemId)
    ));

  // Note: unrecognized_items table record is NOT deleted (FK constraint cascade = restrict)
}
```

---

## Data Flow Diagram

```
User Views Inventory Page
  ↓
[Server Component] Fetch inventory via getInventoryWithUnrecognized()
  ↓
Drizzle Query: user_inventory LEFT JOIN ingredients LEFT JOIN unrecognized_items
  ↓
[Type Guard] Separate recognized vs unrecognized items
  ↓
[Sorting] Concat: recognized items + unrecognized items
  ↓
[Client Component] Render:
  - RecognizedInventoryItem → InventoryRow (existing component)
  - UnrecognizedInventoryItem → UnrecognizedItemRow (new component, opacity-50 + text-gray-500)
  ↓
User Clicks Delete on Unrecognized Item
  ↓
[Client Component] Optimistic UI: remove from state immediately
  ↓
[Server Action] deleteUnrecognizedItem({ userId, inventoryId })
  ↓
[Service] deleteUnrecognizedInventoryItem() - Drizzle DELETE user_inventory WHERE id = ? AND unrecognizedItemId IS NOT NULL
  ↓
[Revalidation] revalidatePath('/app/inventory')
  ↓
Success: Toast "Item deleted" | Failure: Toast "Failed to delete item" + rollback optimistic update
```

---

## Validation Summary by Functional Requirement

| FR | Validation Rule | Enforced By |
|----|----------------|-------------|
| FR-001 | Unrecognized items appear at end of list | Sorting logic in component |
| FR-002 | Visual distinction (opacity-50 + text-gray-500) | CSS classes in UnrecognizedItemRow |
| FR-003 | Prevent quantity changes for unrecognized | Component: quantity controls not rendered when `isUnrecognizedItem()` |
| FR-004 | Prevent pantry staple for unrecognized | Component: pantry staple control not rendered when `isUnrecognizedItem()` |
| FR-005 | Prevent clicking unrecognized items | Component: no onClick handler, pointer-events-none CSS |
| FR-006 | Provide delete action | Component: render delete button only |
| FR-007 | Remove from user_inventory when deleted | Service: DELETE user_inventory WHERE id = ? |
| FR-008 | Preserve unrecognized_items record | Database: FK constraint onDelete: restrict (no cascade) |
| FR-009 | Help modal content | Component: HelpModal extended with unrecognized items section |
| FR-010 | Display rawText as name | Component: `item.unrecognizedItem.rawText` rendered |
| FR-011 | Infinity icon for pantry staples | Component: PantryStapleIcon uses lucide-react Infinity |
| FR-012 | Hint text below pantry staples | Component: render hint text when pantry staples exist |
| FR-013 | Hide hint when no pantry staples | Component: conditional render based on pantry staples count |
| FR-014 | Error toast on delete failure | Component: try/catch → toast.error() |

---

## Performance Considerations

**Success Criteria SC-005**: Inventory page loads with up to 500 items in <3 seconds

**Query Optimization**:
- Single query with relations (no N+1)
- Indexes already exist: `idx_user_inventory_user` on `userId`

**Client-Side Rendering**:
- React 19 automatic batching for state updates
- Optimistic UI prevents perceived latency on delete
- Defer pagination to post-MVP (manual testing with <500 items)

**Memory**:
- 500 items × ~200 bytes per item = ~100KB (acceptable for client-side state)
- No infinite scroll needed for MVP
