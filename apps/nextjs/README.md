This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🎥 Demo

## 🚀 Getting Started

### ⚙️ Environment Setup

```bash
cp apps/nextjs/.env.local.example apps/nextjs/.env.local
```

Fill in the required values:

- `GOOGLE_GENERATIVE_AI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/apikey)
- `OPIK_URL_OVERRIDE` - Local Opik API URL (default: `http://localhost:5173/api`)
- `OPIK_PROJECT_NAME` - Opik project name for traces

### 🏃 Run Development Server

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

## 🗄️ Database Management

This project uses Drizzle ORM with Supabase PostgreSQL for type-safe database operations.

**Documentation:** See [`src/db/README.md`](./src/db/README.md) for detailed usage patterns.

### ⚡ Quick Start

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

### 📁 Key Files

- **Schema:** `src/db/schema/*.ts` - TypeScript table definitions
- **Client:** `src/db/client.ts` - Admin & user clients (RLS support)
- **Migrations:** `supabase/migrations/*.sql` - Generated SQL (applied in order: 0000, 0001, etc.)
- **Tests:** `tests/db/` and `tests/integration/`
- **Config:** `drizzle.config.ts`, `vitest.config.ts`, `.env.local`

### 💻 Common Commands

| Command | Purpose |
|---------|---------|
| `set -a && source .env.local && set +a && pnpm drizzle-kit generate` | Generate migration from schema changes |
| `pnpx supabase db push --local` | Apply migrations (keeps data) |
| `pnpx supabase db reset --local` | Reset database (destroys data) |
| `pnpx supabase migration list --local` | Show applied migrations |
| `pnpm test` / `pnpm test:db` | Run all tests / DB tests only |

### 🔄 Workflows

#### 🛠️ Local Development

1. **Modify schema** in `src/db/schema/*.ts`

2. **Generate migration:**
   ```bash
   set -a && source .env.local && set +a && pnpm drizzle-kit generate
   ```
   Creates `.sql` file in `supabase/migrations/`

3. **Review migration:**
   ```bash
   cat supabase/migrations/*.sql
   ```

4. **Apply to local DB:**
   ```bash
   pnpx supabase db push --local
   ```
   Incrementally updates schema, preserves existing data

5. **Verify:**
   ```bash
   pnpx supabase migration list --local
   ```

**Environment:**
- **Local:** Docker container (port 54322), auto-connected via `.env.local`
- **Production:** Cloud Supabase, requires `pnpx supabase link` (one-time setup)

**Migration Rules:**
- Never edit old migrations - always create new ones
- `db push` applies new migrations only (non-destructive)
- `db reset` drops and recreates from scratch (destructive)

#### 🚀 Production Deployment

1. **Link project** (one-time):
   ```bash
   pnpx supabase link
   ```
   Connects CLI to your Supabase project (prompts for project ref from dashboard)

2. **Push migrations:**
   ```bash
   pnpx supabase db push
   ```
   Applies new migrations to production (non-destructive)

### 🤖 Opik Prompt Management

Register LLM prompts for versioning and tracking:

```bash
# Local (requires Opik running: make opstart from repo root)
pnpm prompt:all

# Production
pnpm prompt:all:prod
```

View local prompts at http://localhost:5173

### 🧪 Testing

```bash
pnpm test       # All tests
pnpm test:db    # Database tests only
```

**Note:** Tests insert data without cleanup. Use `pnpx supabase db reset --local` to clear accumulated test data.

### 🔍 Schema Introspection (Advanced)

```bash
set -a && source .env.local && set +a && pnpm drizzle-kit introspect
```

Generates TypeScript schema from actual database tables for verification. Output files are for comparison only - delete after reviewing, don't commit.
