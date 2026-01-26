# Research: User Pantry Staples

**Feature**: 010-user-pantry-staples
**Date**: 2026-01-26

## 1. Drizzle Migration Pattern

### Decision
Use Drizzle's schema-first approach: modify schema files → generate migration → apply.

### Rationale
- Project already uses `pnpm db:generate` → `pnpm db:migrate` workflow
- Drizzle Kit generates SQL migrations from schema diffs
- Single migration can handle both DROP TABLE and CREATE TABLE

### Migration Strategy
1. Remove `ingredientAliases` from `ingredients.ts` schema
2. Add new `user-pantry-staples.ts` schema file
3. Export from `index.ts`
4. Run `pnpm db:generate` to create migration
5. Apply with `pnpm db:migrate` (local) and `pnpm db:migrate:prod` (production)

### Alternatives Considered
- **Manual SQL migration**: Rejected - loses Drizzle type safety
- **Separate migrations**: Rejected - unnecessary complexity, single atomic change preferred

---

## 2. Zod Schema for Storage Location

### Decision
Use Zod literal union: `z.enum(['pantry', 'fridge'])`

### Rationale
- Matches TypeScript string literal union pattern
- Works with Gemini JSON schema output
- Self-documenting, type-safe

### Schema Structure
```typescript
const StorageLocationSchema = z.enum(['pantry', 'fridge'])

const ExtractedIngredientSchema = z.object({
  name: z.string(),
  storageLocation: StorageLocationSchema,
})

const OnboardingUpdateSchema = z.object({
  add: z.object({
    dishes: z.array(z.string()),
    ingredients: z.array(ExtractedIngredientSchema),  // Changed from z.array(z.string())
  }),
  remove: z.object({
    dishes: z.array(z.string()),
    ingredients: z.array(z.string()),  // Remove by name only
  }),
})
```

### Alternatives Considered
- **Boolean `isPantry`**: Rejected - less readable, doesn't scale if more locations added
- **Full enum with freezer/counter**: Rejected - YAGNI, pantry/fridge sufficient for MVP

---

## 3. Gemini Structured Output for Storage Location

### Decision
Add storage location field to JSON schema with enum constraint.

### Rationale
- Gemini supports JSON Schema with enum constraints
- LLM can infer storage location from ingredient semantics (flour→pantry, milk→fridge)
- Matches spec FR-011, FR-012

### Prompt Update
```text
Extract from the user's input:
- Dishes to ADD/REMOVE
- Ingredients to ADD with storage location (pantry for shelf-stable items like flour, rice, pasta, canned goods; fridge for perishables like milk, eggs, meat, fresh produce)
- Ingredients to REMOVE

For each ingredient, determine where it's typically stored:
- "pantry": shelf-stable, dry goods, canned items, oils, spices
- "fridge": perishables, dairy, meat, fresh produce, eggs
```

### JSON Schema for Gemini
```typescript
const responseSchema = {
  type: "object",
  properties: {
    add: {
      type: "object",
      properties: {
        dishes: { type: "array", items: { type: "string" } },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              storageLocation: { type: "string", enum: ["pantry", "fridge"] }
            },
            required: ["name", "storageLocation"]
          }
        }
      },
      required: ["dishes", "ingredients"]
    },
    remove: {
      type: "object",
      properties: {
        dishes: { type: "array", items: { type: "string" } },
        ingredients: { type: "array", items: { type: "string" } }
      },
      required: ["dishes", "ingredients"]
    }
  },
  required: ["add", "remove"]
}
```

### Default Behavior
- If LLM can't determine storage location: default to "fridge" (per spec edge case - safer for perishables)

### Alternatives Considered
- **Separate LLM call for classification**: Rejected - adds latency, single call preferred
- **Client-side classification**: Rejected - LLM has better context from natural language

---

## 4. UI State Management

### Decision
Update `OnboardingState` to track pantry and fridge items separately (already has `pantry` and `fridge` arrays in state).

### Current State
```typescript
interface OnboardingState {
  currentStep: 1 | 2 | 3;
  dishes: string[];
  fridge: string[];      // Already exists
  pantry: string[];      // Already exists
  ingredients: string[]; // Merged view - will derive from pantry + fridge
  hasVoiceChanges: boolean;
  voiceFailureCount: number;
}
```

### Changes Required
- Use `pantry` and `fridge` arrays for LLM output
- Remove direct `ingredients` updates (derive as `[...pantry, ...fridge]`)
- Update `applyOnboardingUpdate` to route ingredients by storageLocation

---

## Summary

| Topic | Decision | Impact |
|-------|----------|--------|
| Migration | Schema-first, single migration | Low risk |
| Storage enum | `z.enum(['pantry', 'fridge'])` | Type-safe, extensible |
| LLM output | Add storageLocation to ingredient objects | Prompt + schema update |
| UI state | Use existing `pantry`/`fridge` arrays | Minimal change |
