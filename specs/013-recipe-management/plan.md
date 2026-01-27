# Implementation Plan: Recipe Management

**Branch**: `013-recipe-management` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-recipe-management/spec.md`

## Summary

Recipe CRUD with voice-based LLM extraction (Gemini), neo-brutalist UI on `/app` (read-only summary) and `/recipes` (full management), ingredient validation against 5931-item DB with unrecognized items toast notifications, Opik prompt tracking.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16, Drizzle ORM 0.45.1, @google/genai (Gemini), Zod, opik
**Storage**: Supabase PostgreSQL via Drizzle ORM
**Testing**: vitest (manual testing acceptable per MVP constitution)
**Target Platform**: Web (Next.js App Router)
**Project Type**: web (monorepo `apps/nextjs/`)
**Performance Goals**: Recipe list loads <2s, voice extraction <15s
**Constraints**: 1-20 ingredients per recipe, title max 100 chars, desc max 200 chars
**Scale/Scope**: Single user tenant isolation via Supabase RLS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. MVP-First | ✅ | Focus on happy paths, defer edge case handling |
| II. Pragmatic Type Safety | ✅ | Zod schemas at API boundaries, derive types |
| III. Essential Validation | ✅ | Validate: user inputs touching DB, ingredient names |
| IV. Test-Ready Infrastructure | ✅ | Manual testing acceptable, test files optional |
| V. Type Derivation | ✅ | Use `z.infer<>` from Zod schemas |
| VI. Named Parameters | ✅ | All functions with 3+ params use objects |
| VII. Neo-Brutalist Design | ✅ | Follow existing RetroUI patterns |
| Non-Negotiables | ✅ | RLS for tenant isolation, parameterized queries |

## Project Structure

### Documentation (this feature)

```text
specs/013-recipe-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI spec
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/
├── scripts/
│   └── register-recipe-prompt.ts    # NEW - Opik prompt registration
├── src/
│   ├── app/
│   │   ├── api/recipes/
│   │   │   ├── process-voice/route.ts   # NEW - Voice → LLM extraction
│   │   │   ├── process-text/route.ts    # NEW - Text → LLM extraction
│   │   │   └── validate/route.ts        # NEW - Ingredient validation
│   │   ├── (protected)/
│   │   │   ├── app/
│   │   │   │   └── page.tsx             # MODIFY - Add recipe summary
│   │   │   └── recipes/
│   │   │       └── page.tsx             # NEW - Recipe management page
│   │   └── actions/
│   │       └── recipes.ts               # NEW - CRUD server actions
│   ├── components/
│   │   └── recipes/                     # NEW - UI components
│   │       ├── recipe-card.tsx
│   │       ├── recipe-form.tsx
│   │       ├── recipe-list.tsx
│   │       └── voice-input.tsx
│   ├── lib/prompts/
│   │   └── recipe-editor/               # NEW - LLM prompt
│   │       ├── prompt.ts
│   │       ├── schema.ts
│   │       └── process.ts
│   └── types/
│       └── recipes.ts                   # NEW - Zod schemas
```

**Structure Decision**: Web application following existing Next.js App Router patterns with server actions for mutations.

## Complexity Tracking

No violations requiring justification.

---

## Phase 0: Research

### R1: Toast Notification System

**Decision**: Install shadcn/ui toast component via `npx shadcn@latest add toast`
**Rationale**: Project uses shadcn CLI, toast not yet installed. Sonner alternative heavier.
**Alternatives**: Custom toast (more work), react-hot-toast (extra dep)

### R2: Ingredient Type Mapping

**Decision**: Map `isOptional: true` → `ingredientType: 'optional'`, `isOptional: false` → `ingredientType: 'anchor'`
**Rationale**: Existing schema uses `anchor|optional|assumed` types. No schema migration needed.
**Alternatives**: Add boolean column (requires migration, risk of drift)

### R3: Voice Input Pattern

**Decision**: Reuse existing audio capture pattern from onboarding - base64 webm to API route
**Rationale**: Proven pattern at `src/app/api/onboarding/process-voice/route.ts`
**Alternatives**: Web Speech API (browser-only, no LLM integration)

### R4: Tenant Verification

**Decision**: All recipe operations use `createUserDb(token)` with RLS context from `src/db/client.ts`
**Rationale**: Established pattern ensures user can only access own data
**Alternatives**: Manual `WHERE userId = ?` (error-prone, no RLS enforcement)

### R5: Unrecognized Items Display

**Decision**: Toast notification listing unrecognized ingredient names with auto-dismiss
**Rationale**: User requirement specifies temporary toast message format
**Alternatives**: Modal (blocks workflow), inline error (spec says toast)

---

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for entity definitions.

**Key Entities**:
- `userRecipes` - existing table, no changes
- `recipeIngredients` - existing junction table, uses `ingredientType` column
- `ingredients` - shared catalog (5931 items), read-only
- `unrecognizedItems` - store unresolved items with `context: 'recipe'`

### API Contracts

See [contracts/api.yaml](./contracts/api.yaml) for OpenAPI spec.

**Endpoints**:
- `POST /api/recipes/process-voice` - Audio → LLM extraction
- `POST /api/recipes/process-text` - Text → LLM extraction (fallback)
- `POST /api/recipes/validate` - Validate ingredient names against DB
- Server Actions: `createRecipe`, `updateRecipe`, `deleteRecipe`, `getRecipes`

### LLM Prompt

**Name**: `recipe-editor`
**Template**: See spec.md lines 181-199
**Schema Output**:
```typescript
{
  title: string;           // max 100 chars
  description: string;     // max 200 chars
  ingredients: Array<{
    name: string;          // lowercase, singular
    isOptional: boolean;
  }>;                      // 1-20 items
}
```

### Opik Registration Script

**File**: `scripts/register-recipe-prompt.ts`
**NPM Command**: `pnpm prompt:recipe` (dev) / `pnpm prompt:recipe:prod` (prod)

---

## User Input Integration

Per user requirements:
1. **Opik prompt script**: Add `prompt:recipe` and `prompt:recipe:prod` scripts to package.json
2. **Tenant verification**: All queries through `createUserDb(token)` for RLS enforcement
3. **Unrecognized items toast**: Format: "The system does not recognize the following items yet: a, b, c, etc..."

---

## Implementation Notes

### Voice Input Flow
1. User clicks mic → Record audio as base64 webm (max 1 minute)
2. POST to `/api/recipes/process-voice` with audioBase64
3. API calls Gemini with `recipe-editor` prompt (tracked via Opik)
4. Return structured JSON: `{title, description, ingredients[]}`
5. Show skeleton placeholders during processing

### Text Input Flow (Fallback)
1. User types description in text field → Submit
2. POST to `/api/recipes/process-text` with text
3. API calls Gemini with `recipe-editor` prompt (tracked via Opik)
4. If no ingredients mentioned, LLM infers minimal list
5. Return structured JSON: `{title, description, ingredients[]}`
6. Show skeleton placeholders during processing

### Ingredient Validation Flow
1. Before save, POST ingredients array to `/api/recipes/validate`
2. Query DB: `SELECT id, name FROM ingredients WHERE LOWER(name) IN (...)`
3. Split into matched (with IDs) and unmatched (names only)
4. Return `{matched: [{id, name}], unrecognized: [string]}`
5. If unrecognized.length > 0, show toast notification

### Toast Message Format
```
The system does not recognize the following items yet: tomato sauce, sriracha, truffle oil
```
Auto-dismiss after 5 seconds, allow manual dismiss.

---

## Resolved Questions

1. ~~Duplicate recipe titles~~ → Silent allow (no warning)
2. ~~Max voice recording duration~~ → 1 minute

## Unresolved Questions

1. Should "keep as custom text" option store in DB or just allow save without validation?
