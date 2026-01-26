import { describe, it, expect } from 'vitest'
import * as schema from '@/db/schema'

describe('Drizzle Schema Structure', () => {
  describe('Tables', () => {
    it('ingredients table exists with correct structure', () => {
      expect(schema.ingredients).toBeDefined()
      const { id, name, category, isAssumed, createdAt } = schema.ingredients

      expect(id).toBeDefined()
      expect(name).toBeDefined()
      expect(category).toBeDefined()
      expect(isAssumed).toBeDefined()
      expect(createdAt).toBeDefined()
    })

    it('ingredientAliases table exists with correct structure', () => {
      expect(schema.ingredientAliases).toBeDefined()
      const { id, ingredientId, alias, createdAt } = schema.ingredientAliases

      expect(id).toBeDefined()
      expect(ingredientId).toBeDefined()
      expect(alias).toBeDefined()
      expect(createdAt).toBeDefined()
    })

    it('recipes table exists with correct structure', () => {
      expect(schema.recipes).toBeDefined()
      const { id, name, description, isSeeded, userId, createdAt, updatedAt } = schema.recipes

      expect(id).toBeDefined()
      expect(name).toBeDefined()
      expect(description).toBeDefined()
      expect(isSeeded).toBeDefined()
      expect(userId).toBeDefined()
      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()
    })

    it('recipeIngredients table exists with correct structure', () => {
      expect(schema.recipeIngredients).toBeDefined()
      const { id, recipeId, ingredientId, ingredientType, createdAt } = schema.recipeIngredients

      expect(id).toBeDefined()
      expect(recipeId).toBeDefined()
      expect(ingredientId).toBeDefined()
      expect(ingredientType).toBeDefined()
      expect(createdAt).toBeDefined()
    })

    it('userInventory table exists with correct structure', () => {
      expect(schema.userInventory).toBeDefined()
      const { id, userId, ingredientId, quantityLevel, updatedAt } = schema.userInventory

      expect(id).toBeDefined()
      expect(userId).toBeDefined()
      expect(ingredientId).toBeDefined()
      expect(quantityLevel).toBeDefined()
      expect(updatedAt).toBeDefined()
    })

    it('userRecipes table exists with correct structure', () => {
      expect(schema.userRecipes).toBeDefined()
      const { id, userId, recipeId, source, createdAt } = schema.userRecipes

      expect(id).toBeDefined()
      expect(userId).toBeDefined()
      expect(recipeId).toBeDefined()
      expect(source).toBeDefined()
      expect(createdAt).toBeDefined()
    })

    it('cookingLog table exists with correct structure', () => {
      expect(schema.cookingLog).toBeDefined()
      const { id, userId, recipeId, recipeName, cookedAt } = schema.cookingLog

      expect(id).toBeDefined()
      expect(userId).toBeDefined()
      expect(recipeId).toBeDefined()
      expect(recipeName).toBeDefined()
      expect(cookedAt).toBeDefined()
    })

    it('unrecognizedItems table exists with correct structure', () => {
      expect(schema.unrecognizedItems).toBeDefined()
      const { id, userId, rawText, context, resolvedAt, createdAt } = schema.unrecognizedItems

      expect(id).toBeDefined()
      expect(userId).toBeDefined()
      expect(rawText).toBeDefined()
      expect(context).toBeDefined()
      expect(resolvedAt).toBeDefined()
      expect(createdAt).toBeDefined()
    })
  })

  describe('Enums', () => {
    it('INGREDIENT_CATEGORIES has 30 valid values', () => {
      expect(schema.INGREDIENT_CATEGORIES).toBeDefined()
      expect(schema.INGREDIENT_CATEGORIES.length).toBe(30)
      expect(schema.INGREDIENT_CATEGORIES).toContain('meat')
      expect(schema.INGREDIENT_CATEGORIES).toContain('dairy')
      expect(schema.INGREDIENT_CATEGORIES).toContain('vegetables')
      expect(schema.INGREDIENT_CATEGORIES).toContain('starch')
      expect(schema.INGREDIENT_CATEGORIES).toContain('beans')
    })

    it('INGREDIENT_TYPES has valid values', () => {
      expect(schema.INGREDIENT_TYPES).toBeDefined()
      const validTypes = ['anchor', 'optional', 'assumed']
      expect([...schema.INGREDIENT_TYPES]).toEqual(validTypes)
    })

    it('RECIPE_SOURCES has valid values', () => {
      expect(schema.RECIPE_SOURCES).toBeDefined()
      const validSources = ['onboarding', 'added', 'other']
      expect([...schema.RECIPE_SOURCES]).toEqual(validSources)
    })
  })

  describe('Relations', () => {
    it('ingredientsRelations exists', () => {
      expect(schema.ingredientsRelations).toBeDefined()
    })

    it('ingredientAliasesRelations exists', () => {
      expect(schema.ingredientAliasesRelations).toBeDefined()
    })

    it('recipesRelations exists', () => {
      expect(schema.recipesRelations).toBeDefined()
    })

    it('recipeIngredientsRelations exists', () => {
      expect(schema.recipeIngredientsRelations).toBeDefined()
    })

    it('userInventoryRelations exists', () => {
      expect(schema.userInventoryRelations).toBeDefined()
    })

    it('userRecipesRelations exists', () => {
      expect(schema.userRecipesRelations).toBeDefined()
    })

    it('cookingLogRelations exists', () => {
      expect(schema.cookingLogRelations).toBeDefined()
    })
  })

  describe('Schema Exports', () => {
    it('all table schemas are properly exported', () => {
      // This test verifies schema objects are exported and accessible
      // Type inference validation happens at compile time via TypeScript
      // If schema types are incorrect, `pnpm tsc --noEmit` (T016) will fail

      expect(schema.ingredients).toBeDefined()
      expect(schema.ingredientAliases).toBeDefined()
      expect(schema.recipes).toBeDefined()
      expect(schema.recipeIngredients).toBeDefined()
      expect(schema.userInventory).toBeDefined()
      expect(schema.userRecipes).toBeDefined()
      expect(schema.cookingLog).toBeDefined()
      expect(schema.unrecognizedItems).toBeDefined()
    })
  })
})
