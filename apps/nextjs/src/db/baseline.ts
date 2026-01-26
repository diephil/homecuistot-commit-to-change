import postgres from 'postgres'

async function baseline() {
  const connectionString = process.env.DATABASE_URL_DIRECT
  if (!connectionString) {
    throw new Error('DATABASE_URL_DIRECT is required')
  }

  const sql = postgres(connectionString)

  console.log('🔧 Creating Drizzle migrations table...')

  // Create migrations table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `

  console.log('📝 Inserting baseline migration records...')

  // Insert records for already-applied migrations
  const migrations = [
    { hash: '0000_striped_scarlet_witch', created_at: 1768855549563 },
    { hash: '0001_enable_rls_policies', created_at: 1768855549564 },
  ]

  for (const m of migrations) {
    // Check if already exists
    const existing = await sql`
      SELECT 1 FROM "__drizzle_migrations" WHERE hash = ${m.hash}
    `
    if (existing.length === 0) {
      await sql`
        INSERT INTO "__drizzle_migrations" (hash, created_at)
        VALUES (${m.hash}, ${m.created_at})
      `
      console.log(`  ✓ Marked ${m.hash} as applied`)
    } else {
      console.log(`  → ${m.hash} already marked`)
    }
  }

  console.log('✅ Baseline complete')
  await sql.end()
}

baseline()
