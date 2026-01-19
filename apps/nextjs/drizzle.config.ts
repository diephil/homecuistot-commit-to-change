import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL_DIRECT) {
  throw new Error('DATABASE_URL_DIRECT is required in environment')
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT,
  },
})
