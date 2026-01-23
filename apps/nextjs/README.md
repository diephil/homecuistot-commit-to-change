This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

```bash
cp apps/nextjs/.env.local.example apps/nextjs/.env.local
```

Fill in the required values:

- `GOOGLE_GENERATIVE_AI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/apikey)
- `OPIK_URL_OVERRIDE` - Local Opik API URL (default: `http://localhost:5173/api`)
- `OPIK_PROJECT_NAME` - Opik project name for traces

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Management

This project uses Drizzle ORM with Supabase PostgreSQL for type-safe database operations.

### Drizzle ORM Setup

**Documentation:** See [`src/db/README.md`](./src/db/README.md) for detailed usage patterns.

**Quick Start:**
```typescript
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'
import { userInventory } from '@/db/schema'

// In Server Component, Server Action, or API Route
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/login')

const db = createUserDb({ accessToken: session.access_token })
const inventory = await db.select().from(userInventory)
```

**Key Files:**
- **Schema Definitions:** `src/db/schema/*.ts` - TypeScript table definitions
- **Database Client:** `src/db/client.ts` - Admin & user clients (RLS support)
- **Migrations:** `supabase/migrations/*.sql` - Generated SQL migrations
- **Tests:** `tests/db/` and `tests/integration/` - Schema & RLS tests

**Configuration:**
- `drizzle.config.ts` - Drizzle Kit configuration
- `vitest.config.ts` - Test framework setup
- `.env.local` - Database connection strings (see setup guide in `/specs/003-db-ops/quickstart.md`)

### Quick Concepts

**Local vs Production:**
- **Local:** Docker container on your machine (port 54322), auto-connected via `.env.local`
- **Production:** Your Supabase project in the cloud, requires linking via `supabase link`

**Database State:**
- Tests insert data but DON'T clean up automatically
- Use `db push --local` to apply new migrations (keeps existing data)
- Use `db reset --local` to start fresh (destroys all data)

**Migration Files:**
- Generated from TypeScript schema: `src/db/schema/*.ts` → `supabase/migrations/*.sql`
- Applied in order: 0000, 0001, 0002, etc.
- Never edit old migrations - always create new ones

### Migration Workflow

#### Local Development

1. **Generate migration from schema changes:**
```bash
set -a && source .env.local && set +a && pnpm drizzle-kit generate
```
**What it does:** Reads your TypeScript schema files and creates SQL migration files for any changes.
- Output: New `.sql` file in `supabase/migrations/`

2. **Review generated migration:**
```bash
cat supabase/migrations/*.sql
```
**What it does:** Shows you the SQL that will run on your database.
- Always review before applying to catch issues early.

3. **Apply migration to local database:**
```bash
pnpx supabase db push --local
```
**What it does:** Applies only new migrations without destroying existing data.
- Incrementally updates your local database schema.
- Preserves existing data (users, recipes, inventory, etc.).
- Safe to run multiple times - only applies new migrations.

4. **Verify migration:**
```bash
pnpx supabase migration list --local
```
**What it does:** Shows which migrations have been applied to your local database.

#### Production

Before deploying to production, link to your Supabase project:

```bash
pnpx supabase link
```
**What it does:** Connects the Supabase CLI to your production Supabase project.
- You'll be prompted for your project ref (found in Supabase dashboard).
- Only needed once per project.
- **Note:** Local development doesn't need linking - it connects via DATABASE_URL in `.env.local`.

Then push migrations:

```bash
pnpx supabase db push
```
**What it does:** Applies new migrations to your production database.
- Only applies new migrations (never destructive).
- Requires project to be linked first.

### Opik Prompt Management

Register LLM prompts to Opik for versioning and tracking:

```bash
# Local (uses .env.local)
pnpm prompt:voice
pnpm prompt:text
pnpm prompt:all

# Production (uses .env.prod)
pnpm prompt:voice:prod
pnpm prompt:text:prod
pnpm prompt:all:prod
```

**Note:** Local requires Opik running (`make opstart` from repo root). View prompts at http://localhost:5173.

### Running Tests

```bash
# Run all tests
pnpm test
```
**What it does:** Runs all test files in the project using Vitest.

```bash
# Run database tests only
pnpm test:db
```
**What it does:** Runs only database tests (`tests/db/*.test.ts`) to verify schema and queries work.

**Note:** Database tests insert test data. To clean up accumulated test data and start fresh:
```bash
pnpx supabase db reset --local
```
This drops and recreates the database, then applies all migrations from scratch.

### Schema Introspection (Advanced)

```bash
set -a && source .env.local && set +a && pnpm drizzle-kit introspect
```
**What it does:** Connects to your database and generates TypeScript schema files from the actual tables.
- Use this to verify your schema matches the database.
- Outputs `schema.ts` and `relations.ts` to `supabase/migrations/`.
- **Important:** These files are for comparison only - delete them after reviewing. Don't commit them.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
