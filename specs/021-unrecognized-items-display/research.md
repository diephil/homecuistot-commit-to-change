# Research: Unrecognized Items Display

**Date**: 2026-01-31
**Feature**: 021-unrecognized-items-display

## Research Questions Resolved

### 1. How to Query User Inventory with Unrecognized Items?

**Decision**: Use Drizzle ORM with relations to join user_inventory → unrecognized_items table

**Rationale**:
- Existing schema has XOR constraint: `ingredientId IS NOT NULL XOR unrecognizedItemId IS NOT NULL`
- Drizzle relations already defined in `user-inventory.ts`: `userInventoryRelations` includes `unrecognizedItem` relation
- Single query can fetch both recognized ingredients and unrecognized items via nullable joins
- Avoids N+1 queries and maintains type safety

**Query Pattern**:
```typescript
const inventory = await db.query.userInventory.findMany({
  where: eq(userInventory.userId, userId),
  with: {
    ingredient: true,         // Populated when ingredientId NOT NULL
    unrecognizedItem: true,   // Populated when unrecognizedItemId NOT NULL
  },
});
```

**Alternatives Considered**:
- Separate queries for recognized vs unrecognized: Rejected (2 queries, harder to sort)
- Raw SQL with UNION: Rejected (loses type safety, more complex)

### 2. How to Implement Delete Action for Unrecognized Items?

**Decision**: Next.js Server Action with optimistic UI update and toast feedback

**Rationale**:
- Server Actions are Next.js 16 App Router best practice for mutations
- Co-location with component logic (no separate API route needed for simple delete)
- Built-in revalidation support via `revalidatePath('/app/inventory')`
- Optimistic UI provides instant feedback, rollback on error per clarification (toast-only error)
- Follows MVP-first: simple implementation, defer retry logic

**Implementation Pattern**:
```typescript
// Server Action in app/actions/inventory.actions.ts
'use server';
export async function deleteUnrecognizedItem({ userId, inventoryId }: { userId: string; inventoryId: string }) {
  const db = await createClient(); // Drizzle client
  await db.delete(userInventory)
    .where(and(
      eq(userInventory.id, inventoryId),
      eq(userInventory.userId, userId),
      isNotNull(userInventory.unrecognizedItemId) // Safety: only delete unrecognized items
    ));
  revalidatePath('/app/inventory');
  return { success: true };
}

// Client usage with optimistic update
const handleDelete = async (itemId: string) => {
  const optimisticInventory = inventory.filter(item => item.id !== itemId);
  setInventory(optimisticInventory); // Immediate UI update

  try {
    await deleteUnrecognizedItem({ userId, inventoryId: itemId });
    toast.success('Item deleted');
  } catch (error) {
    setInventory(inventory); // Rollback on error
    toast.error('Failed to delete item'); // Per clarification: error toast only, no retry
  }
};
```

**Alternatives Considered**:
- API Route + fetch: Rejected (more boilerplate, separate file, same security)
- Direct database mutation from client: Rejected (security risk, bypasses server validation)
- Delete from unrecognized_items table: Rejected (violates requirement to preserve unrecognized_items record)

### 3. How to Visually Distinguish Unrecognized Items?

**Decision**: Tailwind opacity-50 + text-gray-500 classes applied to row container

**Rationale**:
- Clarification specified: 50-60% opacity + muted text color
- Tailwind `opacity-50` = 50% opacity (within spec range)
- `text-gray-500` provides muted text color for readability
- Combined effect clearly signals "disabled/inactive" state
- Accessible: maintains WCAG contrast ratio for large text at 50% opacity
- Vibrant neobrutalism: Use `border-gray-400` instead of black border for unrecognized items

**CSS Pattern**:
```tsx
<div className={cn(
  "border-4 md:border-6 p-4",
  isUnrecognized
    ? "opacity-50 text-gray-500 border-gray-400" // Unrecognized styling
    : "border-black text-black"                   // Regular styling
)}>
  {/* Item content */}
</div>
```

**Alternatives Considered**:
- Opacity-60: Rejected (50% more standard, clearer distinction)
- Grayscale filter: Rejected (clarification chose opacity + muted text)
- Background color change only: Rejected (clarification specified opacity approach)

### 4. How to Integrate Infinity Icon for Pantry Staples?

**Decision**: Replace Star icon with lucide-react `Infinity` component, wrap in reusable `PantryStapleIcon.tsx`

**Rationale**:
- Project already uses lucide-react for icons (standardized)
- `Infinity` icon available in lucide-react v0.460+
- Reusable component in `components/shared/` per user instruction
- Maintains vibrant neobrutalism styling (colored background, border, shadow)
- Single source of truth for pantry staple icon across app

**Component Pattern**:
```tsx
// components/shared/PantryStapleIcon.tsx
import { Infinity } from 'lucide-react';

export function PantryStapleIcon({ className }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center",
      "bg-yellow-400 border-3 md:border-4 border-black",
      "w-8 h-8 md:w-10 md:h-10",
      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      "transform -rotate-6",
      className
    )}>
      <Infinity className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" strokeWidth={3} />
    </div>
  );
}
```

**Alternatives Considered**:
- Custom SVG infinity: Rejected (lucide-react provides consistent icon style)
- Keep star icon: Rejected (requirement explicitly states replace with infinity)
- Multiple pantry staple icon variants: Rejected (single reusable component per user instruction)

### 5. How to Add Help Modal Content for Unrecognized Items?

**Decision**: Extend existing `HelpModal.tsx` component with new section for unrecognized items

**Rationale**:
- Clarification confirmed: add to existing help modal accessed via "?" button
- Assumption validated: help modal mechanism already exists
- Single help modal maintains consistency
- No new modal component needed (follows MVP-first principle)

**Content Pattern** (add to HelpModal):
```tsx
<section className="border-t-4 border-black pt-6 mt-6">
  <h3 className="text-2xl font-black uppercase mb-4">
    Unrecognized Items
  </h3>
  <div className="space-y-3 font-bold text-lg">
    <p>
      These are items the system doesn't recognize yet. They appear grayed out at the bottom of your inventory.
    </p>
    <p>
      <strong>What you can do:</strong> Delete unrecognized items to clean up your inventory.
    </p>
    <p>
      <strong>What you can't do:</strong> Change quantities or mark as pantry staples (these features only work for recognized ingredients).
    </p>
    <p>
      <strong>Future updates:</strong> We're constantly improving recognition. These items might be automatically recognized in future updates!
    </p>
    <p className="text-base text-gray-700">
      Note: Deleting removes them from your visible inventory but preserves the record for future matching.
    </p>
  </div>
</section>
```

**Alternatives Considered**:
- Separate modal for unrecognized items: Rejected (clarification specified existing modal)
- Inline help text only: Rejected (requirement specifies modal help documentation)
- Tooltip-based help: Rejected (clarification confirmed modal approach)

## Technology Stack Validation

**Next.js 16 App Router**: ✅ Confirmed in CLAUDE.md active technologies
**Drizzle ORM 0.45.1**: ✅ Confirmed, schema supports XOR constraint for unrecognized items
**Supabase PostgreSQL**: ✅ user_inventory and unrecognized_items tables exist
**RetroUI + Tailwind CSS v4**: ✅ Vibrant neobrutalism design system documented in constitution
**lucide-react**: ✅ Standard icon library, `Infinity` icon available
**React 19**: ✅ Confirmed, supports Server Actions and transitions

## Best Practices Applied

1. **Component Reusability**: Per user instruction, reusable components in `components/shared/`
   - `UnrecognizedItemRow.tsx`: Reusable display component
   - `PantryStapleIcon.tsx`: Reusable infinity icon wrapper

2. **Service Layer**: Per user instruction, code logic in `lib/services/`
   - `unrecognized-items.service.ts`: Delete operations, fetch logic
   - Separates business logic from UI components

3. **Type Safety via Derivation**: Constitution Principle V
   - Derive types from Drizzle schema: `typeof userInventory.$inferSelect`
   - No manual type duplication

4. **Named Parameters**: Constitution Principle VI
   - Service functions use named params: `deleteUnrecognizedItem({ userId, itemId })`

5. **Mobile-First Responsive**: Constitution Principle VII
   - Smaller borders/shadows on mobile: `border-4 md:border-6`
   - Remove rotations on mobile: `md:transform md:-rotate-2`
   - Touch target sizes: minimum 44x44px for delete buttons

6. **Vibrant Neobrutalism**: Constitution Principle VII
   - Thick borders, box shadows, bold text
   - Reduced opacity + muted color for unrecognized items maintains brand
   - Infinity icon with yellow background, border, shadow

## Implementation Risks & Mitigations

**Risk**: Sorting logic not clear (recognized vs unrecognized ordering)
**Mitigation**: Sort recognized items by existing logic, append unrecognized items at end with `sort()` or manual concat

**Risk**: Existing inventory components may not support conditional rendering
**Mitigation**: Create separate `UnrecognizedItemRow` component, conditionally render based on `item.unrecognizedItemId !== null`

**Risk**: Help modal may be tightly coupled to existing content structure
**Mitigation**: Add new section with consistent styling, test manual rendering

**Risk**: Performance with 500 items (success criteria SC-005)
**Mitigation**: Defer pagination to post-MVP, rely on React 19 rendering optimizations, test with seed data

## Next Steps: Phase 1 Design

1. Create `data-model.md` documenting inventory item types
2. Generate API contracts for delete action
3. Create `quickstart.md` for development setup
4. Update agent context with new component/service paths
