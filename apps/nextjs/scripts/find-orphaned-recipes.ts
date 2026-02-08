/**
 * Find Orphaned Records
 *
 * Finds orphaned records across all user-related tables:
 * - user_recipes with user_id not in auth.users
 * - user_inventory with user_id not in auth.users
 * - unrecognized_items with user_id not in auth.users
 * - recipe_ingredients with recipe_id not in user_recipes
 * - cooking_log with user_id not in auth.users or recipe_id not in user_recipes
 *
 * Usage:
 *   pnpm orphaned       # local (uses .env.local)
 *   pnpm orphaned:prod  # production (uses .env.prod)
 */

import postgres from "postgres";

async function main() {
  const dbUrl = process.env.DATABASE_URL_DIRECT;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL_DIRECT not set");
    process.exit(1);
  }

  const sql = postgres(dbUrl, { prepare: false });

  try {
    let foundOrphans = false;

    // 1. Orphaned user_recipes
    const orphanedRecipes = await sql`
      SELECT
        ur.id,
        ur.name,
        ur.user_id,
        ur.created_at,
        (SELECT COUNT(*) FROM recipe_ingredients ri WHERE ri.recipe_id = ur.id) as ingredient_count
      FROM public.user_recipes ur
      WHERE NOT EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = ur.user_id
      )
      ORDER BY ur.created_at DESC
    `;

    if (orphanedRecipes.length > 0) {
      foundOrphans = true;
      console.log(`\n⚠️  ${orphanedRecipes.length} orphaned user_recipes\n`);
      console.log(
        [
          "Created".padEnd(22),
          "Recipe Name".padEnd(40),
          "Ingredients".padEnd(12),
          "Orphaned User ID",
        ].join(" | "),
      );
      console.log("-".repeat(120));
      for (const r of orphanedRecipes) {
        const created = r.created_at
          ? new Date(r.created_at).toISOString().replace("T", " ").slice(0, 19)
          : "—";
        console.log(
          [
            created.padEnd(22),
            (r.name ?? "—").padEnd(40),
            String(r.ingredient_count ?? 0).padEnd(12),
            r.user_id ?? "—",
          ].join(" | "),
        );
      }
      console.log();
    }

    // 2. Orphaned user_inventory
    const orphanedInventory = await sql`
      SELECT
        ui.id,
        ui.user_id,
        ui.quantity_level,
        ui.updated_at,
        COALESCE(i.name, uri.raw_text) as item_name
      FROM public.user_inventory ui
      LEFT JOIN public.ingredients i ON ui.ingredient_id = i.id
      LEFT JOIN public.unrecognized_items uri ON ui.unrecognized_item_id = uri.id
      WHERE NOT EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = ui.user_id
      )
      ORDER BY ui.updated_at DESC
    `;

    if (orphanedInventory.length > 0) {
      foundOrphans = true;
      console.log(`\n⚠️  ${orphanedInventory.length} orphaned user_inventory\n`);
      console.log(
        [
          "Updated".padEnd(22),
          "Item Name".padEnd(40),
          "Qty".padEnd(5),
          "Orphaned User ID",
        ].join(" | "),
      );
      console.log("-".repeat(120));
      for (const inv of orphanedInventory) {
        const updated = inv.updated_at
          ? new Date(inv.updated_at).toISOString().replace("T", " ").slice(0, 19)
          : "—";
        console.log(
          [
            updated.padEnd(22),
            (inv.item_name ?? "—").padEnd(40),
            String(inv.quantity_level ?? 0).padEnd(5),
            inv.user_id ?? "—",
          ].join(" | "),
        );
      }
      console.log();
    }

    // 3. Orphaned unrecognized_items
    const orphanedUnrecognized = await sql`
      SELECT
        uri.id,
        uri.user_id,
        uri.raw_text,
        uri.created_at
      FROM public.unrecognized_items uri
      WHERE NOT EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = uri.user_id
      )
      ORDER BY uri.created_at DESC
    `;

    if (orphanedUnrecognized.length > 0) {
      foundOrphans = true;
      console.log(`\n⚠️  ${orphanedUnrecognized.length} orphaned unrecognized_items\n`);
      console.log(
        [
          "Created".padEnd(22),
          "Raw Text".padEnd(50),
          "Orphaned User ID",
        ].join(" | "),
      );
      console.log("-".repeat(120));
      for (const u of orphanedUnrecognized) {
        const created = u.created_at
          ? new Date(u.created_at).toISOString().replace("T", " ").slice(0, 19)
          : "—";
        console.log(
          [
            created.padEnd(22),
            (u.raw_text ?? "—").padEnd(50),
            u.user_id ?? "—",
          ].join(" | "),
        );
      }
      console.log();
    }

    // 4. Orphaned recipe_ingredients (recipe_id not in user_recipes)
    const orphanedRecipeIngredients = await sql`
      SELECT
        ri.id,
        ri.recipe_id,
        ri.created_at,
        COALESCE(i.name, uri.raw_text) as ingredient_name
      FROM public.recipe_ingredients ri
      LEFT JOIN public.ingredients i ON ri.ingredient_id = i.id
      LEFT JOIN public.unrecognized_items uri ON ri.unrecognized_item_id = uri.id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.user_recipes ur WHERE ur.id = ri.recipe_id
      )
      ORDER BY ri.created_at DESC
    `;

    if (orphanedRecipeIngredients.length > 0) {
      foundOrphans = true;
      console.log(`\n⚠️  ${orphanedRecipeIngredients.length} orphaned recipe_ingredients\n`);
      console.log(
        [
          "Created".padEnd(22),
          "Ingredient".padEnd(50),
          "Orphaned Recipe ID",
        ].join(" | "),
      );
      console.log("-".repeat(120));
      for (const ri of orphanedRecipeIngredients) {
        const created = ri.created_at
          ? new Date(ri.created_at).toISOString().replace("T", " ").slice(0, 19)
          : "—";
        console.log(
          [
            created.padEnd(22),
            (ri.ingredient_name ?? "—").padEnd(50),
            ri.recipe_id ?? "—",
          ].join(" | "),
        );
      }
      console.log();
    }

    // 5. Orphaned cooking_log (user_id or recipe_id issues)
    const orphanedCookingLog = await sql`
      SELECT
        cl.id,
        cl.user_id,
        cl.recipe_id,
        cl.recipe_name,
        cl.cooked_at,
        CASE
          WHEN NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = cl.user_id) THEN 'user'
          WHEN cl.recipe_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_recipes ur WHERE ur.id = cl.recipe_id) THEN 'recipe'
          ELSE 'unknown'
        END as orphan_type
      FROM public.cooking_log cl
      WHERE NOT EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = cl.user_id
      )
      OR (
        cl.recipe_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM public.user_recipes ur WHERE ur.id = cl.recipe_id
        )
      )
      ORDER BY cl.cooked_at DESC
    `;

    if (orphanedCookingLog.length > 0) {
      foundOrphans = true;
      console.log(`\n⚠️  ${orphanedCookingLog.length} orphaned cooking_log\n`);
      console.log(
        [
          "Cooked At".padEnd(22),
          "Recipe Name".padEnd(35),
          "Orphan Type".padEnd(12),
          "Orphaned ID",
        ].join(" | "),
      );
      console.log("-".repeat(120));
      for (const cl of orphanedCookingLog) {
        const cooked = cl.cooked_at
          ? new Date(cl.cooked_at).toISOString().replace("T", " ").slice(0, 19)
          : "—";
        const orphanedId = cl.orphan_type === "user" ? cl.user_id : cl.recipe_id;
        console.log(
          [
            cooked.padEnd(22),
            (cl.recipe_name ?? "—").padEnd(35),
            (cl.orphan_type ?? "—").padEnd(12),
            orphanedId ?? "—",
          ].join(" | "),
        );
      }
      console.log();
    }

    if (!foundOrphans) {
      console.log("\n✅ No orphaned records found\n");
    }
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
