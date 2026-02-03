# Code Quality Refactoring Plan

## Executive Summary

A comprehensive code quality audit identified ~300-400 lines of duplicate code, 12 dead exports, scattered type definitions across 15+ files, and 4 oversized components. This issue tracks the refactoring plan organized into 5 phases.

| Category | Issues Found | Severity |
|----------|--------------|----------|
| Duplicate Authentication Logic | 7+ API routes | 🔴 High |
| Scattered Type Definitions | 15+ files | 🔴 High |
| Dead Code (Unused Exports) | 12 exports | 🟡 Medium |
| Large Components (>250 lines) | 4 components | 🟡 Medium |
| Debug Console Statements | 53 occurrences | 🟡 Medium |
| Inconsistent Error Handling | All API routes | 🟡 Medium |
| Business Logic in Route Handlers | 4 routes | 🟡 Medium |
| Missing Input Validation | 6 routes | 🟡 Medium |
| ESLint Rule Disables | 6 occurrences | 🟢 Low |

---

## Phase 1: Quick Wins

**Scope:** Remove dead code and fix naming issues.

### 1.1 Remove debug `console.log` from `login/page.tsx`
- `app/(auth)/login/page.tsx:15` — `console.log({ url })`
- `app/(auth)/login/page.tsx:25` — `console.log({ url })`

### 1.2 Delete 12 unused type exports

**`types/recipe-agent.ts`** — 7 type guards never imported:
- `isCreateRecipeResult()` (line 280)
- `isUpdateRecipeResult()` (line 289)
- `isDeleteRecipeResult()` (line 298)
- `isDeleteAllRecipesResult()` (line 307)
- `isCreateRecipesResult()` (line 316)
- `isUpdateRecipesResult()` (line 325)
- `isDeleteRecipesResult()` (line 334)

**`types/inventory.ts`** — 2 type guards never imported:
- `isUnrecognizedItem()` (line 102)
- `isRecognizedItem()` (line 111)

**`types/recipes.ts`** — 3 unused exports:
- `validationResultSchema` (line 25)
- `ValidationResult` (line 57)
- `RecipeIngredient` (line 55)

### 1.3 Remove commented-out code
- `lib/tracing/opik-agent.ts:60` — `// interface ToolSpanParams extends BaseSpanParams {}`
- `lib/tracing/opik-agent.ts:66` — `// createToolSpan(params: ToolSpanParams): Span;`
- `lib/tracing/opik-agent.ts:82-83` — `// createToolSpan: (params) => trace.span(...)`

### 1.4 Fix naming issue
- `components/shared/Badge.tsx:25` — rename `ButtonProps` → `BadgeProps`

---

## Phase 2: Auth Consolidation

**Scope:** Extract duplicated authentication boilerplate into a shared utility.

### Problem

The same 10-15 lines of auth + DB setup are repeated across 13+ files:

```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const { data: { session } } = await supabase.auth.getSession();
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const token = decodeSupabaseToken(session.access_token);
const db = createUserDb(token);
```

### Solution

Create `lib/utils/auth.ts`:
```typescript
export async function getAuthenticatedDb() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new UnauthorizedError();
  return { user, db: createUserDb(decodeSupabaseToken(session.access_token)) };
}
```

### Affected files
- `app/api/inventory/route.ts`
- `app/api/inventory/[id]/route.ts`
- `app/api/inventory/agent-proposal/route.ts`
- `app/api/inventory/apply-proposal/route.ts`
- `app/api/recipes/agent-proposal/route.ts`
- `app/api/recipes/apply-proposal/route.ts`
- `app/actions/inventory.ts` (3 occurrences)
- `app/actions/recipes.ts` (6 occurrences)

---

## Phase 3: Type Centralization

**Scope:** Consolidate scattered type definitions into the `types/` directory.

### 3.1 Fix duplicate types
| Type | Duplicate Location | Canonical Location |
|------|-------------------|-------------------|
| `QuantityLevel` | `components/shared/IngredientBadge.tsx:8` | `types/inventory.ts` |
| `Recipe`, `RecipeIngredient` | `components/recipes/RecipeCard.tsx:8,15` | DB schema types |
| `InventorySessionItem` | `lib/agents/inventory-manager/tools/update-matching-ingredients.ts:21` | Move to `types/inventory.ts` |

### 3.2 Create `types/agent-params.ts`
Consolidate from:
- `lib/agents/inventory-manager/agent.ts:14` — `CreateInventoryAgentParams`
- `lib/agents/ingredient-extractor/agent.ts:18` — `IngredientExtractorAgentParams`
- `lib/agents/voice-transcriptor/agent.ts:17` — `VoiceTranscriptorAgentParams`

### 3.3 Create `types/orchestration.ts`
Consolidate from:
- `lib/orchestration/inventory-update.orchestration.ts:16` — `CreateProposalParams`, `CreateProposalResult`
- `lib/orchestration/recipe-update.orchestration.ts:21` — `CreateRecipeProposalParams`, `CreateRecipeProposalResult`

### 3.4 Unify recipe form shapes
Three components define inline recipe shapes that should share a single type:
- `RecipeCreateForm.tsx:7-19`
- `RecipeEditForm.tsx:14-27`
- `RecipeForm.tsx:7-22`

---

## Phase 4: Component Splitting

**Scope:** Break down oversized components and extract constants.

### 4.1 Split large components

| Component | Lines | Action |
|-----------|-------|--------|
| `RecipeProposalModal.tsx` | 446 | Extract `RecipeProposalCard`, `expandBatchResults` util |
| `RecipeCreateForm.tsx` | 300 | Extract voice input section |
| `VoiceTextInput.tsx` | 267 | Extract state management hook |
| `RecipeEditForm.tsx` | 265 | Extract ingredient management section |
| `IngredientBadge.tsx` | 236 | Extract 3 variants (Battery, Dots, Fill) |

### 4.2 Extract magic numbers to constants

| File | Value | Proposed Constant |
|------|-------|-----------|
| `VoiceInput.tsx:59` | `"1:00"` | `RECORDING_MAX_SECONDS` |
| `CookingHistoryTable.tsx:38` | `"Last 10"` | `HISTORY_LIMIT` |
| `RecipeProposalModal.tsx:206` | `1000ms` | `MODAL_SUCCESS_DELAY` |
| `MarkCookedModal.tsx:89` | `1000ms` | `MODAL_CLOSE_DELAY` |

### 4.3 Reduce prop drilling
`QuickInputSection.tsx` passes 10+ props — group into config objects:
```typescript
{ inputConfig, callbacks, voiceGuidanceConfig }
```

---

## Phase 5: Service Layer Extraction

**Scope:** Move business logic out of route handlers into dedicated services.

### 5.1 Create `lib/services/recipe-applier.ts`
Extract from `app/api/recipes/apply-proposal/route.ts:113-229`:
- `handleCreate`, `handleUpdate`, `handleDelete`, `handleDeleteAll`
- 116+ lines of business logic currently in the route

### 5.2 Create `lib/services/onboarding-persister.ts`
Extract from `app/api/onboarding/persist/route.ts:77-218`:
- 140+ lines of ingredient matching and data persistence

### 5.3 Extract shared deletion logic
`app/actions/user-data.ts` — `resetUserData()` and `startDemoData()` share identical deletion sequence (lines 37-64 vs 100-115):
```typescript
async function deleteAllUserData(userId: string, tx: Transaction) { ... }
```

### 5.4 Standardize API response format
Different routes return different structures:
- `inventory/route.ts`: `{ success: true, item: result }`
- `inventory/apply-proposal/route.ts`: `{ success: true, updated: count }`
- `recipes/apply-proposal/route.ts`: `{ success, created, updated, deleted, errors? }`

Consider a standardized response wrapper.

### 5.5 Add input validation
Routes missing schema validation:
- `inventory/agent-proposal/route.ts:29-31`
- `recipes/agent-proposal/route.ts:31-39`
- `recipes/process-text/route.ts:9-15`
- `recipes/process-voice/route.ts:9-16`
- `inventory/apply-proposal/route.ts:19`

---

## Additional Cleanup

### Remove excessive debug logging
- `lib/prompts/recipe-updater/process.ts:73,118` — `[Voice Update]` / `[Text Update]` logs
- `app/actions/user-data.ts` — 17 debug console.log statements

### Fix ESLint disables
- `app/api/recipes/apply-proposal/route.ts:112,137,179,201` — `@typescript-eslint/no-explicit-any`
- `lib/services/ingredient-matcher.ts:21` — `@typescript-eslint/no-explicit-any`
- `app/(protected)/app/inventory/page.tsx:116` — `react-hooks/exhaustive-deps`

### Remove stale TODO
- `lib/agents/inventory-manager/tools/update-all-tracked-ingredients.ts:34`:
  ```typescript
  // TODO: support update by category of ingredients
  ```

---

## Implementation Notes

- Each phase should be a separate PR for easier review
- Phase 1 is risk-free and can be merged immediately
- Phase 2 requires testing all auth-protected routes
- Phases 3-5 are independent and can be parallelized
