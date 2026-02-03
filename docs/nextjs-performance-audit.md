# Next.js Performance Audit

Full analysis of the Next.js application covering caching, data fetching, rendering, loading states, client/server boundaries, and code quality.

---

## Chunk 1: Critical Caching Issues (Quick Wins)

**Priority: P0 | Effort: Low | Impact: High**

### 1.1 `force-dynamic` Disables All Caching
- **File**: `src/app/(protected)/app/page.tsx:4`
- **Issue**: `export const dynamic = 'force-dynamic'` forces every single request to hit the database. No ISR, no CDN caching, no streaming.
- **Fix**: Remove or replace with `export const revalidate = 60` (or appropriate interval) for Incremental Static Regeneration.

### 1.2 API Routes Missing Cache Headers
- **Files**:
  - `src/app/api/inventory/route.ts`
  - `src/app/api/recipes/agent-proposal/route.ts`
- **Issue**: GET handlers return `NextResponse.json()` with no `Cache-Control`, `ETag`, or `Last-Modified` headers. Browsers and CDN cannot cache responses.
- **Fix**: Add appropriate cache headers for GET endpoints (e.g. `Cache-Control: private, max-age=30, stale-while-revalidate=60`).

### 1.3 Aggressive Path Revalidation
- **File**: `src/app/actions/recipes.ts:106-107, 174-175, 237-238`
- **Issue**: Every recipe mutation triggers double revalidation of both `/app` **and** `/app/recipes`, causing unnecessary cascading invalidations.
- **Fix**: Use granular `revalidateTag()` instead of `revalidatePath()`.

---

## Chunk 2: Data Fetching Inefficiencies

**Priority: P1 | Effort: Medium-High | Impact: Critical**

### 2.1 Unbounded Recipe Fetches
- **File**: `src/app/actions/recipes.ts:35-46`
- **Issue**: `getRecipes()` fetches ALL user recipes with full ingredient graph (joined ingredient objects). No LIMIT, no pagination.
- **Impact**: Grows linearly with recipe count. Users with hundreds of recipes will see slow loads and high memory usage.
- **Fix**: Add pagination parameters (limit/offset) or cursor-based pagination.

### 2.2 In-Memory Recipe Availability Computation
- **File**: `src/app/actions/cooking-log.ts:31-116`
- **Issue**: Loads the entire recipe graph AND entire user inventory into JavaScript memory, then performs an O(recipes x ingredients) availability computation in-memory.
  - Lines 35-45: Full recipe + ingredient fetch
  - Lines 48-57: Full inventory fetch
  - Lines 67-115: JavaScript-side nested loop
- **Fix**: Move this computation to the database using SQL subqueries or CTEs for ingredient availability checks.

### 2.3 DELETE-ALL + INSERT-ALL on Recipe Updates
- **File**: `src/app/actions/recipes.ts:158-171`
- **Issue**: Every recipe update deletes ALL existing recipe ingredients and re-inserts all of them, even if only a single ingredient changed.
- **Fix**: Implement diff-based updates — only delete removed, update changed, insert new.

---

## Chunk 3: Client/Server Boundary Violations

**Priority: P2 | Effort: High | Impact: High**

### 3.1 Pages Marked `"use client"` That Should Be Server Components
- `src/app/(protected)/app/inventory/page.tsx:1`
- `src/app/(protected)/app/recipes/page.tsx:1`
- `src/app/(protected)/app/onboarding/page.tsx:1`
- `src/app/(auth)/login/page.tsx:1`

**Impact**:
- Entire component tree shipped as JavaScript to the browser
- No server-side streaming possible
- Larger JS bundle size
- Cannot use direct database access in the component

**Fix**: Convert page-level components to server components. Extract interactive parts (forms, toggles, modals) into focused client sub-components. Pass server-fetched data as props.

---

## Chunk 4: React Rendering Optimizations

**Priority: P2 | Effort: Medium | Impact: Medium**

### 4.1 Missing Memoization in RecipeCard
- **File**: `src/components/recipes/RecipeCard.tsx:33-37`
- **Issue**: Ingredients are sorted (`.sort()` + `.filter()`) on every single render. Component is not wrapped in `React.memo()`.
- **Fix**: Wrap with `React.memo()`, memoize `sortedIngredients` with `useMemo`.

### 4.2 Heavy State Manipulation in Inventory Page
- **File**: `src/app/(protected)/app/inventory/page.tsx:124-137, 165-178, 218-225`
- **Issue**: Every quantity change, staple toggle, or deletion remaps the entire inventory state array with `.map()`. No `useCallback` memoization on handlers.
- **Fix**: Use `useCallback` with stable references. Consider `useReducer` for complex state transitions.

### 4.3 Inefficient Recipes Page State
- **File**: `src/app/(protected)/app/recipes/page.tsx:126-139, 147-193, 277-279`
- **Issues**:
  - `handleIngredientToggle` does nested `.map()` on full state every toggle
  - `useCallback` has `[recipes]` dependency creating unstable function references
  - `.find()` called on every render to locate `selectedRecipe`
- **Fix**: Stabilize callback dependencies, memoize derived state.

### 4.4 Supabase Client Re-instantiated on Every Render
- **File**: `src/app/(auth)/login/page.tsx:30`
- **Issue**: `createClient()` and `getURL()` called inside the component body on every render.
- **Fix**: Move to module scope or wrap in `useMemo`.

---

## Chunk 5: Missing Loading States & Suspense

**Priority: P1 | Effort: Low | Impact: Medium**

### 5.1 No Suspense Boundaries
- **Issue**: Zero `<Suspense>` usage across the entire app directory.
- **Impact**: No progressive streaming. The entire page blocks on the slowest data source.
- **Fix**: Wrap async server components in `<Suspense fallback={<Skeleton />}>` boundaries.

### 5.2 Missing `loading.tsx` Files
- **Existing**: `app/(protected)/app/loading.tsx`, `app/(protected)/app/onboarding/loading.tsx`
- **Missing**:
  - `app/(protected)/app/inventory/loading.tsx`
  - `app/(protected)/app/recipes/loading.tsx`
- **Impact**: Users see a blank page while data loads.
- **Fix**: Add `loading.tsx` with appropriate skeleton UI for each route.

---

## Chunk 6: Code Quality

**Priority: P0 | Effort: Trivial | Impact: Medium**

### 6.1 `debugger` Statement in Production Code
- **File**: `src/app/(protected)/app/recipes/page.tsx:233`
- **Issue**: A `debugger` statement is left in the code. This can pause execution in browser DevTools in deployed environments.
- **Fix**: Remove immediately.

---

## Priority Roadmap

| Priority | Chunk | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Chunk 1 — Critical Caching Issues | Low | High |
| P0 | Chunk 6 — Remove `debugger` | Trivial | Medium |
| P1 | Chunk 2 — Data Fetching Inefficiencies | Medium-High | Critical |
| P1 | Chunk 5 — Loading States & Suspense | Low | Medium |
| P2 | Chunk 3 — Client/Server Boundaries | High | High |
| P2 | Chunk 4 — React Rendering | Medium | Medium |

---

## How to Use This Plan

Each chunk is designed to be tackled independently as a separate PR. Start with P0 items (Chunks 1 & 6) for immediate wins, then work through P1 and P2 items iteratively.
