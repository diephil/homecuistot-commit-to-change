import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT!,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'drizzle',
  },
})
