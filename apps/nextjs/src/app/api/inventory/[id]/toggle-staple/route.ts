import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/route-auth';
import { userInventory } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const PATCH = withAuth(async ({ userId, db, params }) => {
  try {
    const { id } = await params;

    // Get current item
    const [currentItem] = await db((tx) =>
      tx
        .select()
        .from(userInventory)
        .where(
          and(
            eq(userInventory.id, id),
            eq(userInventory.userId, userId)
          )
        )
    );

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Toggle isPantryStaple
    const [updatedItem] = await db((tx) =>
      tx
        .update(userInventory)
        .set({
          isPantryStaple: !currentItem.isPantryStaple,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userInventory.id, id),
            eq(userInventory.userId, userId)
          )
        )
        .returning()
    );

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        isPantryStaple: updatedItem.isPantryStaple,
      },
    });
  } catch (error) {
    console.error('Toggle staple error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
