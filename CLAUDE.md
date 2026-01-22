@AGENTS.md

## Gemini Builds Reference

`gemini-builds/` folder: AI Studio mockups as reference. Code must NOT be used as-is - requires revision and proper integration following project standards -> They can only be used as a source of inspiration.

## Active Technologies
- TypeScript 5+ (strict mode), React 19, Next.js 16 + `@ai-sdk/google` (Gemini), Vercel AI SDK, RetroUI components, Tailwind CSS v4, `lucide-react` icons (004-onboarding-flow)
- Client-side state (React hooks) during onboarding flow only (004-onboarding-flow)

- TypeScript 5+ (strict mode), Node.js 18+ + drizzle-orm, drizzle-kit, @neondatabase/serverless (or postgres driver), @supabase/supabase-js, @supabase/ssr (003-db-ops)
- Supabase PostgreSQL (existing), Drizzle schema in src/db/schema/, migrations in drizzle/migrations/ (003-db-ops)
- TypeScript 5+ (strict mode), React 19, Next.js 16 + shadcn/ui, RetroUI registry (@retroui), Tailwind CSS v4, Reac (003-base-pages-ui)
- N/A (mock data only, no persistence) (003-base-pages-ui)

## Recent Changes

- 003-db-ops: Added TypeScript 5+ (strict mode), Node.js 18+ + drizzle-orm, drizzle-kit, @neondatabase/serverless (or postgres driver), @supabase/supabase-js, @supabase/ssr
