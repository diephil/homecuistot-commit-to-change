import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createUserDb, decodeSupabaseToken } from '@/db/client';
import { userInventory } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Verify user authenticity
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get session for JWT token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Decode JWT token for Drizzle RLS
    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    // Get current item
    const [currentItem] = await db((tx) =>
      tx
        .select()
        .from(userInventory)
        .where(
          and(
            eq(userInventory.id, id),
            eq(userInventory.userId, session.user.id)
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
            eq(userInventory.userId, session.user.id)
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
}
