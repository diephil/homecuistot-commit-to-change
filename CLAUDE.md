# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development** (from repo root):
```bash
make dev          # Next.js only
make dev-all      # Next.js + Opik + Supabase (full stack)
make down         # Stop Opik + Supabase
```

**Next.js** (from `apps/nextjs/`):
```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Run all tests
pnpm test:db      # Run database tests only
```

**Database** (from `apps/nextjs/`):
```bash
pnpm db:generate           # Generate migration from schema changes
pnpm db:migrate            # Apply migrations to local DB
pnpm db:status             # Show applied migrations + schema status
pnpm db:migrate:prod       # Apply migrations to production
pnpm db:baseline:prod      # Mark existing migrations as applied (one-time)
pnpm db:push               # Push schema directly (dev only, no migration)
pnpm db:studio             # Open Drizzle Studio GUI
```

**Opik Prompts** (from `apps/nextjs/`):
```bash
pnpm prompt:all            # Register all prompts (local)
pnpm prompt:all:prod       # Register all prompts (production)
pnpm dataset:register      # Register datasets (local)
pnpm eval                  # Run single evaluation (local)
pnpm eval:all              # Run all evaluations (local)
```

## Architecture

### Monorepo Structure
- `apps/nextjs/` - Main Next.js 16 app (React 19, TypeScript strict mode)
- `infra/opik/` - Opik submodule for LLM tracing (Docker Compose)

### Tech Stack
- **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS v4, RetroUI + shadcn/ui, lucide-react
- **AI/LLM**: Vercel AI SDK + `@ai-sdk/google` (Gemini), OpenAI (Whisper), opik-gemini for tracing
- **Database**: Supabase PostgreSQL via Drizzle ORM 0.45.1
- **Auth**: Supabase Auth (@supabase/ssr) with Google OAuth
- **Testing**: Vitest
- **Validation**: Zod

### AI Integration Patterns

**OpenTelemetry → Opik**:
- `src/instrumentation.ts` - Global OTel registration with `OpikExporter`
- All AI calls automatically traced to Opik
- Use `OpikExporter.getSettings()` for telemetry metadata in AI route handlers

**Gemini Limitations**:
- **No `z.enum()` in JSON schemas**: Gemini `responseSchema` does not support enum constraints
- Use `z.string()` instead and validate in prompt text or post-process
- Example: `confidence: z.string()` + describe valid values in prompt (NOT `z.enum(['high', 'medium', 'low'])`)

**API Routes**:
- Located in `src/app/api/*/route.ts`
- Use `withAuth()` or `withUser()` wrappers from `@/lib/services/route-auth.ts`

### Authentication

**Middleware**:
- Next.js v16: `src/proxy.ts` (NOT `middleware.ts`)
- Function named `proxy` (NOT `middleware`)
- Protected routes: `/app`, `/admin`
- Public routes: `/login`, `/`

**Route Protection**:
- `withAuth(handler)` - Full auth + RLS-scoped DB client → `{ user, userId, db, request, params }`
- `withUser(handler)` - User verification only → `{ user, request, params }`
- Location: `apps/nextjs/src/lib/services/route-auth.ts`
- Admin routes use separate `requireAdmin()` from `admin-auth.ts`

**Server Components**:
```typescript
import { createClient } from '@/utils/supabase/server'

const supabase = await createClient() // async in Next.js 16
const { data: { user } } = await supabase.auth.getUser()
```

**Browser Client**:
```typescript
import { createBrowserClient } from '@/utils/supabase/client'
```

**OAuth Providers**:
- **Google OAuth** - Primary authentication method
- **Discord OAuth** - Enabled for project review (allows Encode jury to connect via Discord)
- Both configured in Supabase dashboard with client ID/secret in `.env.local`

**OAuth Callback**:
- Route: `/auth/callback`
- Exchanges OAuth code for session

### Database

**Schema**: `apps/nextjs/src/db/schema/`
- `ingredients.ts` - 5931 ingredients across 30 categories
- `user-inventory.ts` - User pantry items (quantity levels 0-3)
- `user-recipes.ts` - User saved recipes
- `recipe-ingredients.ts` - Recipe ingredient links
- `cooking-log.ts` - Cooking history
- `unrecognized-items.ts` - Items not matched to ingredients
- `enums.ts` - Shared enums (ingredient categories, quantity levels, etc.)

**Migrations**: `apps/nextjs/src/db/migrations/`
- Drizzle-managed, tracked in `drizzle.__drizzle_migrations` table
- Schema-first: modify `src/db/schema/` → `pnpm db:generate` → `pnpm db:migrate`
- Verbose logging enabled in `drizzle.config.ts`

**Client Creation**:
```typescript
import { createClient } from '@/utils/supabase/server'
import { createUserDb } from '@/db/client'

// User client (RLS enforced)
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
const db = createUserDb({ accessToken: session.access_token })

// Admin client (RLS bypassed - scripts/seeds only)
import { adminDb } from '@/db/client'
```

**RLS (Row Level Security)**:
- **ALWAYS use `createUserDb()` in user-facing code** (Server Components, Server Actions, API Routes)
- **NEVER use `adminDb` in user-facing code** - only for scripts, seeds, migrations
- User client automatically filters data to current user via RLS policies

**Query Patterns**:
```typescript
// Type-safe queries with RLS
const inventory = await db((tx) =>
  tx.select().from(userInventory)
)

// Transactions
await db((tx) => {
  // Multi-step atomic operations
})

// Joins
const data = await db((tx) =>
  tx.select()
    .from(userInventory)
    .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
)
```

See `apps/nextjs/src/db/README.md` for comprehensive query patterns, RLS usage, and performance tips.

### Component Organization

**Structure** (`apps/nextjs/src/components/`):
```
components/
├── ErrorBoundary.tsx    # Global error handling
├── PageContainer.tsx    # Global layout wrapper
├── app/                 # App page domain
├── inventory/           # Inventory page domain
├── recipes/             # Recipes page domain
├── admin/               # Admin page domain
├── landing/             # Landing page domain
├── shared/              # Cross-domain reusable components
└── ui/                  # Base UI primitives
```

**Rules**:
- **PascalCase filenames**: `RecipeCard.tsx` (NOT `recipe-card.tsx`)
- **Domain folders**: Page-specific components in their domain folder
- **shared/**: UI primitives (Button, Card, Badge), cross-domain components
- **Root level**: Only truly global components (ErrorBoundary, PageContainer)
- **Placement**: Used by 1 page → domain folder | Used by 2+ pages → `shared/` | Global wrapper → root

### Coding Patterns

**Named Parameters**:
- Use named parameters for functions with >2 params or similar types
```typescript
// Good
function updateInventory(params: { id: string, quantity: number, userId: string })

// Bad (>2 params)
function updateInventory(id: string, quantity: number, userId: string)
```

**Reusability First**:
- Create reusable components before using them
- Create reusable services/libs before using them
- Same principle for backend logic reaching the database

**Route Handlers (Next.js 16)**:
```typescript
// Dynamic params are Promise-based
export const POST = withAuth(async ({ userId, db, request, params }) => {
  const { id } = await params // params is Promise<{ id: string }>
  // ...
})

// Can export alongside maxDuration
export const POST = withAuth(...)
export const maxDuration = 30
```

## Gemini Builds Reference

- `idea-prototypes/` folder contains AI Studio mockups as reference
- Code must NOT be used as-is - requires revision and proper integration following project standards
- Use only as inspiration
- **IMPORTANT**: Never modify code inside `idea-prototypes/`, only read

## Git Workflow

**Commit Message Format** (Conventional Commits):
```
<type>(<scope>): <description>

Types: feat, fix, chore, docs, style, refactor, test, perf
Examples:
  feat(auth): add Google OAuth login
  fix(onboarding): resolve voice input validation
  chore(deps): update React to v19
```

## Environment Variables

Template: `apps/nextjs/env.local-template`

Required in `apps/nextjs/.env.local`:
```bash
# Google AI Studio (Gemini) — https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY=
GOOGLE_GENAI_API_KEY=

# OpenAI (Whisper transcription) — https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Opik LLM tracing (local by default)
OPIK_URL_OVERRIDE=http://localhost:5173/api
OPIK_PROJECT_NAME=homecuistot-hackathon
OPIK_WORKSPACE=
OPIK_API_KEY=

# Supabase OAuth providers (configure in Supabase dashboard)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_SECRET=

# Supabase (local defaults after `make sbstart`)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Drizzle ORM / PostgreSQL (local Supabase defaults)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DATABASE_URL_DIRECT=postgresql://postgres:postgres@localhost:54322/postgres

# Admin access (comma-separated Supabase user UUIDs)
ADMIN_USER_IDS=
```

## Active Technologies
- TypeScript 5.x (strict mode), Next.js 16 + Drizzle ORM 0.45.1, Supabase Auth (@supabase/ssr), Vercel AI SDK (031-llm-rate-limit)
- Supabase PostgreSQL via Drizzle ORM with RLS (031-llm-rate-limit)

## Recent Changes
- 031-llm-rate-limit: Added TypeScript 5.x (strict mode), Next.js 16 + Drizzle ORM 0.45.1, Supabase Auth (@supabase/ssr), Vercel AI SDK
