# Data Model: Recipe Management

**Feature**: 013-recipe-management | **Date**: 2026-01-27

## Entity Overview

```
┌─────────────┐       ┌───────────────────┐       ┌─────────────┐
│ userRecipes │───────│ recipeIngredients │───────│ ingredients │
└─────────────┘  1:N  └───────────────────┘  N:1  └─────────────┘
      │
      │ context='recipe'
      ▼
┌─────────────────────┐
│ unrecognizedItems   │ (for unmatched ingredient names)
└─────────────────────┘
```

## Existing Tables (No Changes Required)

### userRecipes

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, defaultRandom | |
| name | TEXT | NOT NULL | Duplicates allowed (no unique) |
| description | TEXT | nullable | Max 200 chars (app validation) |
| userId | UUID | NOT NULL | Tenant isolation |
| createdAt | TIMESTAMP WITH TZ | NOT NULL, defaultNow | |
| updatedAt | TIMESTAMP WITH TZ | NOT NULL, defaultNow | |

**Indexes**: `idx_user_recipes_user` on `userId`

### recipeIngredients

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, defaultRandom | |
| recipeId | UUID | FK → userRecipes, CASCADE DELETE | |
| ingredientId | UUID | FK → ingredients, RESTRICT DELETE | |
| ingredientType | TEXT | NOT NULL | 'anchor' \| 'optional' \| 'assumed' |
| createdAt | TIMESTAMP WITH TZ | NOT NULL, defaultNow | |

**Indexes**:
- `idx_recipe_ingredients_unique` UNIQUE on (recipeId, ingredientId)
- `idx_recipe_ingredients_recipe` on recipeId
- `idx_recipe_ingredients_ingredient` on ingredientId
- `idx_recipe_ingredients_type` on ingredientType

### ingredients (Read-Only Catalog)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, defaultRandom | |
| name | TEXT | NOT NULL, UNIQUE | Lowercase, singular |
| category | TEXT | NOT NULL | 30 categories |
| createdAt | TIMESTAMP WITH TZ | NOT NULL, defaultNow | |

**Count**: 5931 ingredients

### unrecognizedItems

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, defaultRandom | |
| userId | UUID | NOT NULL | |
| rawText | TEXT | NOT NULL | Original ingredient name |
| context | TEXT | nullable | 'ingredient' \| 'recipe' |
| resolvedAt | TIMESTAMP WITH TZ | nullable | NULL until resolved |
| createdAt | TIMESTAMP WITH TZ | NOT NULL, defaultNow | |

## Type Mappings

### LLM Output → Database

```typescript
// From Gemini extraction
interface LLMIngredient {
  name: string;       // e.g., "tomato"
  isOptional: boolean;
}

// To database
interface RecipeIngredientInsert {
  recipeId: string;
  ingredientId: string;  // Must exist in ingredients table
  ingredientType: 'anchor' | 'optional';  // isOptional ? 'optional' : 'anchor'
}
```

### Validation Flow

```typescript
// Input from LLM
const llmIngredients = [
  { name: "tomato", isOptional: false },
  { name: "basil", isOptional: true },
  { name: "magic sauce", isOptional: false },  // Not in DB
];

// After validation
const validationResult = {
  matched: [
    { id: "uuid-1", name: "tomato", isOptional: false },
    { id: "uuid-2", name: "basil", isOptional: true },
  ],
  unrecognized: ["magic sauce"],
};
```

## Constraints (Application Layer)

| Constraint | Value | Enforcement |
|------------|-------|-------------|
| Recipe title max length | 100 chars | Zod schema |
| Recipe description max length | 200 chars | Zod schema |
| Ingredients per recipe | 1-20 | Zod schema |
| Ingredient name | lowercase, singular | LLM prompt guidance |

## Relations (Drizzle ORM)

```typescript
// userRecipes → recipeIngredients (one-to-many)
export const userRecipesRelations = relations(userRecipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
}))

// recipeIngredients → userRecipes, ingredients (many-to-one)
export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(userRecipes, {
    fields: [recipeIngredients.recipeId],
    references: [userRecipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))
```

## Query Patterns

### Get User Recipes with Ingredients

```typescript
const recipes = await db.query.userRecipes.findMany({
  where: eq(userRecipes.userId, userId),
  with: {
    recipeIngredients: {
      with: { ingredient: true }
    }
  },
  orderBy: [desc(userRecipes.createdAt)],
  limit: 10,  // For /app page
})
```

### Validate Ingredient Names

```typescript
const names = ingredients.map(i => i.name.toLowerCase())
const matched = await db
  .select({ id: ingredients.id, name: ingredients.name })
  .from(ingredients)
  .where(sql`LOWER(${ingredients.name}) IN (${names.map(n => `'${n}'`).join(',')})`)
```

### Insert Recipe with Ingredients

```typescript
await db.transaction(async (tx) => {
  const [recipe] = await tx.insert(userRecipes).values({
    name: title,
    description,
    userId,
  }).returning()

  await tx.insert(recipeIngredients).values(
    validatedIngredients.map(i => ({
      recipeId: recipe.id,
      ingredientId: i.id,
      ingredientType: i.isOptional ? 'optional' : 'anchor',
    }))
  )

  return recipe
})
```
