import { z } from 'zod'
import type { QuantityLevel } from '@/types/inventory'

/**
 * Story Onboarding Types
 * Client-side state for the 7-scene story onboarding flow.
 * No new DB entities — all demo state lives in localStorage.
 */

export interface DemoInventoryItem {
  name: string
  category: string
  quantityLevel: QuantityLevel
  isPantryStaple: boolean
  isNew?: boolean // true if added via voice in Scene 4
}

export interface DemoRecipeIngredient {
  name: string
  type: 'anchor' | 'optional'
}

export interface DemoRecipe {
  name: string
  description: string
  ingredients: DemoRecipeIngredient[]
}

export interface StoryOnboardingState {
  currentScene: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  demoInventory: DemoInventoryItem[]
  demoRecipe: DemoRecipe
  demoRecipes: DemoRecipe[]
  voiceInputsDone: boolean
  recipeVoiceDone: boolean
  userRecipesAdded: boolean
}

export interface StoryCompleteRequest {
  ingredients: Array<{ name: string; quantityLevel: number }>
  pantryStaples: Array<{ name: string; quantityLevel: number }>
  recipes: Array<{
    name: string
    description?: string
    ingredients: Array<{
      name: string
      type: 'anchor' | 'optional'
    }>
  }>
}

export const StoryCompleteRequestSchema = z.object({
  ingredients: z.array(z.object({
    name: z.string().min(1).max(100),
    quantityLevel: z.number().int().min(0).max(3),
  })).max(100),
  pantryStaples: z.array(z.object({
    name: z.string().min(1).max(100),
    quantityLevel: z.number().int().min(0).max(3),
  })).max(100).default([]),
  recipes: z.array(z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    ingredients: z.array(z.object({
      name: z.string().min(1).max(100),
      type: z.enum(['anchor', 'optional']),
    })),
  })).max(20),
})
