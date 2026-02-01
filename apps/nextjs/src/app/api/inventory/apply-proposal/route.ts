/**
 * POST /api/inventory/apply-proposal
 *
 * Applies confirmed inventory update proposal to the database.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createUserDb, decodeSupabaseToken } from '@/db/client';
import { userInventory } from '@/db/schema';
import { sql } from 'drizzle-orm';
import type { InventoryUpdateProposal } from '@/types/inventory';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { proposal } = body as { proposal?: InventoryUpdateProposal };

    if (!proposal || !Array.isArray(proposal.recognized)) {
      return NextResponse.json(
        { error: 'Invalid proposal' },
        { status: 400 }
      );
    }

    if (proposal.recognized.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply updates via RLS-aware DB connection
    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    await db(async (tx) => {
      for (const update of proposal.recognized) {
        await tx
          .insert(userInventory)
          .values({
            userId: user.id,
            ingredientId: update.ingredientId,
            quantityLevel: update.proposedQuantity,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [userInventory.userId, userInventory.ingredientId],
            targetWhere: sql`${userInventory.ingredientId} IS NOT NULL`,
            set: {
              quantityLevel: update.proposedQuantity,
              updatedAt: new Date(),
            },
          });
      }
    });

    return NextResponse.json({
      success: true,
      updated: proposal.recognized.length,
    });
  } catch (error) {
    console.error('Apply proposal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
