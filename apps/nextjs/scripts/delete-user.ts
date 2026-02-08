/**
 * Delete User
 *
 * Safely deletes a user and all related records:
 * - user_recipes (cascade deletes recipe_ingredients)
 * - user_inventory
 * - unrecognized_items
 * - cooking_log
 * - auth.users
 *
 * Usage:
 *   pnpm delete-user <user-id>       # local (uses .env.local)
 *   pnpm delete-user:prod <user-id>  # production (uses .env.prod)
 */

import postgres from "postgres";
import * as readline from "readline";

async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("❌ Usage: pnpm delete-user <user-id>");
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL_DIRECT;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL_DIRECT not set");
    process.exit(1);
  }

  const sql = postgres(dbUrl, { prepare: false });

  try {
    // 1. Check if user exists
    const [user] = await sql`
      SELECT
        id,
        email,
        raw_user_meta_data->>'full_name' AS name,
        created_at
      FROM auth.users
      WHERE id = ${userId}
    `;

    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      process.exit(1);
    }

    console.log("\n📋 User to delete:");
    console.log(`   Email: ${user.email ?? "—"}`);
    console.log(`   Name: ${user.name ?? "—"}`);
    console.log(`   ID: ${user.id}`);
    console.log(
      `   Created: ${user.created_at ? new Date(user.created_at).toISOString() : "—"}`,
    );

    // 2. Count related records
    const [recipeCount] = await sql`
      SELECT COUNT(*) as count FROM public.user_recipes WHERE user_id = ${userId}
    `;
    const [inventoryCount] = await sql`
      SELECT COUNT(*) as count FROM public.user_inventory WHERE user_id = ${userId}
    `;
    const [unrecognizedCount] = await sql`
      SELECT COUNT(*) as count FROM public.unrecognized_items WHERE user_id = ${userId}
    `;
    const [cookingLogCount] = await sql`
      SELECT COUNT(*) as count FROM public.cooking_log WHERE user_id = ${userId}
    `;

    console.log("\n📊 Related records to delete:");
    console.log(`   Recipes: ${recipeCount?.count ?? 0}`);
    console.log(`   Inventory items: ${inventoryCount?.count ?? 0}`);
    console.log(`   Unrecognized items: ${unrecognizedCount?.count ?? 0}`);
    console.log(`   Cooking log entries: ${cookingLogCount?.count ?? 0}`);

    // 3. Confirm deletion
    console.log("\n⚠️  This action cannot be undone!");
    const confirmed = await askConfirmation(
      "\nType 'yes' or 'y' to confirm deletion: ",
    );

    if (!confirmed) {
      console.log("\n❌ Deletion cancelled");
      process.exit(0);
    }

    // 4. Delete in transaction
    console.log("\n🗑️  Deleting...");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sql.begin(async (txSql: any) => {
      // Note: Using 'as any' due to TransactionSql type issue in postgres v3.4.8
      // The type doesn't expose call signatures but works at runtime

      // Delete user_recipes (cascade deletes recipe_ingredients via FK)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const deletedRecipes = await (txSql)`
        DELETE FROM public.user_recipes WHERE user_id = ${userId}
      `;
      console.log(`   ✓ Deleted ${deletedRecipes.count} recipes`);

      // Delete user_inventory
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const deletedInventory = await (txSql)`
        DELETE FROM public.user_inventory WHERE user_id = ${userId}
      `;
      console.log(`   ✓ Deleted ${deletedInventory.count} inventory items`);

      // Delete unrecognized_items
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const deletedUnrecognized = await (txSql)`
        DELETE FROM public.unrecognized_items WHERE user_id = ${userId}
      `;
      console.log(`   ✓ Deleted ${deletedUnrecognized.count} unrecognized items`);

      // Delete cooking_log
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const deletedCookingLog = await (txSql)`
        DELETE FROM public.cooking_log WHERE user_id = ${userId}
      `;
      console.log(`   ✓ Deleted ${deletedCookingLog.count} cooking log entries`);

      // Delete user from auth.users
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await (txSql)`
        DELETE FROM auth.users WHERE id = ${userId}
      `;
      console.log(`   ✓ Deleted user account`);
    });

    console.log("\n✅ User deleted successfully\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
