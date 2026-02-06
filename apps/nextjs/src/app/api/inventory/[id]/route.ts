import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/route-auth';
import { userInventory } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const DELETE = withAuth(async ({ userId, db, params }) => {
  try {
    const { id } = await params;

    // Delete item
    const [deletedItem] = await db((tx) =>
      tx
        .delete(userInventory)
        .where(
          and(
            eq(userInventory.id, id),
            eq(userInventory.userId, userId)
          )
        )
        .returning()
    );

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.error('Delete inventory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
