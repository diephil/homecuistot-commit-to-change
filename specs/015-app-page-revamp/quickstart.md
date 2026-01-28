# Quickstart: App Page Revamp

**Feature**: 015-app-page-revamp | **Date**: 2026-01-28

## Prerequisites

- Node.js 20+
- pnpm
- Supabase local or connection to cloud instance
- User account with at least 1 recipe OR 1 inventory item

## Setup

```bash
# From repo root
cd apps/nextjs

# Install dependencies (if not already)
pnpm install

# Start dev server
pnpm dev
```

## Key Files to Modify/Create

### 1. Layout Navigation (MODIFY)
`src/app/(protected)/app/layout.tsx`
- Import and add `<AppNavigation />` component
- Keep existing header structure, add nav items

### 2. Main Page (MODIFY)
`src/app/(protected)/app/page.tsx`
- Replace current content with 4 sections:
  1. Available Recipes (top)
  2. Almost Available Recipes
  3. Cooking History (table format, last 10)
- Add redirect logic for empty users

### 3. New Components (CREATE)

```
src/components/app/
├── app-navigation.tsx       # Nav links with active state
├── recipe-availability-card.tsx  # Shared card component
├── mark-cooked-modal.tsx    # Cooking confirmation modal
└── cooking-history-table.tsx    # Neo-brutalist table for last 10 logs
```

### 4. Server Action (CREATE)
`src/app/actions/cooking-log.ts`
- `getRecipesWithAvailability()` - fetch recipes + compute availability
- `markRecipeAsCooked()` - log + update inventory
- `getCookingHistory()` - last 10 entries

### 5. Types (CREATE)
`src/types/cooking.ts`
- `RecipeWithAvailability`
- `CookingLogEntry`
- `MarkCookedPayload`
- `IngredientDiff`

## Development Flow

1. **Types first**: Create `src/types/cooking.ts` with interfaces
2. **Server actions**: Implement data fetching in `src/app/actions/cooking-log.ts`
3. **Navigation**: Create `AppNavigation` and add to layout
4. **Main page**: Update page.tsx with redirect + 4 sections
5. **Cards**: Create `RecipeAvailabilityCard` component
6. **Modal**: Create `MarkCookedModal` with quantity adjustment
7. **Table**: Create `CookingHistoryTable` component

## Testing Checklist

### Manual Tests

- [ ] User with no recipes/inventory → redirected to /onboarding
- [ ] User with recipes but no inventory → stays on /app
- [ ] Available recipes show at top with "Mark as Cooked" button
- [ ] Almost-available recipes show missing ingredients (1-2 max)
- [ ] Recipes missing 3+ anchors NOT shown
- [ ] Navigation highlights correct active page
- [ ] Mark as Cooked modal shows ingredient diffs
- [ ] Quantity adjustment works (tap to cycle 0-3)
- [ ] Save creates cooking_log entry
- [ ] Save updates inventory quantities
- [ ] Cooking history table shows last 10 entries
- [ ] Cooking history table displays recipe name and date columns

### Test Data Setup

```sql
-- Ensure user has recipes with varying ingredient availability
-- Recipe 1: All anchors in inventory → "available"
-- Recipe 2: Missing 1 anchor → "almost-available"
-- Recipe 3: Missing 2 anchors → "almost-available"
-- Recipe 4: Missing 3+ anchors → NOT shown
```

## Component Patterns

### Neo-Brutalism Card (Available)
```tsx
<div className="border-4 border-black bg-gradient-to-br from-green-200 to-green-300
  shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
  <h3 className="text-xl font-black">{recipe.name}</h3>
  <p className="text-sm font-bold">{recipe.description}</p>
  <div className="flex flex-wrap gap-1 my-2">
    {recipe.ingredients.map(ing => (
      <Badge variant="outline" key={ing.id}>{ing.name}</Badge>
    ))}
  </div>
  <Button className="w-full" onClick={() => openModal(recipe)}>
    Mark as Cooked
  </Button>
</div>
```

### Neo-Brutalism Card (Almost Available)
```tsx
<div className="border-4 border-black bg-gradient-to-br from-yellow-200 to-orange-200
  shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4">
  <h3 className="text-xl font-black">{recipe.name}</h3>
  <p className="text-sm font-bold">{recipe.description}</p>
  <div className="mt-2 p-2 bg-white/50 border-2 border-black">
    <span className="text-sm font-black">Missing: </span>
    {recipe.missingAnchorNames.join(', ')}
  </div>
</div>
```

### Navigation Active State
```tsx
const pathname = usePathname();
const isActive = (path: string) =>
  path === '/app' ? pathname === '/app' : pathname.startsWith(path);

<Link href="/app" className={cn(
  "px-3 py-2 font-bold border-2 border-black",
  isActive('/app') ? "bg-pink-400" : "bg-white hover:bg-pink-100"
)}>
  Home
</Link>
```

### Neo-Brutalism Table (Cooking History)
```tsx
<div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
  <div className="bg-cyan-200 p-3 border-b-4 border-black">
    <h3 className="text-xl font-black uppercase">Cooking History (Last 10)</h3>
  </div>
  <table className="w-full">
    <thead className="bg-gray-100 border-b-4 border-black">
      <tr>
        <th className="p-3 text-left font-black border-r-2 border-black">Recipe</th>
        <th className="p-3 text-left font-black">Cooked</th>
      </tr>
    </thead>
    <tbody>
      {cookingHistory.map((entry, i) => (
        <tr key={entry.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
          <td className="p-3 font-bold border-r-2 border-black border-t-2">{entry.recipeName}</td>
          <td className="p-3 font-bold border-t-2 border-black">{formatDate(entry.cookedAt)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

## Troubleshooting

**Issue**: Redirect loop on /app
**Fix**: Check redirect condition is `recipes.length === 0 AND inventory.length === 0`

**Issue**: Modal not updating quantities
**Fix**: Ensure IngredientBadge has `interactive={true}` prop

**Issue**: Cooking log not created
**Fix**: Verify transaction includes both INSERT and UPDATE operations
