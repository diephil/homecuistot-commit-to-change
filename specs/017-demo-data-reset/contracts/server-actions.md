# Server Actions Contract: Demo Data Reset

**Feature**: 017-demo-data-reset | **Date**: 2026-01-28

## startDemoData

**Location**: `apps/nextjs/src/app/actions/user-data.ts`

### Signature

```typescript
export async function startDemoData(): Promise<{
  success: boolean
  error?: string
}>
```

### Behavior

1. **Authentication** (required)
   - Get current user from Supabase Auth
   - Return `{ success: false, error: 'Unauthorized' }` if not authenticated

2. **Delete Existing Data** (within transaction)
   - Delete cooking_log where userId matches
   - Delete recipe_ingredients for user's recipes
   - Delete user_recipes where userId matches
   - Delete user_inventory where userId matches
   - Delete unrecognized_items where userId matches

3. **Lookup Ingredient IDs**
   - Query ingredients table for all demo ingredient names
   - Build name → id map for insertion

4. **Insert Demo Inventory**
   - Insert 21 user_inventory records with ingredient IDs

5. **Insert Demo Recipes**
   - Insert 6 user_recipes records
   - Capture returned recipe IDs

6. **Insert Recipe Ingredients**
   - Insert recipe_ingredients linking recipes to ingredients
   - Use ingredient type (anchor/optional) from demo data

7. **Revalidate Paths**
   - revalidatePath('/app')
   - revalidatePath('/app/recipes')
   - revalidatePath('/app/inventory')

8. **Return**
   - `{ success: true }` on success
   - `{ success: false, error: string }` on failure

### Error Handling

| Scenario | Response |
|----------|----------|
| Not authenticated | `{ success: false, error: 'Unauthorized' }` |
| No session | `{ success: false, error: 'No session' }` |
| Missing ingredient | `{ success: false, error: 'Missing ingredients: [names]' }` |
| DB error | `{ success: false, error: 'Failed to start demo' }` |

### Transaction Guarantee

All database operations MUST be wrapped in a single transaction:
- If any operation fails, all changes are rolled back
- User never ends up in partial state (deleted data but no demo data)
