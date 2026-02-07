/**
 * List Users — ordered newest to oldest
 *
 * Usage:
 *   pnpm users          # local (uses .env.local)
 *   pnpm users:prod     # production (uses .env.prod)
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
    const users = await sql`
      SELECT
        id,
        email,
        raw_user_meta_data->>'full_name' AS name,
        created_at,
        last_sign_in_at
      FROM auth.users
      ORDER BY created_at DESC
    `;

    console.log(`\n👥 ${users.length} user(s)\n`);
    console.log(
      [
        "Created".padEnd(22),
        "Last Sign-In".padEnd(22),
        "Email".padEnd(35),
        "Name",
      ].join(" | "),
    );
    console.log("-".repeat(100));

    for (const u of users) {
      const created = u.created_at
        ? new Date(u.created_at).toISOString().replace("T", " ").slice(0, 19)
        : "—";
      const lastSignIn = u.last_sign_in_at
        ? new Date(u.last_sign_in_at)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19)
        : "—";
      console.log(
        [
          created.padEnd(22),
          lastSignIn.padEnd(22),
          (u.email ?? "—").padEnd(35),
          u.name ?? "—",
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
