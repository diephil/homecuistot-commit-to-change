@AGENTS.md

## Gemini Builds Reference

- `gemini-builds/` folder: AI Studio mockups as reference. Code must NOT be used as-is - requires revision and proper integration following project standards. Use only as inspiration.
- IMPORTANT: never modify the code inside `gemini-builds/`, you can only read the code

## Speckit Implementation Workflow

**Phase Completion Protocol**:

- Commit after each phase completes
- Prompt user: "Phase X complete. Continue to next phase or do something else?"
- Wait for explicit user approval before proceeding to next phase
- Use format: `git commit -m "feat(speckit): complete phase X - [brief description]"`

**Phase Transition Rules**:

- NEVER auto-proceed to next phase without user confirmation
- Offer options: [Continue] [Pause] [Adjust Plan] [Cancel]
- Preserve phase context for resume capability
- Create restore points at phase boundaries

## Git Workflow

**Commit Message Format**:

- Use Conventional Commits specification
- Format: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`
- Examples:
  - `feat(auth): add Google OAuth login`
  - `fix(onboarding): resolve voice input validation`
  - `chore(deps): update React to v19`
  - `docs(readme): add setup instructions`

## Active Technologies

**Frontend**: TypeScript 5+ (strict), React 19, Next.js 16 App Router, Tailwind CSS v4, RetroUI + shadcn/ui, lucide-react icons

**Backend**: Vercel AI SDK + `@ai-sdk/google` (Gemini), Supabase Auth (@supabase/ssr, @supabase/supabase-js)

**Database**: Supabase PostgreSQL, Drizzle ORM
- Schema: `apps/nextjs/src/db/schema/`
- Migrations: `apps/nextjs/src/db/migrations/` (Drizzle-managed, tracked in `drizzle` schema)
- Deps: drizzle-orm 0.45.1, drizzle-kit 0.31.8, postgres 3.4.8, @supabase/supabase-js, @supabase/ssr
- Notes: User roles/permissions, ingredients table exists

**Database Commands** (from `apps/nextjs/`):

```bash
# Development workflow
pnpm db:generate          # Generate migration from schema changes
pnpm db:migrate           # Apply migrations to local DB
pnpm db:status            # Show applied migrations + schema status

# Production workflow
pnpm db:baseline:prod     # Mark existing migrations as applied (one-time)
pnpm db:migrate:prod      # Apply migrations to production DB
pnpm db:status:prod       # Show production migration status

# Development utilities
pnpm db:push              # Push schema directly (no migration, dev only)
pnpm db:studio            # Open Drizzle Studio GUI
```

**Migration Notes**:
- Migrations tracked in `drizzle.__drizzle_migrations` table
- Schema-first approach: modify `src/db/schema/` → generate → migrate
- Use baseline script for existing production databases
- Verbose logging enabled in drizzle.config.ts

## Next.js Patterns

**Authentication & Route Protection**:
- Next.js v16: `middleware.ts` → `proxy.ts` (file and function renamed)
- File: `src/proxy.ts` (NOT `src/middleware.ts`)
- Function: `export default async function proxy(request: NextRequest)` (NOT `middleware`)
- Migration: `npx @next/codemod@latest middleware-to-proxy .`
- Pattern: Define protected/public routes arrays, use Supabase `getSession()` for auth checks

## Recent Changes
- 009-ingredient-migration: Ingredient data model + migration
- 008-drizzle-migrations: Drizzle migration system setup
- 006-admin-dashboard: Admin dashboard + user roles/permissions
