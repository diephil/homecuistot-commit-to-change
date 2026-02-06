import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/services/route-auth'
import { userInventory, ingredients, unrecognizedItems } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export const GET = withAuth(async ({ db }) => {
  try {
    // Type-safe query with RLS enforcement
    // Feature 021: Fetch both recognized and unrecognized items
    const inventory = await db((tx) =>
      tx
        .select({
          id: userInventory.id,
          ingredientId: userInventory.ingredientId,
          unrecognizedItemId: userInventory.unrecognizedItemId,
          ingredientName: ingredients.name,
          ingredientCategory: ingredients.category,
          unrecognizedRawText: unrecognizedItems.rawText,
          quantityLevel: userInventory.quantityLevel,
          isPantryStaple: userInventory.isPantryStaple,
          updatedAt: userInventory.updatedAt,
        })
        .from(userInventory)
        .leftJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
        .leftJoin(unrecognizedItems, eq(userInventory.unrecognizedItemId, unrecognizedItems.id))
    )

    return NextResponse.json({
      inventory,
      count: inventory.length
    })
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async ({ userId, db, request }) => {
  try {
    const body = await request.json()
    const { ingredientId, quantityLevel } = body

    if (!ingredientId || typeof quantityLevel !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    if (quantityLevel < 0 || quantityLevel > 3) {
      return NextResponse.json(
        { error: 'Quantity level must be between 0 and 3' },
        { status: 400 }
      )
    }

    // Upsert inventory item - use targetWhere for partial unique index
    const [result] = await db((tx) =>
      tx
        .insert(userInventory)
        .values({
          userId,
          ingredientId,
          quantityLevel,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [userInventory.userId, userInventory.ingredientId],
          targetWhere: sql`${userInventory.ingredientId} IS NOT NULL`,
          set: {
            quantityLevel,
            updatedAt: new Date(),
          },
        })
        .returning()
    )

    return NextResponse.json({
      success: true,
      item: result
    })
  } catch (error) {
    console.error('Inventory POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
