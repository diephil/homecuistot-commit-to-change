import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/route-auth';
import { userInventory, unrecognizedItems } from '@/db/schema';
import { PersistRequestSchema, type PersistResponse } from '@/types/onboarding';
import { matchIngredients } from '@/lib/services/ingredient-matcher';

/**
 * T038-T047: Persist route for 019-onboarding-revamp
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 *
 * Persists user ingredients and pantry staples.
 */

export const maxDuration = 30;

export const POST = withAuth(async ({ userId, db, request }) => {
  try {
    // T038: Parse request with cookingSkill
    const body = await request.json();
    const parseResult = PersistRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.message },
        { status: 400 }
      );
    }

    const {
      ingredients: userIngredientNames,
      pantryStaples: userPantryStaples = [],
    } = parseResult.data;

    // Collect all unique ingredient names from user input
    const allIngredientNames = [
      ...new Set([
        ...userIngredientNames.map((n) => n.toLowerCase()),
        ...userPantryStaples.map((n) => n.toLowerCase()),
      ]),
    ];

    // T045: Execute all operations in a transaction
    const result = await db(async (tx) => {
      // T039: Match ingredient names against DB
      const matchResult = await matchIngredients({
        names: allIngredientNames,
        userId,
        tx,
      });

      // Create map for quick lookup
      const ingredientMap = new Map(
        matchResult.ingredients.map((i) => [i.name.toLowerCase(), i])
      );
      const unrecognizedMap = new Map(
        matchResult.unrecognizedItems.map((u) => [u.rawText.toLowerCase(), u])
      );

      let inventoryCreated = 0;

      // T040: Create new unrecognized_items for unrecognizedItemsToCreate
      if (matchResult.unrecognizedItemsToCreate.length > 0) {
        const insertedUnrecognized = await tx
          .insert(unrecognizedItems)
          .values(
            matchResult.unrecognizedItemsToCreate.map((rawText) => ({
              userId,
              rawText,
              context: 'ingredient',
            }))
          )
          .onConflictDoNothing()
          .returning();

        // Add newly created items to the map for inventory lookups
        for (const item of insertedUnrecognized) {
          unrecognizedMap.set(item.rawText.toLowerCase(), {
            id: item.id,
            rawText: item.rawText,
          });
        }
      }

      // T044: Insert user_inventory entries (quantity_level=3) for user-selected ingredients FIRST
      const userIngredientLower = userIngredientNames.map((n) => n.toLowerCase());

      for (const name of userIngredientLower) {
        const matched = ingredientMap.get(name);
        const unrecognized = unrecognizedMap.get(name);

        if (matched) {
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              ingredientId: matched.id,
              quantityLevel: 3,
              isPantryStaple: false,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        } else if (unrecognized) {
          // FR-033: Add unrecognized items (existing + newly created) to inventory
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              unrecognizedItemId: unrecognized.id,
              quantityLevel: 3,
              isPantryStaple: false,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        }
      }

      // Insert pantry staples with isPantryStaple=true
      const pantryStaplesLower = userPantryStaples.map((n) => n.toLowerCase());

      for (const name of pantryStaplesLower) {
        const matched = ingredientMap.get(name);
        const unrecognized = unrecognizedMap.get(name);

        if (matched) {
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              ingredientId: matched.id,
              quantityLevel: 3,
              isPantryStaple: true,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        } else if (unrecognized) {
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              unrecognizedItemId: unrecognized.id,
              quantityLevel: 3,
              isPantryStaple: true,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        }
      }

      return {
        inventoryCreated,
        unrecognizedCount: matchResult.unrecognizedItemsToCreate.length,
      };
    });

    // T047: Return PersistResponse with counts
    const response: PersistResponse = {
      success: true,
      ...result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[persist] Error:', error);

    return NextResponse.json(
      { error: 'Failed to persist data' },
      { status: 500 }
    );
  }
});
