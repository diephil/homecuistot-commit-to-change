# Quickstart: Unrecognized Items Display

**Feature**: 001-unrecognized-items-display
**Date**: 2026-01-31

## Prerequisites

- Node.js 18+ with pnpm installed
- Supabase project with database migrations applied (user_inventory, unrecognized_items tables exist)
- Environment variables configured in `apps/nextjs/.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `GOOGLE_GENERATIVE_AI_API_KEY` (for other features)

## Development Setup

### 1. Install Dependencies

```bash
cd /path/to/homecuistot-commit-to-change
pnpm install
```

### 2. Verify Database Schema

Ensure migrations are applied:

```bash
cd apps/nextjs
pnpm db:status
```

Expected output should show migrations including:
- `0018_unrecognized_items_schema` (or similar)
- `user_inventory` table with XOR constraint

If migrations are missing:

```bash
pnpm db:migrate
```

### 3. Seed Test Data (Optional)

Create test unrecognized items for development:

```sql
-- Run in Supabase SQL Editor or via pnpm db:studio

-- Get your user ID
SELECT id FROM auth.users LIMIT 1;

-- Insert test unrecognized item
INSERT INTO unrecognized_items (user_id, raw_text, context)
VALUES ('YOUR_USER_ID', 'mystery spice blend', 'from recipe import');

-- Get the unrecognized item ID
SELECT id FROM unrecognized_items WHERE raw_text = 'mystery spice blend';

-- Add to user inventory
INSERT INTO user_inventory (user_id, unrecognized_item_id, quantity_level)
VALUES ('YOUR_USER_ID', 'UNRECOGNIZED_ITEM_ID', 2);
```

### 4. Run Development Server

```bash
cd apps/nextjs
pnpm dev
```

Visit: `http://localhost:3000/app/inventory`

## File Locations

### Components (Create These)

```
apps/nextjs/src/components/
├── shared/                           # NEW - Reusable components per user instruction
│   ├── UnrecognizedItemRow.tsx       # Display unrecognized item with restricted UI
│   └── PantryStapleIcon.tsx          # Infinity icon wrapper component
└── inventory/                        # EXISTING - Modify existing inventory components
    └── InventoryList.tsx             # Update to render UnrecognizedItemRow
```

### Services (Create These)

```
apps/nextjs/src/lib/services/
└── unrecognized-items.service.ts     # NEW - Delete, fetch logic
```

### Server Actions (Create These)

```
apps/nextjs/src/app/actions/
└── inventory.actions.ts              # NEW - Server action for delete
```

### Types (Create These)

```
apps/nextjs/src/types/
└── inventory.types.ts                # NEW - Derived types from Drizzle schema
```

### Existing Files to Modify

```
apps/nextjs/src/app/(protected)/app/inventory/page.tsx    # Modify: fetch unrecognized items
apps/nextjs/src/components/[HelpModal location]           # Modify: add unrecognized items section
```

## Development Workflow

### 1. Create Type Definitions

Start with `apps/nextjs/src/types/inventory.types.ts`:

```typescript
import { userInventory, ingredients, unrecognizedItems } from '@/db/schema';

export type InventoryItemWithRelations = typeof userInventory.$inferSelect & {
  ingredient: (typeof ingredients.$inferSelect) | null;
  unrecognizedItem: (typeof unrecognizedItems.$inferSelect) | null;
};

export function isUnrecognizedItem(item: InventoryItemWithRelations): boolean {
  return item.unrecognizedItemId !== null;
}

export type DeleteUnrecognizedItemParams = {
  userId: string;
  inventoryId: string;
};
```

### 2. Create Service Layer

Create `apps/nextjs/src/lib/services/unrecognized-items.service.ts`:

```typescript
import { db } from '@/db';
import { userInventory } from '@/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';
import type { DeleteUnrecognizedItemParams } from '@/types/inventory.types';

export async function deleteUnrecognizedInventoryItem(
  params: DeleteUnrecognizedItemParams
): Promise<void> {
  const { userId, inventoryId } = params;

  await db.delete(userInventory)
    .where(and(
      eq(userInventory.id, inventoryId),
      eq(userInventory.userId, userId),
      isNotNull(userInventory.unrecognizedItemId)
    ));
}
```

### 3. Create Server Action

Create `apps/nextjs/src/app/actions/inventory.actions.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { deleteUnrecognizedInventoryItem } from '@/lib/services/unrecognized-items.service';
import type { DeleteUnrecognizedItemParams } from '@/types/inventory.types';

export async function deleteUnrecognizedItem(params: DeleteUnrecognizedItemParams) {
  try {
    await deleteUnrecognizedInventoryItem(params);
    revalidatePath('/app/inventory');
    return { success: true };
  } catch (error) {
    console.error('Delete failed:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}
```

### 4. Create Reusable Components

**PantryStapleIcon.tsx**:

```typescript
import { Infinity } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <Infinity className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
    </div>
  );
}
```

**UnrecognizedItemRow.tsx**:

```typescript
'use client';

import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UnrecognizedInventoryItem } from '@/types/inventory.types';

interface Props {
  item: UnrecognizedInventoryItem;
  onDelete: (itemId: string) => void;
}

export function UnrecognizedItemRow({ item, onDelete }: Props) {
  return (
    <div className={cn(
      "border-4 md:border-6 border-gray-400 p-4 mb-2",
      "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      "opacity-50 text-gray-500 pointer-events-auto"
    )}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">{item.unrecognizedItem.rawText}</span>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 hover:bg-red-100 transition-colors pointer-events-auto"
          aria-label="Delete unrecognized item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

### 5. Update Inventory Page

Modify `apps/nextjs/src/app/(protected)/app/inventory/page.tsx`:

```typescript
import { db } from '@/db';
import { userInventory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isUnrecognizedItem } from '@/types/inventory.types';
import { UnrecognizedItemRow } from '@/components/shared/UnrecognizedItemRow';

export default async function InventoryPage() {
  const { userId } = await getUser(); // Your existing auth logic

  const inventory = await db.query.userInventory.findMany({
    where: eq(userInventory.userId, userId),
    with: {
      ingredient: true,
      unrecognizedItem: true,
    },
  });

  const recognized = inventory.filter(item => !isUnrecognizedItem(item));
  const unrecognized = inventory.filter(isUnrecognizedItem);

  return (
    <div>
      {/* Existing recognized items rendering */}
      {recognized.map(item => <InventoryRow key={item.id} item={item} />)}

      {/* NEW: Unrecognized items section */}
      {unrecognized.length > 0 && (
        <section className="mt-8 border-t-4 border-black pt-8">
          <h3 className="text-2xl font-black uppercase mb-4">Unrecognized Items</h3>
          {unrecognized.map(item => (
            <UnrecognizedItemRow key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </section>
      )}
    </div>
  );
}
```

## Testing Checklist

### Manual Testing (Required per MVP Constitution)

- [ ] **Display**: Unrecognized items appear at end of inventory list
- [ ] **Visual Distinction**: Items have reduced opacity + muted text color
- [ ] **No Interaction**: Cannot click item, quantity controls disabled
- [ ] **Delete Works**: Clicking delete removes item from UI and database
- [ ] **Delete Preserves Record**: Unrecognized_items table record still exists after delete
- [ ] **Error Handling**: Network failure shows error toast
- [ ] **Pantry Staple Icon**: Infinity icon appears for pantry staples (not star)
- [ ] **Hint Text**: Hint text visible below pantry staples section
- [ ] **Help Modal**: "?" button opens modal with unrecognized items section

### Performance Testing (Success Criteria)

- [ ] **SC-001**: Inventory loads in <2 seconds with unrecognized items
- [ ] **SC-005**: Page loads with 500 items in <3 seconds (seed large dataset)

## Troubleshooting

### Issue: Unrecognized items not appearing

**Check**:
1. Database query includes `with: { unrecognizedItem: true }`
2. Item has `unrecognizedItemId` set (not NULL)
3. User ID matches authenticated user

### Issue: Delete doesn't work

**Check**:
1. Server action called with correct `userId` and `inventoryId`
2. `isNotNull(userInventory.unrecognizedItemId)` in WHERE clause
3. Check browser console for error messages
4. Verify Supabase connection in server logs

### Issue: Visual styling not applied

**Check**:
1. `opacity-50` and `text-gray-500` classes applied to container div
2. Tailwind config includes opacity utilities
3. `isUnrecognizedItem()` type guard returns true

### Issue: Infinity icon not showing

**Check**:
1. `lucide-react` version supports `Infinity` icon (v0.460+)
2. Import statement: `import { Infinity } from 'lucide-react';`
3. PantryStapleIcon component renders correctly

## Deployment

### Pre-Deploy Checklist

- [ ] TypeScript compilation succeeds: `pnpm build`
- [ ] Manual testing complete (checklist above)
- [ ] Database migrations applied to production
- [ ] Environment variables set in Vercel

### Deploy Command

```bash
# From repo root
pnpm build
vercel deploy --prod
```

## Next Steps

After manual testing complete:

1. Run `/speckit.tasks` to generate task breakdown
2. Implement tasks in priority order (P1 → P2 → P3 → P4)
3. Commit with message: `feat: display unrecognized items in inventory`
4. Create PR when all acceptance scenarios pass
