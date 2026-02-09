/**
 * LLM Usage Past 7 Days — per-user call counts for the past 7 days
 *
 * Usage:
 *   pnpm usage          # local (uses .env.local)
 *   pnpm usage:prod     # production (uses .env.prod)
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
    const rows = await sql`
      SELECT
        l.user_id,
        u.email,
        u.raw_user_meta_data->>'full_name' AS name,
        count(*)::int AS calls_past_7_days
      FROM llm_usage_log l
      LEFT JOIN auth.users u ON u.id = l.user_id
      WHERE l.created_at >= (now() AT TIME ZONE 'UTC') - INTERVAL '7 days'
      GROUP BY l.user_id, u.email, u.raw_user_meta_data->>'full_name'
      ORDER BY calls_past_7_days DESC
    `;

    if (rows.length === 0) {
      console.log("\n📊 No LLM usage in past 7 days (UTC)\n");
      return;
    }

    const total = rows.reduce((sum, r) => sum + r.calls_past_7_days, 0);
    console.log(`\n📊 LLM usage past 7 days (UTC) — ${total} total call(s), ${rows.length} user(s)\n`);

    console.log(
      [
        "Calls".padEnd(8),
        "Email".padEnd(35),
        "Name".padEnd(25),
        "User ID",
      ].join(" | "),
    );
    console.log("-".repeat(110));

    for (const r of rows) {
      console.log(
        [
          String(r.calls_past_7_days).padEnd(8),
          (r.email ?? "—").padEnd(35),
          (r.name ?? "—").padEnd(25),
          r.user_id,
        ].join(" | "),
      );
    }

    console.log();
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
