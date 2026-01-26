import postgres from 'postgres'

async function checkStatus() {
  const connectionString = process.env.DATABASE_URL_DIRECT
  if (!connectionString) {
    throw new Error('DATABASE_URL_DIRECT is required')
  }

  const sql = postgres(connectionString)

  console.log('📊 Migration Status Report\n')
  console.log('='.repeat(50))

  try {
    // Check migration tracking table
    console.log('\n🗂️  Applied Migrations (drizzle.__drizzle_migrations):')
    const migrations = await sql`
      SELECT id, hash, created_at
      FROM drizzle."__drizzle_migrations"
      ORDER BY id
    `

    if (migrations.length === 0) {
      console.log('  ⚠️  No migrations applied yet')
    } else {
      for (const m of migrations) {
        const date = new Date(Number(m.created_at))
        console.log(`  ${m.id}. ${m.hash}`)
        console.log(`     Applied: ${date.toISOString()}`)
      }
    }

    // Check database schema
    console.log('\n📋 Database Schema:')
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    console.log(`  Tables: ${tables.length} total`)
    for (const t of tables) {
      console.log(`    • ${t.table_name}`)
    }

    // Check enum types
    const enums = await sql`
      SELECT t.typname
      FROM pg_type t
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      AND t.typtype = 'e'
      ORDER BY t.typname
    `
    console.log(`\n  Enum Types: ${enums.length} total`)
    for (const e of enums) {
      console.log(`    • ${e.typname}`)
    }

    // Check RLS status
    const rlsTables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND rowsecurity = true
      ORDER BY tablename
    `
    console.log(`\n  RLS Enabled Tables: ${rlsTables.length} total`)
    for (const t of rlsTables) {
      console.log(`    • ${t.tablename}`)
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ Status check complete\n')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await sql.end()
  }
}

checkStatus()
