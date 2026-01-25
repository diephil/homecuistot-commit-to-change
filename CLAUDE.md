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
- TypeScript 5, React 19, Next.js 16 + Next.js App Router, Supabase Auth (@supabase/ssr, @supabase/supabase-js), Drizzle ORM (006-admin-dashboard)
- Supabase PostgreSQL (user roles/permissions) (006-admin-dashboard)

**Frontend**: TypeScript 5+ (strict), React 19, Next.js 16, Tailwind CSS v4, RetroUI + shadcn/ui, lucide-react icons

**Backend**: Vercel AI SDK + `@ai-sdk/google` (Gemini), Supabase Auth

**Database**: Supabase PostgreSQL, Drizzle ORM

- Schema: `src/db/schema/`
- Migrations: `drizzle/migrations/`
- Deps: drizzle-orm, drizzle-kit, @neondatabase/serverless, @supabase/supabase-js, @supabase/ssr

## Next.js Patterns

**Authentication & Route Protection**:
- Next.js v16: `middleware.ts` → `proxy.ts` (file and function renamed)
- File: `src/proxy.ts` (NOT `src/middleware.ts`)
- Function: `export default async function proxy(request: NextRequest)` (NOT `middleware`)
- Migration: `npx @next/codemod@latest middleware-to-proxy .`
- Pattern: Define protected/public routes arrays, use Supabase `getSession()` for auth checks

## Recent Changes
- 006-admin-dashboard: Added TypeScript 5, React 19, Next.js 16 + Next.js App Router, Supabase Auth (@supabase/ssr, @supabase/supabase-js), Drizzle ORM
- Auth: Implemented proxy-based route protection with Supabase session validation
