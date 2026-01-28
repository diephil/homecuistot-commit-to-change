# Research: App Page Revamp

**Feature**: 015-app-page-revamp | **Date**: 2026-01-28

## Research Summary

All technical decisions are based on existing codebase patterns. No external research needed - feature builds on established infrastructure.

---

## 1. Recipe Availability Query Strategy

**Decision**: Single server-side query with in-memory categorization

**Rationale**:
- Existing `getRecipes()` fetches all user recipes with ingredients
- User inventory query already exists via Drizzle
- Join data in server component, categorize by missing anchor count
- Avoids multiple roundtrips; scale is small (~50 recipes, ~100 inventory items)

**Alternatives Considered**:
- SQL view for availability → Rejected: adds schema complexity for MVP
- Client-side filtering → Rejected: unnecessary data transfer, slower UX

---

## 2. Navigation Active State Pattern

**Decision**: Use Next.js `usePathname()` hook with path matching

**Rationale**:
- Standard Next.js pattern for active navigation states
- Already used in codebase (login/redirect flows)
- Simple string comparison: `pathname === '/app'` or `pathname.startsWith('/app/recipes')`

**Alternatives Considered**:
- CSS-only with `:target` → Rejected: doesn't work with client-side navigation
- Context-based active state → Rejected: overkill for 3 nav items

---

## 3. Mark as Cooked Modal Architecture

**Decision**: Multi-stage modal following InventoryUpdateModal pattern

**Rationale**:
- Existing pattern: stage-based state machine (confirmation → processing → success)
- Reuse IngredientBadge with interactive quantity adjustment
- Single POST to `/api/cooking-log` handles both log entry + inventory batch update

**Modal Flow**:
1. **Confirmation stage**: Show recipe name, ingredient list with quantity diffs
2. **Processing stage**: Loading indicator while API call executes
3. **Success**: Close modal, refresh page data via `revalidatePath`

**Alternatives Considered**:
- Inline confirmation (no modal) → Rejected: doesn't support quantity adjustment UX
- Separate API calls (log + inventory) → Rejected: risk of partial failure

---

## 4. Inventory Quantity Decrement Logic

**Decision**: Default decrement by 1 level, user adjustable before save

**Rationale**:
- Matches user expectation: "I used some of this ingredient"
- QuantityLevel is 0-3, so decrement means `max(0, current - 1)`
- Allow user override for: didn't use all, used more than expected, already restocked

**Implementation**:
```typescript
// Initial proposed quantity for each anchor ingredient
const proposedQuantity = Math.max(0, currentQuantity - 1);

// User can tap IngredientBadge to cycle: 0 → 1 → 2 → 3 → 0
```

**Alternatives Considered**:
- Set to 0 on cook → Rejected: too aggressive, user may have extras
- Ask for exact amount used → Rejected: MVP scope, quantity levels are abstract (0-3)

---

## 5. Redirect Logic Placement

**Decision**: Server-side redirect in layout.tsx using Drizzle queries

**Rationale**:
- Check at layout level catches all /app/* routes
- Server component can query DB synchronously
- Use `redirect()` from next/navigation for immediate redirect
- Condition: `recipes.length === 0 && inventoryItems.length === 0`

**Alternatives Considered**:
- Middleware redirect → Rejected: can't easily query DB in edge middleware
- Client-side redirect → Rejected: flickers empty page before redirect

---

## 6. Component Reusability Strategy

**Decision**: Create shared `RecipeAvailabilityCard` for both sections

**Rationale**:
- Available and Almost-Available cards share: title, description, ingredients display
- Differ only in: CTA button (Mark as Cooked vs missing ingredients list)
- Single component with `variant` prop: `'available' | 'almost-available'`

**Shared Components**:
- `AppNavigation` - used in layout.tsx for all /app routes
- `RecipeAvailabilityCard` - used in main page for both sections
- `MarkCookedModal` - triggered from available recipe cards

---

## 7. Cooking History Section

**Decision**: Query last 10 entries from cooking_log, display in neo-brutalist table format

**Rationale**:
- cooking_log has cookedAt timestamp, indexed by (userId, cookedAt DESC)
- recipeName stored in log (handles deleted recipes)
- Table format (not cards) for compact history view
- Section title includes count: "Cooking History (Last 10)"

**Query Pattern**:
```typescript
const recentCooks = await db
  .select()
  .from(cookingLog)
  .where(eq(cookingLog.userId, userId))
  .orderBy(desc(cookingLog.cookedAt))
  .limit(10);
```

**Table Columns**: Recipe Name | Cooked Date

---

## 8. Neo-Brutalism Styling Approach

**Decision**: Extend existing RetroUI components, follow constitution patterns

**Rationale**:
- Constitution VII defines vibrant neobrutalism: thick borders, shadows, gradients
- Existing components (Button, Card, Badge, IngredientBadge) already styled
- New components follow same patterns: `border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`

**Color Scheme**:
- Available recipes: Green gradient (success state)
- Almost-available: Yellow/orange gradient (warning state)
- Cooking history table: White/neutral with thick black borders

---

## Technology Decisions Summary

| Decision | Choice | Source |
|----------|--------|--------|
| Data fetching | Server components + Drizzle | Existing pattern |
| Navigation state | usePathname() | Next.js standard |
| Modal pattern | Multi-stage with IngredientBadge | InventoryUpdateModal |
| API design | Single POST endpoint | Existing batch pattern |
| Styling | RetroUI + Constitution VII | Existing components |
| Redirect | Server-side in layout | Next.js redirect() |

**No NEEDS CLARIFICATION items remain. Proceeding to Phase 1.**
