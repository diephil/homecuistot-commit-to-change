import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL_DIRECT;
  if (!connectionString) {
    throw new Error("DATABASE_URL_DIRECT is required");
  }

  console.log("🚀 Starting migrations...");
  console.log(`📁 Migrations folder: ./src/db/migrations`);

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    console.log("📋 Applying migrations...");
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
