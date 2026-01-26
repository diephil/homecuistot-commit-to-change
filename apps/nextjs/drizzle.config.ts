import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL_DIRECT) {
  throw new Error('DATABASE_URL_DIRECT is required in environment')
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
})
