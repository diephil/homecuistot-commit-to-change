# Quickstart: Onboarding Data Persistence

**Feature**: 011-onboarding-data-persist | **Date**: 2026-01-26

## Implementation Order

### 1. API Endpoint (Day 1)

**File**: `apps/nextjs/src/app/api/onboarding/persist/route.ts`

```typescript
// Key imports
import { createClient } from '@/utils/supabase/server'
import { createUserDb, decodeSupabaseToken } from '@/db/client'
import { ingredients, recipes, userRecipes, recipeIngredients, userInventory, userPantryStaples, unrecognizedItems } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { generateRecipeDetails } from '@/lib/prompts/recipe-generation/process'

// Auth pattern
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Ingredient matching (per user requirements)
const normalizedNames = body.ingredients.map(n => n.toLowerCase())
const matched = await db.select()
  .from(ingredients)
  .where(sql`LOWER(${ingredients.name}) IN (${sql.join(normalizedNames.map(n => sql`${n}`), sql`, `)})`)

// Log unrecognized user ingredients (context='ingredient')
const matchedSet = new Set(matched.map(i => i.name.toLowerCase()))
const unmatchedUser = body.ingredients.filter(n => !matchedSet.has(n.toLowerCase()))
if (unmatchedUser.length > 0) {
  console.log(`unrecognized ingredients, will be added to annotation queue: ${unmatchedUser.join(', ')}`)
  // Insert with context='ingredient'
}

// After LLM call - match LLM-returned ingredients against DB
const llmIngredients = recipeDetails.flatMap(r => r.ingredients)
const llmMatched = await db.select()
  .from(ingredientsTable)
  .where(sql`LOWER(${ingredientsTable.name}) IN (...)`)

// Log unrecognized LLM ingredients (context='ingredient')
const llmMatchedSet = new Set(llmMatched.map(i => i.name.toLowerCase()))
const unmatchedLlm = llmIngredients.filter(n => !llmMatchedSet.has(n.toLowerCase()))
if (unmatchedLlm.length > 0) {
  console.log(`unrecognized ingredients, will be added to annotation queue: ${unmatchedLlm.join(', ')}`)
  // Insert with context='ingredient'
}

// Create recipe_ingredients only for matched LLM ingredients
// llmMatched array has ingredient IDs for recipe_ingredients table
```

### 2. LLM Integration (Day 1)

**Files**:
- `apps/nextjs/src/lib/prompts/recipe-generation/prompt.ts`
- `apps/nextjs/src/lib/prompts/recipe-generation/process.ts`

```typescript
// Zod schema for batch recipe generation
export const RecipeDetailSchema = z.object({
  dishName: z.string(),
  description: z.string().max(100), // ~15 words
  ingredients: z.array(z.string()).min(1).max(6)
})

export const RecipeBatchSchema = z.array(RecipeDetailSchema)

// Prompt template
export const RECIPE_GENERATION_PROMPT = {
  name: 'recipe-generation',
  tags: ['onboarding', 'llm', 'recipes'],
  prompt: `Generate recipe details for each dish.

Dishes to process:
{{dishes}}

For each dish, provide:
1. description: One sentence, max 15 words, describing what the dish is
2. ingredients: 1-6 main ingredient names (common names, lowercase)

Return JSON array matching schema. Be concise.`
}
```

### 3. Step 4 UI (Day 2)

**File**: `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`

Add Step 4 after Step 3:
```typescript
// State changes
const [state, setState] = useState<OnboardingState>({
  ...initialOnboardingState,
  currentStep: 1 as 1 | 2 | 3 | 4, // Add 4
})

// Timer + API call
const handleCompleteSetup = async () => {
  setState(prev => ({ ...prev, currentStep: 4 }))
  const startTime = Date.now()

  // Call persist API
  await fetch('/api/onboarding/persist', {
    method: 'POST',
    body: JSON.stringify({
      dishes: state.dishes,
      ingredients: state.ingredients,
      pantryItems: state.pantry
    })
  })

  // Ensure minimum 4s display
  const elapsed = Date.now() - startTime
  if (elapsed < 4000) {
    await new Promise(r => setTimeout(r, 4000 - elapsed))
  }

  router.push('/app')
}

// Step 4 UI
<div className="min-w-full p-8 flex flex-col items-center justify-center gap-6">
  <h2 className="text-3xl font-black uppercase">
    Congrats!
  </h2>
  <p className="text-lg text-center">
    We're preparing your Home cook gears, one moment please.
  </p>
  {/* Neobrutalism animation */}
  <div className="animate-bounce">
    <div className="w-16 h-16 bg-pink-400 border-4 border-black rotate-12" />
  </div>
</div>
```

### 4. /app Page Update (Day 2)

**File**: `apps/nextjs/src/app/(protected)/app/page.tsx`

```typescript
// Fetch real recipes
const supabase = await createClient()
const { data: session } = await supabase.auth.getSession()
const db = createUserDb(decodeSupabaseToken(session?.access_token))

const userRecipesData = await db.select({
  id: recipes.id,
  title: recipes.name,
  description: recipes.description,
})
.from(userRecipes)
.innerJoin(recipes, eq(userRecipes.recipeId, recipes.id))
.where(eq(userRecipes.source, 'onboarding'))

// Display in Available Recipes section
const availableRecipes = userRecipesData.length > 0
  ? userRecipesData
  : MOCK_RECIPES.filter(r => r.isAvailable)

// Keep mock for Almost Available
const almostAvailableRecipes = MOCK_RECIPES.filter(r => !r.isAvailable)
```

## Key Patterns Reference

### Auth + RLS
```typescript
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
const token = decodeSupabaseToken(session.access_token)
const db = createUserDb(token)
```

### Drizzle IN Query
```typescript
const matched = await db.select()
  .from(ingredients)
  .where(sql`LOWER(${ingredients.name}) IN (${sql.join(
    names.map(n => sql`${n}`),
    sql`, `
  )})`)
```

### Idempotent Insert
```typescript
await tx.insert(userInventory)
  .values(records)
  .onConflictDoNothing()
```

### Gemini Call
```typescript
const response = await trackedGenAI.models.generateContent({
  model: "gemini-2.0-flash",
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  config: {
    responseMimeType: "application/json",
    responseSchema: z.toJSONSchema(RecipeBatchSchema)
  }
})
```

## Testing Checklist (Manual)

- [ ] Complete onboarding with 2+ dishes and 3+ ingredients
- [ ] Verify Step 4 displays for at least 4 seconds
- [ ] Verify redirect to /app works
- [ ] Check /app shows onboarded recipes under "Available Recipes"
- [ ] Verify ingredient matching (add known ingredient like "eggs")
- [ ] Verify unrecognized logging (add unknown ingredient like "unicorn dust")
- [ ] Test refresh during Step 4 (no duplicate records)
- [ ] Test with 0 dishes but ingredients (skip recipe creation)
