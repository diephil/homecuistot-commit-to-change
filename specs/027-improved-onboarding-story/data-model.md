# Data Model: Improved Onboarding Story

## State Changes (localStorage)

### StoryOnboardingState (extended)

```
StoryOnboardingState
├── currentScene: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8    # was 1-7
├── demoInventory: DemoInventoryItem[]                  # unchanged
├── demoRecipe: DemoRecipe                              # Sarah's carbonara (Scene 2 updates this)
├── demoRecipes: DemoRecipe[]                           # NEW: all recipes (carbonara + user's)
├── voiceInputsDone: boolean                            # unchanged (currently unused)
├── recipeVoiceDone: boolean                            # NEW: Scene 2 gate
└── userRecipesAdded: boolean                           # NEW: Scene 7 gate
```

### DemoRecipe (unchanged)

```
DemoRecipe
├── name: string
├── description: string
└── ingredients: DemoRecipeIngredient[]
    ├── name: string
    └── type: 'anchor' | 'optional'
```

## New Constants

```
REQUIRED_RECIPE_ITEMS = [
  { name: "egg", alternates: ["eggs"] },
  { name: "parmesan", alternates: [] },
  { name: "pasta", alternates: [] },
  { name: "bacon", alternates: ["guanciale"] },
]
```

## API Contract Changes

### POST /api/onboarding/process-recipe (modified request)

Added optional `additionalTags` field:

```
Request Body (extended)
├── audioBase64?: string
├── text?: string
├── trackedRecipes: TrackedRecipe[]
└── additionalTags?: string[]          # NEW: propagated to Opik trace
```

Response: unchanged.

### POST /api/onboarding/story/complete (unchanged)

Payload already supports `recipes: Array<{...}>`. No schema change needed — the manifesto scene simply sends all recipes in the array instead of wrapping a single one.

## Database (no schema changes)

No new tables or columns. Existing tables handle multi-recipe persistence:
- `user_recipes`: one row per recipe
- `recipe_ingredients`: one row per ingredient per recipe
- `prefillDemoData()` already iterates `recipes` array

## Orchestration Change

### CreateRecipeProposalParams (extended)

```
CreateRecipeProposalParams
├── userId: string
├── input?: string
├── audioBase64?: string
├── mimeType?: string
├── trackedRecipes: RecipeSessionItem[]
├── trackedIngredients?: IngredientSessionItem[]
├── model: "gemini-2.0-flash" | "gemini-2.5-flash-lite"
├── provider?: string
├── isOnBoarding?: boolean
└── additionalTags?: string[]          # NEW: spreads into traceTags
```

## Scene File Mapping

| Old File | New File | Action |
|----------|----------|--------|
| Scene1Dilemma.tsx | Scene1Dilemma.tsx | Modify (text via constants) |
| Scene2Inventory.tsx | — | Delete |
| Scene3Store.tsx | — | Delete |
| — | Scene2RecipeVoice.tsx | Create |
| — | Scene3StoreKitchen.tsx | Create |
| Scene4Voice.tsx | Scene4Voice.tsx | No change |
| Scene5Ready.tsx | Scene5Ready.tsx | No change |
| Scene6Cooked.tsx | Scene6Cooked.tsx | No change |
| — | Scene7YourRecipes.tsx | Create |
| Scene7Manifesto.tsx | Scene8Manifesto.tsx | Rename + modify payload/redirect |
