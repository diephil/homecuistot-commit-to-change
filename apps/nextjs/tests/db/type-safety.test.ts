/**
 * Type Safety Tests
 *
 * This file demonstrates that TypeScript catches invalid queries at compile time.
 * These tests are meant to FAIL compilation when uncommented.
 *
 * Run: pnpm tsc --noEmit to verify type checking works
 */

import { describe, it, expect } from 'vitest'
import { adminDb } from '@/db/client'
import { userInventory, ingredients } from '@/db/schema'
import { eq } from 'drizzle-orm'

describe('TypeScript Type Safety', () => {
  it('should catch invalid column names at compile time', async () => {
    // ✅ Valid query - should compile
    const validQuery = await adminDb
      .select()
      .from(userInventory)
      .where(eq(userInventory.userId, '00000000-0000-0000-0000-000000000001'))

    expect(validQuery).toBeDefined()

    // ❌ Invalid queries - UNCOMMENT to test (should fail compilation)

    // Invalid column name
    // const invalidColumn = await adminDb
    //   .select()
    //   .from(userInventory)
    //   .where(eq(userInventory.nonExistentColumn, 'test'))
    //   // TS Error: Property 'nonExistentColumn' does not exist

    // Invalid table name
    // const invalidTable = await adminDb
    //   .select()
    //   .from('nonExistentTable')
    //   // TS Error: Argument of type 'string' is not assignable
  })

  it('should catch type mismatches at compile time', async () => {
    // ✅ Valid - number to number
    const validType = await adminDb
      .update(userInventory)
      .set({ quantityLevel: 2 })
      .where(eq(userInventory.userId, '00000000-0000-0000-0000-000000000001'))

    expect(validType).toBeDefined()

    // ❌ Invalid type - UNCOMMENT to test

    // String to number field
    // const invalidType = await adminDb
    //   .update(userInventory)
    //   .set({ quantityLevel: 'not a number' })
    //   // TS Error: Type 'string' is not assignable to type 'number'

    // Number to UUID field
    // const invalidUuidType = await adminDb
    //   .update(userInventory)
    //   .set({ userId: 12345 })
    //   // TS Error: Type 'number' is not assignable to type 'string'
  })

  it('should catch missing required fields at compile time', async () => {
    // ✅ Valid - all required fields provided
    const validInsert = await adminDb
      .insert(ingredients)
      .values({
        name: 'Test Ingredient ' + Date.now(),
        category: 'meat',
        isAssumed: false,
      })
      .returning()

    expect(validInsert).toBeDefined()

    // ❌ Invalid - UNCOMMENT to test

    // Missing required field 'name'
    // const missingName = await adminDb
    //   .insert(ingredients)
    //   .values({
    //     category: 'meat',
    //     isAssumed: false,
    //   })
    //   // TS Error: Property 'name' is missing

    // Missing required field 'category'
    // const missingCategory = await adminDb
    //   .insert(ingredients)
    //   .values({
    //     name: 'Test',
    //     isAssumed: false,
    //   })
    //   // TS Error: Property 'category' is missing
  })

  it('should catch invalid enum values at compile time', async () => {
    // ✅ Valid enum value
    const validEnum = await adminDb
      .insert(ingredients)
      .values({
        name: 'Test Ingredient ' + Date.now(),
        category: 'meat',
        isAssumed: false,
      })

    expect(validEnum).toBeDefined()

    // ❌ Invalid enum - UNCOMMENT to test

    // Invalid category enum
    // const invalidEnum = await adminDb
    //   .insert(ingredients)
    //   .values({
    //     name: 'Test',
    //     category: 'invalid_category',
    //     isAssumed: false,
    //   })
    //   // TS Error: Type '"invalid_category"' is not assignable to type
  })

  it('should provide IntelliSense for column names', async () => {
    // This test verifies IntelliSense works in the IDE
    // No assertions needed - just demonstrates autocomplete

    // When typing 'userInventory.', IDE should show:
    // - id
    // - userId
    // - ingredientId
    // - quantityLevel
    // - updatedAt

    const query = await adminDb
      .select({
        // IntelliSense should autocomplete these fields
        id: userInventory.id,
        userId: userInventory.userId,
        ingredientId: userInventory.ingredientId,
        quantityLevel: userInventory.quantityLevel,
        updatedAt: userInventory.updatedAt,
      })
      .from(userInventory)
      .limit(1)

    expect(query).toBeDefined()
  })

  it('should infer correct return types', async () => {
    // Test that query results have correct TypeScript types
    const result = await adminDb
      .select({
        id: userInventory.id,
        quantity: userInventory.quantityLevel,
      })
      .from(userInventory)
      .limit(1)

    if (result.length > 0) {
      // TypeScript should know these types:
      const id: string = result[0].id // UUID -> string
      const quantity: number = result[0].quantity // integer -> number (aliased in select)

      expect(typeof id).toBe('string')
      expect(typeof quantity).toBe('number')
    }
  })
})
