import type { IngredientType } from '@/db/schema/enums'

// Quantity level type (0-3 scale)
export type QuantityLevel = 0 | 1 | 2 | 3

// Recipe availability state
export type RecipeAvailability = 'available' | 'almost-available' | 'unavailable'

// Ingredient with availability info
export interface IngredientWithAvailability {
  id: string
  name: string
  type: IngredientType
  inInventory: boolean // user has quantity > 0 or isPantryStaple
  currentQuantity: QuantityLevel
  isPantryStaple: boolean
}

// Recipe with computed availability
export interface RecipeWithAvailability {
  id: string
  name: string
  description: string | null
  ingredients: IngredientWithAvailability[]
  // Computed
  missingAnchorCount: number
  missingAnchorNames: string[]
  availability: RecipeAvailability
}

// Cooking log entry for history table
export interface CookingLogEntry {
  id: string
  recipeId: string | null // null if recipe deleted
  recipeName: string
  cookedAt: Date
}

// Payload for marking recipe as cooked
export interface MarkCookedPayload {
  recipeId: string
  recipeName: string
  ingredientUpdates: {
    ingredientId: string
    newQuantity: QuantityLevel
  }[]
}

// Ingredient diff for modal display
export interface IngredientDiff {
  ingredientId: string
  name: string
  currentQuantity: QuantityLevel
  proposedQuantity: QuantityLevel // default: max(0, current - 1)
  isPantryStaple: boolean
  isMissing?: boolean // ingredient not in user inventory (cook-anyway mode)
}
