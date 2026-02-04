# Data Model: 025-onboarding-integration

**Date**: 2026-02-04

## Entity Changes

### StoryIngredientExtractionSchema (NEW)

New Zod schema for the story-specific ingredient extraction response. Extends the concept of `IngredientExtractionSchema` but with quantityLevel per add item.

```
StoryIngredientExtractionSchema
├── add: Array<{ name: string, quantityLevel: number }>  // 0-3
├── rm: Array<string>
├── transcribedText?: string
├── unrecognized?: Array<string>
```

**Derivation**: `StoryIngredientExtractionResponse = z.infer<typeof StoryIngredientExtractionSchema>`

**Note**: The existing `IngredientExtractionSchema` remains unchanged (old routes still reference it).

### StoryCompleteRequestSchema (MODIFIED)

Extends the existing schema to carry per-ingredient quantityLevel.

```
Before:
  ingredients: Array<string>
  pantryStaples: Array<string>

After:
  ingredients: Array<{ name: string, quantityLevel: number }>
  pantryStaples: Array<{ name: string, quantityLevel: number }>
```

Recipes array stays unchanged.

### DemoInventoryItem (UNCHANGED)

Already carries quantityLevel. No modifications needed.

```
DemoInventoryItem
├── name: string
├── category: string
├── quantityLevel: QuantityLevel (0|1|2|3)
├── isPantryStaple: boolean
└── isNew?: boolean
```

## Data Flow

```
Scene 4 (voice input)
  └── POST /api/onboarding/story/process-input
      └── ingredientExtractorAgent (Gemini) → { name, quantityLevel }[]
          └── validateIngredientNames → recognized/unrecognized split
              └── Response: StoryIngredientExtractionResponse
                  └── Scene4Voice updates inventory with per-item quantityLevel

Scene 5 → 6 (cook action)
  └── StoryOnboarding.handleMarkAsCooked()
      └── Decrements non-staple recipe ingredients by 1 (existing logic, unchanged)

Scene 7 (completion)
  └── POST /api/onboarding/story/complete
      └── Payload: { ingredients: [{name, quantityLevel}], pantryStaples: [{name, quantityLevel}], recipes }
          └── prefillDemoData(tx, userId, ingredients, pantryStaples, recipes)
              └── INSERT user_inventory with per-item quantityLevel (not hardcoded 3)
```

## No Database Schema Changes

All changes are at the application layer. The `user_inventory` table already supports `quantityLevel` (0-3). No migrations needed.
