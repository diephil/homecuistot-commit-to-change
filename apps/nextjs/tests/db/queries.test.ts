import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { adminDb, recordCooking } from '@/db/client'
import {
  userInventory,
  ingredients,
  recipes,
  recipeIngredients,
  userRecipes,
  cookingLog,
} from '@/db/schema'
import { eq, and, gt, sql, count, avg } from 'drizzle-orm'

// Test data
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'
const TEST_INGREDIENT_ID = '00000000-0000-0000-0000-000000000002'
const TEST_INGREDIENT_ID_2 = '00000000-0000-0000-0000-000000000003'

describe('Basic CRUD Operations', () => {
  beforeEach(async () => {
    // Clean up test data
    await adminDb.delete(userInventory).where(eq(userInventory.userId, TEST_USER_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID_2))
  })

  afterEach(async () => {
    // Clean up after tests
    await adminDb.delete(userInventory).where(eq(userInventory.userId, TEST_USER_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID_2))
  })

  it('should insert inventory item', async () => {
    // First create test ingredient
    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'Test Chicken',
      category: 'meat',
    })

    // Insert inventory item
    const result = await adminDb.insert(userInventory).values({
      userId: TEST_USER_ID,
      ingredientId: TEST_INGREDIENT_ID,
      quantityLevel: 2,
    }).returning()

    expect(result).toHaveLength(1)
    expect(result[0].userId).toBe(TEST_USER_ID)
    expect(result[0].ingredientId).toBe(TEST_INGREDIENT_ID)
    expect(result[0].quantityLevel).toBe(2)
  })

  it('should select inventory items', async () => {
    // Setup: Create ingredient and inventory
    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'Test Tomato',
      category: 'vegetables',
    })

    await adminDb.insert(userInventory).values({
      userId: TEST_USER_ID,
      ingredientId: TEST_INGREDIENT_ID,
      quantityLevel: 3,
    })

    // Test: Select
    const items = await adminDb
      .select()
      .from(userInventory)
      .where(eq(userInventory.userId, TEST_USER_ID))

    expect(items).toHaveLength(1)
    expect(items[0].quantityLevel).toBe(3)
  })

  it('should update inventory quantity', async () => {
    // Setup
    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'Test Rice',
      category: 'starch',
    })

    await adminDb.insert(userInventory).values({
      userId: TEST_USER_ID,
      ingredientId: TEST_INGREDIENT_ID,
      quantityLevel: 3,
    })

    // Test: Update
    await adminDb
      .update(userInventory)
      .set({ quantityLevel: 1, updatedAt: new Date() })
      .where(
        and(
          eq(userInventory.userId, TEST_USER_ID),
          eq(userInventory.ingredientId, TEST_INGREDIENT_ID)
        )
      )

    // Verify
    const updated = await adminDb
      .select()
      .from(userInventory)
      .where(eq(userInventory.userId, TEST_USER_ID))

    expect(updated[0].quantityLevel).toBe(1)
  })

  it('should delete inventory item', async () => {
    // Setup
    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'Test Beans',
      category: 'beans',
    })

    await adminDb.insert(userInventory).values({
      userId: TEST_USER_ID,
      ingredientId: TEST_INGREDIENT_ID,
      quantityLevel: 2,
    })

    // Test: Delete
    await adminDb
      .delete(userInventory)
      .where(
        and(
          eq(userInventory.userId, TEST_USER_ID),
          eq(userInventory.ingredientId, TEST_INGREDIENT_ID)
        )
      )

    // Verify
    const remaining = await adminDb
      .select()
      .from(userInventory)
      .where(eq(userInventory.userId, TEST_USER_ID))

    expect(remaining).toHaveLength(0)
  })

  it('should upsert inventory item (insert on conflict)', async () => {
    // Setup
    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'Test Milk',
      category: 'dairy',
    })

    // First insert
    await adminDb.insert(userInventory).values({
      userId: TEST_USER_ID,
      ingredientId: TEST_INGREDIENT_ID,
      quantityLevel: 2,
    })

    // Upsert (should update)
    await adminDb
      .insert(userInventory)
      .values({
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID,
        quantityLevel: 3,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userInventory.userId, userInventory.ingredientId],
        set: {
          quantityLevel: 3,
          updatedAt: new Date(),
        },
      })

    // Verify only one row exists with updated quantity
    const items = await adminDb
      .select()
      .from(userInventory)
      .where(eq(userInventory.userId, TEST_USER_ID))

    expect(items).toHaveLength(1)
    expect(items[0].quantityLevel).toBe(3)
  })
})

describe('Join Queries', () => {
  beforeEach(async () => {
    // Clean up test data
    await adminDb.delete(userInventory).where(eq(userInventory.userId, TEST_USER_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID_2))
  })

  afterEach(async () => {
    // Clean up after tests
    await adminDb.delete(userInventory).where(eq(userInventory.userId, TEST_USER_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID_2))
  })

  it('should join userInventory with ingredients', async () => {
    // Setup
    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'Test Chicken',
      category: 'meat',
    })

    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID_2,
      name: 'Test Tomato',
      category: 'vegetables',
    })

    await adminDb.insert(userInventory).values([
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID,
        quantityLevel: 3,
      },
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID_2,
        quantityLevel: 2,
      },
    ])

    // Test: Join query
    const result = await adminDb
      .select({
        inventoryId: userInventory.id,
        quantityLevel: userInventory.quantityLevel,
        ingredientName: ingredients.name,
        ingredientCategory: ingredients.category,
      })
      .from(userInventory)
      .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
      .where(eq(userInventory.userId, TEST_USER_ID))

    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('ingredientName')
    expect(result[0]).toHaveProperty('ingredientCategory')
    expect(['Test Chicken', 'Test Tomato']).toContain(result[0].ingredientName)
  })

  it('should filter joined results with quantity level', async () => {
    // Setup
    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'High Stock Item',
      category: 'meat',
    })

    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID_2,
      name: 'Low Stock Item',
      category: 'vegetables',
    })

    await adminDb.insert(userInventory).values([
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID,
        quantityLevel: 3,
      },
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID_2,
        quantityLevel: 0,
      },
    ])

    // Test: Join with quantity filter (only in stock)
    const inStockItems = await adminDb
      .select({
        inventoryId: userInventory.id,
        quantityLevel: userInventory.quantityLevel,
        ingredientName: ingredients.name,
      })
      .from(userInventory)
      .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
      .where(
        and(
          eq(userInventory.userId, TEST_USER_ID),
          gt(userInventory.quantityLevel, 0)
        )
      )

    expect(inStockItems).toHaveLength(1)
    expect(inStockItems[0].ingredientName).toBe('High Stock Item')
    expect(inStockItems[0].quantityLevel).toBe(3)
  })
})

describe('Aggregation Queries', () => {
  const TEST_RECIPE_ID = '00000000-0000-0000-0000-000000000004'
  const TEST_RECIPE_ID_2 = '00000000-0000-0000-0000-000000000005'

  beforeEach(async () => {
    // Clean up test data
    await adminDb.delete(userRecipes).where(eq(userRecipes.userId, TEST_USER_ID))
    await adminDb.delete(userInventory).where(eq(userInventory.userId, TEST_USER_ID))
    await adminDb.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, TEST_RECIPE_ID))
    await adminDb.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, TEST_RECIPE_ID_2))
    await adminDb.delete(recipes).where(eq(recipes.id, TEST_RECIPE_ID))
    await adminDb.delete(recipes).where(eq(recipes.id, TEST_RECIPE_ID_2))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID_2))
  })

  afterEach(async () => {
    // Clean up after tests
    await adminDb.delete(userRecipes).where(eq(userRecipes.userId, TEST_USER_ID))
    await adminDb.delete(userInventory).where(eq(userInventory.userId, TEST_USER_ID))
    await adminDb.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, TEST_RECIPE_ID))
    await adminDb.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, TEST_RECIPE_ID_2))
    await adminDb.delete(recipes).where(eq(recipes.id, TEST_RECIPE_ID))
    await adminDb.delete(recipes).where(eq(recipes.id, TEST_RECIPE_ID_2))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID_2))
  })

  it('should count total recipes for user', async () => {
    // Setup: Create recipes and user_recipes
    await adminDb.insert(recipes).values([
      {
        id: TEST_RECIPE_ID,
        name: 'Test Recipe 1',
        description: 'First test recipe',
        isSeeded: true,
      },
      {
        id: TEST_RECIPE_ID_2,
        name: 'Test Recipe 2',
        description: 'Second test recipe',
        isSeeded: true,
      },
    ])

    await adminDb.insert(userRecipes).values([
      {
        userId: TEST_USER_ID,
        recipeId: TEST_RECIPE_ID,
        source: 'onboarding',
      },
      {
        userId: TEST_USER_ID,
        recipeId: TEST_RECIPE_ID_2,
        source: 'added',
      },
    ])

    // Test: Count recipes
    const result = await adminDb
      .select({ total: count() })
      .from(userRecipes)
      .where(eq(userRecipes.userId, TEST_USER_ID))

    expect(result[0].total).toBe(2)
  })

  it('should calculate average inventory quantity', async () => {
    // Setup: Create ingredients and inventory
    await adminDb.insert(ingredients).values([
      {
        id: TEST_INGREDIENT_ID,
        name: 'Test Item 1',
        category: 'meat',
        },
      {
        id: TEST_INGREDIENT_ID_2,
        name: 'Test Item 2',
        category: 'vegetables',
        },
    ])

    await adminDb.insert(userInventory).values([
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID,
        quantityLevel: 3,
      },
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID_2,
        quantityLevel: 1,
      },
    ])

    // Test: Average quantity
    const result = await adminDb
      .select({
        avgQuantity: avg(userInventory.quantityLevel),
      })
      .from(userInventory)
      .where(eq(userInventory.userId, TEST_USER_ID))

    // avg returns string, convert for comparison
    expect(Number(result[0].avgQuantity)).toBe(2)
  })

  it('should group and count by category', async () => {
    // Setup
    await adminDb.insert(ingredients).values([
      {
        id: TEST_INGREDIENT_ID,
        name: 'Chicken',
        category: 'meat',
        },
      {
        id: TEST_INGREDIENT_ID_2,
        name: 'Tomato',
        category: 'vegetables',
        },
    ])

    await adminDb.insert(userInventory).values([
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID,
        quantityLevel: 3,
      },
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID_2,
        quantityLevel: 2,
      },
    ])

    // Test: Group by category with join
    const result = await adminDb
      .select({
        category: ingredients.category,
        itemCount: count(),
      })
      .from(userInventory)
      .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
      .where(eq(userInventory.userId, TEST_USER_ID))
      .groupBy(ingredients.category)

    expect(result).toHaveLength(2)
    expect(result.find((r) => r.category === 'meat')?.itemCount).toBe(1)
    expect(result.find((r) => r.category === 'vegetables')?.itemCount).toBe(1)
  })
})

describe('Transaction Support', () => {
  const TEST_RECIPE_ID = '00000000-0000-0000-0000-000000000006'

  beforeEach(async () => {
    // Clean up test data
    await adminDb.delete(cookingLog).where(eq(cookingLog.userId, TEST_USER_ID))
    await adminDb.delete(userInventory).where(eq(userInventory.userId, TEST_USER_ID))
    await adminDb.delete(recipes).where(eq(recipes.id, TEST_RECIPE_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID_2))
  })

  afterEach(async () => {
    // Clean up after tests
    await adminDb.delete(cookingLog).where(eq(cookingLog.userId, TEST_USER_ID))
    await adminDb.delete(userInventory).where(eq(userInventory.userId, TEST_USER_ID))
    await adminDb.delete(recipes).where(eq(recipes.id, TEST_RECIPE_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID))
    await adminDb.delete(ingredients).where(eq(ingredients.id, TEST_INGREDIENT_ID_2))
  })

  it('should execute cooking flow transaction successfully', async () => {
    // Setup: Create recipe and ingredients
    await adminDb.insert(recipes).values({
      id: TEST_RECIPE_ID,
      name: 'Test Pasta',
      description: 'Simple pasta recipe',
      isSeeded: true,
    })

    await adminDb.insert(ingredients).values([
      {
        id: TEST_INGREDIENT_ID,
        name: 'Pasta',
        category: 'starch',
        },
      {
        id: TEST_INGREDIENT_ID_2,
        name: 'Tomato Sauce',
        category: 'vegetables',
        },
    ])

    await adminDb.insert(userInventory).values([
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID,
        quantityLevel: 3,
      },
      {
        userId: TEST_USER_ID,
        ingredientId: TEST_INGREDIENT_ID_2,
        quantityLevel: 2,
      },
    ])

    // Test: Execute cooking transaction
    const result = await recordCooking({
      userId: TEST_USER_ID,
      recipeId: TEST_RECIPE_ID,
      recipeName: 'Test Pasta',
      ingredientUpdates: [
        { ingredientId: TEST_INGREDIENT_ID, quantityDecrease: 1 },
        { ingredientId: TEST_INGREDIENT_ID_2, quantityDecrease: 1 },
      ],
    })

    // Verify cooking log created
    expect(result).toBeDefined()
    expect(result.userId).toBe(TEST_USER_ID)
    expect(result.recipeId).toBe(TEST_RECIPE_ID)

    // Verify inventory updated
    const updatedInventory = await adminDb
      .select()
      .from(userInventory)
      .where(eq(userInventory.userId, TEST_USER_ID))

    const pastaInventory = updatedInventory.find(
      (i) => i.ingredientId === TEST_INGREDIENT_ID
    )
    const sauceInventory = updatedInventory.find(
      (i) => i.ingredientId === TEST_INGREDIENT_ID_2
    )

    expect(pastaInventory?.quantityLevel).toBe(2) // 3 - 1
    expect(sauceInventory?.quantityLevel).toBe(1) // 2 - 1
  })

  it('should rollback transaction on error', async () => {
    // Setup: Create recipe and ONE ingredient only
    await adminDb.insert(recipes).values({
      id: TEST_RECIPE_ID,
      name: 'Test Recipe ' + Date.now(),
      description: 'Test',
      isSeeded: true,
    })

    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'Test Ingredient ' + Date.now(),
      category: 'meat',
    })

    await adminDb.insert(userInventory).values({
      userId: TEST_USER_ID,
      ingredientId: TEST_INGREDIENT_ID,
      quantityLevel: 3,
    })

    // Test: Try cooking with non-existent ingredient (should fail and rollback)
    const NONEXISTENT_INGREDIENT_ID = '00000000-0000-0000-0000-999999999999'

    await expect(
      recordCooking({
        userId: TEST_USER_ID,
        recipeId: TEST_RECIPE_ID,
        recipeName: 'Test Recipe',
        ingredientUpdates: [
          { ingredientId: TEST_INGREDIENT_ID, quantityDecrease: 1 },
          { ingredientId: NONEXISTENT_INGREDIENT_ID, quantityDecrease: 1 }, // This will fail
        ],
      })
    ).rejects.toThrow('not found in user inventory')

    // Verify NO cooking log was created (transaction rolled back)
    const logs = await adminDb
      .select()
      .from(cookingLog)
      .where(eq(cookingLog.userId, TEST_USER_ID))

    expect(logs).toHaveLength(0)

    // Verify inventory NOT updated (transaction rolled back)
    const inventory = await adminDb
      .select()
      .from(userInventory)
      .where(
        and(
          eq(userInventory.userId, TEST_USER_ID),
          eq(userInventory.ingredientId, TEST_INGREDIENT_ID)
        )
      )

    expect(inventory[0].quantityLevel).toBe(3) // Still original value
  })

  it('should handle quantity reaching zero in transaction', async () => {
    // Setup
    await adminDb.insert(recipes).values({
      id: TEST_RECIPE_ID,
      name: 'Test Recipe',
      description: 'Test',
      isSeeded: true,
    })

    await adminDb.insert(ingredients).values({
      id: TEST_INGREDIENT_ID,
      name: 'Low Stock Item',
      category: 'vegetables',
    })

    await adminDb.insert(userInventory).values({
      userId: TEST_USER_ID,
      ingredientId: TEST_INGREDIENT_ID,
      quantityLevel: 1, // Low stock
    })

    // Test: Cook using last of ingredient
    await recordCooking({
      userId: TEST_USER_ID,
      recipeId: TEST_RECIPE_ID,
      recipeName: 'Test Recipe',
      ingredientUpdates: [
        { ingredientId: TEST_INGREDIENT_ID, quantityDecrease: 2 }, // More than available
      ],
    })

    // Verify quantity set to 0 (not negative)
    const inventory = await adminDb
      .select()
      .from(userInventory)
      .where(
        and(
          eq(userInventory.userId, TEST_USER_ID),
          eq(userInventory.ingredientId, TEST_INGREDIENT_ID)
        )
      )

    expect(inventory[0].quantityLevel).toBe(0) // Clamped to 0
  })
})
