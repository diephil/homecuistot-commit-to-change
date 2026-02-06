/**
 * POST /api/inventory/apply-proposal
 *
 * Applies confirmed inventory update proposal to the database.
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/route-auth';
import { userInventory } from '@/db/schema';
import { sql } from 'drizzle-orm';
import type { InventoryUpdateProposal } from '@/types/inventory';

export const POST = withAuth(async ({ userId, db, request }) => {
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

    // Apply updates via RLS-aware DB connection
    await db(async (tx) => {
      for (const update of proposal.recognized) {
        // Build values/set with optional isPantryStaple
        const hasPantryStapleChange = update.proposedPantryStaple !== undefined;

        await tx
          .insert(userInventory)
          .values({
            userId,
            ingredientId: update.ingredientId,
            quantityLevel: update.proposedQuantity,
            ...(hasPantryStapleChange && {
              isPantryStaple: update.proposedPantryStaple,
            }),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [userInventory.userId, userInventory.ingredientId],
            targetWhere: sql`${userInventory.ingredientId} IS NOT NULL`,
            set: {
              quantityLevel: update.proposedQuantity,
              ...(hasPantryStapleChange && {
                isPantryStaple: update.proposedPantryStaple,
              }),
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
});
