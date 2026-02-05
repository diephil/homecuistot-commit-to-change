import type { InventoryDisplayItem, QuantityLevel } from '@/types/inventory'
import type { RecipeWithAvailability, IngredientWithAvailability } from '@/types/cooking'
import type { DemoInventoryItem, DemoRecipe } from './types'
import { REQUIRED_ITEMS, REQUIRED_RECIPE_ITEMS } from './constants'

/**
 * Story Onboarding Data Transformations
 * Convert demo data shapes → existing component prop shapes.
 */

export function toInventoryDisplayItem(params: {
  item: DemoInventoryItem
  index: number
}): InventoryDisplayItem {
  const { item, index } = params
  return {
    id: `demo-${index}`,
    ingredientId: `demo-ing-${index}`,
    name: item.name,
    category: item.category,
    quantityLevel: item.quantityLevel,
    isPantryStaple: item.isPantryStaple,
    updatedAt: new Date(),
  }
}

export function toRecipeWithAvailability(params: {
  recipe: DemoRecipe
  inventory: DemoInventoryItem[]
}): RecipeWithAvailability {
  const { recipe, inventory } = params
  const inventoryMap = new Map(
    inventory.map(i => [i.name.toLowerCase(), i])
  )

  const ingredients: IngredientWithAvailability[] = recipe.ingredients.map((ing, idx) => {
    const inv = inventoryMap.get(ing.name.toLowerCase())
    return {
      id: `demo-ring-${idx}`,
      name: ing.name,
      type: ing.type,
      inInventory: inv ? (inv.quantityLevel > 0 || inv.isPantryStaple) : false,
      currentQuantity: (inv?.quantityLevel ?? 0) as QuantityLevel,
      isPantryStaple: inv?.isPantryStaple ?? false,
    }
  })

  const anchorIngredients = ingredients.filter(i => i.type === 'anchor')
  const missingAnchors = anchorIngredients.filter(i => !i.inInventory)

  return {
    id: 'demo-carbonara',
    name: recipe.name,
    description: recipe.description,
    ingredients,
    missingAnchorCount: missingAnchors.length,
    missingAnchorNames: missingAnchors.map(i => i.name),
    availability: missingAnchors.length === 0 ? 'available' : 'almost-available',
  }
}

export function hasRequiredItems(inventory: DemoInventoryItem[]): boolean {
  return REQUIRED_ITEMS.every(required =>
    inventory.some(item =>
      item.name.toLowerCase() === required.toLowerCase() && item.quantityLevel > 0
    )
  )
}

export function hasRequiredRecipeItems(recipe: DemoRecipe): boolean {
  const ingredientNames = recipe.ingredients.map(i => i.name.toLowerCase())

  return REQUIRED_RECIPE_ITEMS.every(required =>
    ingredientNames.includes(required.toLowerCase())
  )
}

interface ApiRecipeResponse {
  id: string
  name: string
  description?: string
  ingredients: Array<{
    id: string
    name: string
    type: 'anchor' | 'optional'
  }>
}

export function toDemoRecipeFromApiResponse(apiRecipe: ApiRecipeResponse): DemoRecipe {
  return {
    name: apiRecipe.name,
    description: apiRecipe.description || '',
    ingredients: apiRecipe.ingredients.map(ing => ({
      name: ing.name,
      type: ing.type,
    })),
  }
}
