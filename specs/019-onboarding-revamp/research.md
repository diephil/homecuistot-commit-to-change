# Research: Onboarding Steps 2 & 3 Revamp

**Branch**: `019-onboarding-revamp` | **Date**: 2026-01-31

## Resolved Clarifications

### 1. Static Ingredients Must Exist in DB

**Decision**: All 17 static ingredient names verified against existing naming patterns in codebase.

**Rationale**: Current `SUGGESTED_ITEMS` uses singular form (e.g., "Egg", "Tomato"). DB has 5931 ingredients. Must validate these names exist or use exact DB names.

**Required ingredients (singular form)**:
- pasta, rice, salt, egg, garlic, bread, tomato, honey, noodle, bacon, milk, cheese, chicken, cream, onion, olive oil

**Validation approach**: Case-insensitive LOWER() matching in persist route (existing pattern).

### 2. Static Dish Structure with Ingredients

**Decision**: Static dishes defined with title, description, and ingredients array. Each ingredient marked as anchor or optional.

**Rationale**: User requirement specifies "title field, description field, and list of ingredients. Each ingredient should be named in its singular form and marked as either an anchor or optional."

**Structure**:
```typescript
interface StaticDish {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;           // singular form
    type: 'anchor' | 'optional';
  }>;
}
```

### 3. LLM Prompt for Ingredient Extraction

**Decision**: Create new prompt "Onboarding Ingredient Extraction" that returns only `ingredients_to_add` and `ingredients_to_remove` arrays. No dish extraction.

**Rationale**: Step 3 only handles ingredient add/remove via voice/text. Dishes are pre-defined by skill selection.

**Schema**:
```typescript
const IngredientExtractionSchema = z.object({
  ingredients_to_add: z.array(z.string()),
  ingredients_to_remove: z.array(z.string()),
});
```

### 4. Ingredient Matching Helper Function

**Decision**: Create shared `matchIngredients()` function in `lib/services/ingredient-matcher.ts`.

**Rationale**: User requirement specifies reusable code for DB operations. Function matches names against `ingredients` table first, then `unrecognized_items`, returns structured result.

**Signature**:
```typescript
interface MatchResult {
  ingredients: Array<{ id: string; name: string }>;
  unrecognizedItems: Array<{ id: string; rawText: string }>;
  unrecognizedItemsToCreate: string[];
}

function matchIngredients(params: {
  names: string[];
  userId: string;
}): Promise<MatchResult>
```

### 5. Cooking Skill → Recipe Set Mapping

**Decision**: Skill is transient (not stored). Used only to select which static recipes to create.

**Rationale**: Per spec clarification - "used transiently to determine which recipe set (basic vs advanced) to pre-fill during onboarding."

**Mapping**:
- Basic: 8 recipes (scrambled egg, pasta carbonara, pancake, etc.)
- Advanced: Basic + 8 more (teriyaki chicken, caesar salad, etc.)

### 6. Reusable Component Pattern

**Decision**: Create `IngredientChip` component in `components/shared/` for displaying ingredients with selectable/read-only states.

**Rationale**: User requirement specifies "shared and reusable" components. Same chip used in step 2 (selectable) and step 3 (read-only display).

**Props**:
```typescript
interface IngredientChipProps {
  name: string;
  selected?: boolean;
  readOnly?: boolean;
  onToggle?: () => void;
}
```

## Technology Best Practices

### Gemini Structured Output

**Pattern**: Use `z.toJSONSchema()` to convert Zod schema for `responseSchema` config.

**Constraint**: No `z.enum()` in JSON schemas per CLAUDE.md. Use `z.string()` and validate in prompt text.

### Case-Insensitive DB Matching

**Pattern**: Use `sql\`LOWER(${table.name}) IN (...)\`` for matching (existing pattern in persist route).

### Toast Notifications

**Pattern**: Use existing toast component pattern for "Ingredient list has been updated" messages.

## Alternatives Considered

| Decision | Alternative | Why Rejected |
|----------|-------------|--------------|
| Static dishes in constants | LLM-generated dishes | User requirement: "dishes must be static as well in a variable" |
| Shared IngredientChip | Inline styling per step | User requirement: "reusable" components |
| New LLM prompt | Modify existing | Clean separation; ingredient-only vs dish+ingredient extraction |
| anchor/optional markers | All required | User requirement: "marked as either an anchor or optional" |
