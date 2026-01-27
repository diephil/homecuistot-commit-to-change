# Quickstart: Inventory Page Rework

**Feature**: 014-inventory-page-rework | **Branch**: `014-inventory-page-rework`

## Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase local running (`make sbstart`)
- Opik running (`make opstart`) for LLM tracing
- Environment variables configured in `apps/nextjs/.env.local`

## Quick Setup

```bash
# From repo root
make dev-all  # Starts Next.js + Opik + Supabase

# Or individually
cd apps/nextjs
pnpm dev
```

## Key Files to Modify

### 1. Types (First)
```
apps/nextjs/src/types/inventory.ts  # Create new
```

### 2. LLM Prompt + Opik Registration
```
apps/nextjs/src/lib/prompts/inventory-update/prompt.ts   # Create new
apps/nextjs/src/lib/prompts/inventory-update/process.ts  # Create new
apps/nextjs/scripts/register-inventory-prompt.ts         # Create new
```

**Register prompt to Opik**:
```bash
pnpm prompt:inventory       # Local Opik
pnpm prompt:inventory:prod  # Production Opik
```

### 3. API Routes
```
apps/nextjs/src/app/api/inventory/process-voice/route.ts  # Create new
apps/nextjs/src/app/api/inventory/process-text/route.ts   # Create new
apps/nextjs/src/app/api/inventory/validate/route.ts       # Create new
apps/nextjs/src/app/api/inventory/batch/route.ts          # Create new
apps/nextjs/src/app/api/inventory/[id]/route.ts           # Create new (DELETE)
apps/nextjs/src/app/api/inventory/[id]/toggle-staple/route.ts  # Create new
```

### 4. Server Actions
```
apps/nextjs/src/app/actions/inventory.ts  # Extend existing
```

### 5. Components
```
apps/nextjs/src/components/inventory/inventory-section.tsx      # Create new
apps/nextjs/src/components/inventory/inventory-update-modal.tsx # Create new
apps/nextjs/src/components/inventory/update-confirmation.tsx    # Create new
apps/nextjs/src/components/inventory/quantity-selector.tsx      # Create new
apps/nextjs/src/components/inventory/help-modal.tsx             # Create new
```

### 6. Page
```
apps/nextjs/src/app/(protected)/app/inventory/page.tsx  # Rewrite
```

## Implementation Order

1. **Types** - Define schemas and interfaces
2. **LLM Prompt** - Inventory update extraction prompt
3. **Opik Registration** - Script + npm scripts in package.json
4. **API Routes** - Process voice/text, validate, batch
5. **Components** - Build from leaf to container
6. **Page** - Wire everything together

## npm Scripts to Add

Add to `apps/nextjs/package.json`:
```json
{
  "scripts": {
    "prompt:inventory": "tsx --env-file=.env.local scripts/register-inventory-prompt.ts",
    "prompt:inventory:prod": "tsx --env-file=.env.prod scripts/register-inventory-prompt.ts"
  }
}
```

Update `prompt:all` and `prompt:all:prod` to include inventory prompt.

## Testing Locally

### Manual Testing Checklist

1. **View Inventory**
   - Open `/app/inventory`
   - Verify two sections render
   - Verify badges show correct levels

2. **Manual Quantity Adjust**
   - Click any ingredient badge
   - Select new quantity
   - Verify change persists (refresh page)

3. **Voice Update**
   - Click "Update Inventory"
   - Record: "I just bought milk and eggs"
   - Verify proposal shows milk and eggs at level 3
   - Confirm and verify badges update

4. **Text Update**
   - Switch to text mode
   - Type: "Ran out of cheese"
   - Verify proposal shows cheese at level 0

5. **Pantry Staples**
   - Toggle an item to pantry staples
   - Verify it moves to staples section

6. **Delete Item**
   - Remove an item
   - Verify it disappears (not just level 0)

## Database Seed (Optional)

If testing with fresh database:

```sql
-- Add some inventory items for testing
INSERT INTO user_inventory (user_id, ingredient_id, quantity_level, is_pantry_staple)
SELECT
  'your-user-uuid',
  id,
  floor(random() * 4)::int,
  random() < 0.2
FROM ingredients
WHERE name IN ('tomato', 'onion', 'garlic', 'olive oil', 'salt', 'pepper', 'egg', 'milk', 'cheese', 'butter');
```

## Common Issues

### Voice Not Working
- Check browser microphone permissions
- Try HTTPS (some browsers require)
- Fallback to text input

### LLM Errors
- Check `GOOGLE_GENERATIVE_AI_API_KEY` is set
- View Opik dashboard at http://localhost:5173 for traces
- Check API route logs in terminal

### Database Errors
- Run `pnpm db:status` to check migrations
- Ensure Supabase is running: `make sbstart`

## Reference Patterns

### Modal Pattern (from recipe-form.tsx)
```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4">
    {/* content */}
  </Card>
</div>
```

### Voice Processing (from process-voice/route.ts)
```typescript
const { audioBase64 } = await request.json();
const result = await processVoiceInventory({ audioBase64 });
return NextResponse.json(result);
```

### Batch Upsert (from inventory.ts actions)
```typescript
await db.insert(userInventory)
  .values(updates)
  .onConflictDoUpdate({
    target: [userInventory.userId, userInventory.ingredientId],
    set: { quantityLevel: sql`excluded.quantity_level` }
  });
```
