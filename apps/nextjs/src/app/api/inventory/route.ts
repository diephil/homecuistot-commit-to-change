import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createUserDb, decodeSupabaseToken } from '@/db/client'
import { userInventory, ingredients } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET() {
  try {
    const supabase = await createClient()

    // Verify user authenticity
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get session for JWT token
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Decode JWT token for Drizzle RLS
    const token = decodeSupabaseToken(session.access_token)
    const db = createUserDb(token)

    // Type-safe query with RLS enforcement
    const inventory = await db((tx) =>
      tx
        .select({
          id: userInventory.id,
          ingredientId: userInventory.ingredientId,
          ingredientName: ingredients.name,
          ingredientCategory: ingredients.category,
          quantityLevel: userInventory.quantityLevel,
          isPantryStaple: userInventory.isPantryStaple,
          updatedAt: userInventory.updatedAt,
        })
        .from(userInventory)
        .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
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
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify user authenticity
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get session for JWT token
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Decode JWT token for Drizzle RLS
    const token = decodeSupabaseToken(session.access_token)
    const db = createUserDb(token)

    // Upsert inventory item - use targetWhere for partial unique index
    const [result] = await db((tx) =>
      tx
        .insert(userInventory)
        .values({
          userId: session.user.id,
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
}
