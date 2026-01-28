# Research: Demo Data Reset

**Feature**: 017-demo-data-reset | **Date**: 2026-01-28

## R1: Ingredient Name Lookup Strategy

**Decision**: Use exact name match with ILIKE for case-insensitivity

**Rationale**:
- Ingredients table has 5931 entries with unique `name` column
- Demo data uses common ingredient names (egg, milk, butter, etc.)
- Drizzle ORM supports `ilike` operator for case-insensitive matching
- Single query to fetch all ingredient IDs by name array

**Alternatives Considered**:
- Hardcode ingredient UUIDs: Rejected - fragile, IDs may differ between environments
- Fuzzy search: Rejected - overkill, exact names sufficient for demo data

**Implementation**:
```typescript
const ingredientNames = ['egg', 'milk', 'butter', ...]
const foundIngredients = await tx
  .select({ id: ingredients.id, name: ingredients.name })
  .from(ingredients)
  .where(inArray(ingredients.name, ingredientNames))
```

## R2: Transaction Pattern for Insert After Delete

**Decision**: Single transaction wrapping delete + insert operations

**Rationale**:
- Existing `resetUserData` uses `db(async (tx) => { ... })` pattern
- All operations must be atomic: if insert fails, delete should rollback
- Drizzle transaction callback provides automatic rollback on error

**Alternatives Considered**:
- Separate transactions: Rejected - user could end up with empty account on partial failure
- Delete-only then separate insert: Rejected - race condition risk, not atomic

**Implementation**:
```typescript
await db(async (tx) => {
  // 1. Delete existing data (same as resetUserData)
  await tx.delete(cookingLog).where(eq(cookingLog.userId, userId))
  // ... other deletes

  // 2. Insert demo data
  await tx.insert(userInventory).values(demoInventoryData)
  await tx.insert(userRecipes).values(demoRecipesData).returning({ id: userRecipes.id })
  await tx.insert(recipeIngredients).values(demoRecipeIngredientsData)
})
```

## R3: Modal Component Extraction

**Decision**: Create shared `ConfirmationModal` component with configurable props

**Rationale**:
- Existing `ResetUserDataButton` has inline modal (lines 45-77)
- New `StartDemoButton` needs identical modal structure
- DRY principle: extract once, use twice
- Props: title, message, confirmText, confirmColor, onConfirm, onCancel, isLoading

**Alternatives Considered**:
- Duplicate modal code: Rejected - violates DRY, maintenance burden
- Headless UI library: Rejected - overkill for two modals, adds dependency

**Implementation**:
```typescript
interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  confirmButtonClass: string
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}
```

## R4: Post-Action Navigation

**Decision**: Stay on /app page, trigger revalidation + router.refresh()

**Rationale**:
- User wants to see demo data immediately after insertion
- Existing resetUserData redirects to onboarding - different use case
- Demo mode should show "What Can I Cook" with demo recipes
- revalidatePath + client-side refresh ensures fresh data

**Alternatives Considered**:
- Hard navigation (window.location.href): Rejected - loses React state, slower
- Redirect to onboarding: Rejected - defeats purpose of demo mode

**Implementation**:
```typescript
// Server action
revalidatePath('/app')
revalidatePath('/app/recipes')
revalidatePath('/app/inventory')
return { success: true }

// Client component
const router = useRouter()
if (result.success) {
  router.refresh() // Triggers re-render with new data
}
```

## R5: Button Placement and Styling

**Decision**: Blue button next to red reset button, both centered at page bottom

**Rationale**:
- User specified: "bottom next to the button to reset all user data"
- Blue color distinguishes from destructive red action
- Neo-brutalist style per constitution: thick borders, solid shadows

**Implementation**:
```tsx
// page.tsx - modify existing section
<section className="flex justify-center gap-4 pt-8">
  <StartDemoButton />
  <ResetUserDataButton />
</section>
```

Button styling (blue neo-brutalist):
```tsx
className="px-4 py-2 font-bold border-4 border-black bg-blue-400 hover:bg-blue-500
  text-white text-sm cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
```
