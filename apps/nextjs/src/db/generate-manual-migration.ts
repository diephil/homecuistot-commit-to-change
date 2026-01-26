import { readFileSync, writeFileSync, copyFileSync, readdirSync } from 'fs'
import { join } from 'path'

function generateManualMigration() {
  const migrationName = process.argv[2]

  if (!migrationName) {
    console.error('❌ Error: Migration name is required')
    console.error('Usage: pnpm db:generate:manual <migration-name>')
    console.error('Example: pnpm db:generate:manual seed_recipes')
    process.exit(1)
  }

  const migrationsDir = join(process.cwd(), 'src/db/migrations')
  const metaDir = join(migrationsDir, 'meta')
  const journalPath = join(metaDir, '_journal.json')

  console.log('🔧 Generating manual migration...\n')

  // Step 1: Find next migration index
  const sqlFiles = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const lastFile = sqlFiles[sqlFiles.length - 1]
  const lastIdx = lastFile ? parseInt(lastFile.split('_')[0]) : -1
  const nextIdx = lastIdx + 1

  const paddedIdx = nextIdx.toString().padStart(4, '0')
  const migrationTag = `${paddedIdx}_${migrationName}`
  const sqlFilename = `${migrationTag}.sql`
  const sqlPath = join(migrationsDir, sqlFilename)

  console.log(`📝 Creating migration: ${sqlFilename}`)

  // Step 2: Create SQL file with template
  const sqlTemplate = `-- Manual migration: ${migrationName}
-- Created: ${new Date().toISOString()}
--
-- Add your custom SQL statements below:
-- Example:
-- INSERT INTO recipes (id, name, description, is_seeded, user_id, created_at, updated_at)
-- VALUES
--   (gen_random_uuid(), 'Recipe Name', 'Description here', true, NULL, NOW(), NOW());
`

  writeFileSync(sqlPath, sqlTemplate, 'utf-8')
  console.log(`   ✓ Created: src/db/migrations/${sqlFilename}`)

  // Step 3: Update journal
  console.log('\n📋 Updating journal...')
  const journal = JSON.parse(readFileSync(journalPath, 'utf-8'))

  journal.entries.push({
    idx: nextIdx,
    version: '7',
    when: Date.now(),
    tag: migrationTag,
    breakpoints: true,
  })

  writeFileSync(journalPath, JSON.stringify(journal, null, 2) + '\n', 'utf-8')
  console.log('   ✓ Updated: src/db/migrations/meta/_journal.json')

  // Step 4: Copy last snapshot
  console.log('\n📸 Creating snapshot...')
  const snapshotFiles = readdirSync(metaDir)
    .filter((f) => f.match(/^\d{4}_snapshot\.json$/))
    .sort()

  const lastSnapshot = snapshotFiles[snapshotFiles.length - 1]
  const lastSnapshotIdx = lastSnapshot ? parseInt(lastSnapshot.split('_')[0]) : 0

  const sourceSnapshot = join(metaDir, `${lastSnapshotIdx.toString().padStart(4, '0')}_snapshot.json`)
  const targetSnapshot = join(metaDir, `${paddedIdx}_snapshot.json`)

  copyFileSync(sourceSnapshot, targetSnapshot)
  console.log(`   ✓ Copied: src/db/migrations/meta/${paddedIdx}_snapshot.json`)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('✅ Manual migration created successfully!')
  console.log('='.repeat(60))
  console.log(`\n📝 Edit your SQL file:`)
  console.log(`   src/db/migrations/${sqlFilename}`)
  console.log(`\n🚀 Apply migration:`)
  console.log(`   pnpm db:migrate`)
  console.log(`\n📊 Check status:`)
  console.log(`   pnpm db:status\n`)
}

generateManualMigration()
