@AGENTS.md

## Coding approach

- In React, when it makes sense, create first a re-usable component before using it.
- In the backend logic, same principle, create first a re-usable service or lib before using it.

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
- TypeScript 5+ (strict mode) + React 19, Next.js 16 App Router, Drizzle ORM 0.45.1, @google/genai (Gemini 2.5-Flash-Lite), Zod, opik-gemini, OpenAI (Whisper) (025-onboarding-integration)
- Supabase PostgreSQL via Drizzle (no schema changes), localStorage (story state) (025-onboarding-integration)
- TypeScript 5+ (strict mode) + Next.js 16 App Router (built-in PWA metadata support via Metadata API) (026-pwa-support)
- N/A (config-only feature) (026-pwa-support)

- TypeScript 5+ (strict mode), React 19, Next.js 16 App Router + Drizzle ORM 0.45.1, @supabase/supabase-js, Tailwind CSS v4, RetroUI components, lucide-react icons (001-unrecognized-items-display)
- Supabase PostgreSQL (user_inventory, unrecognized_items, ingredients tables) (001-unrecognized-items-display)
- TypeScript 5+ (strict mode), React 19, Next.js 16 App Router + Next.js 16, React 19, Tailwind CSS v4, existing shared components (Button, Text from `@/components/shared`) (022-homepage-revamp)
- N/A (no data persistence) (022-homepage-revamp)
- TypeScript 5+ (strict mode) + React 19, Next.js 16 App Router, Tailwind CSS v4, Drizzle ORM 0.45.1, @google/genai (Gemini), Zod (024-story-onboarding)
- localStorage (during flow) + Supabase PostgreSQL via Drizzle (on completion) (024-story-onboarding)

- TypeScript 5+ (strict mode) + React 19, Next.js 16, Drizzle ORM 0.45.1, Zod, @google/genai (Gemini) (010-user-pantry-staples)
- Supabase PostgreSQL via Drizzle (010-user-pantry-staples)
- TypeScript 5+ (strict mode) + React 19, Next.js 16, Drizzle ORM 0.45.1, @google/genai (Gemini), Zod (011-onboarding-data-persist)
- Supabase PostgreSQL via Drizzle ORM (011-onboarding-data-persist)
- TypeScript 5+ (strict mode) + Drizzle ORM 0.45.1, postgres 3.4.8, Next.js 16 (012-schema-refactor)
- TypeScript 5+ (strict mode) + React 19, Next.js 16, Drizzle ORM 0.45.1, @google/genai (Gemini), Zod, opik (013-recipe-management)
- TypeScript 5+ (strict mode) + React 19, Next.js 16, Drizzle ORM 0.45.1, @google/genai (Gemini 2.0 Flash), Zod, Opik (014-inventory-page-rework)
- Supabase PostgreSQL via Drizzle ORM (user_inventory, ingredients tables) (014-inventory-page-rework)
- TypeScript 5+ (strict mode) + React 19, Next.js 16 App Router, Tailwind CSS v4, RetroUI components, Drizzle ORM 0.45.1 (015-app-page-revamp)
- Supabase PostgreSQL via Drizzle (cooking_log, user_inventory, recipe_ingredients tables exist) (015-app-page-revamp)
- TypeScript 5+ (strict mode) + React 19, Next.js 16, @google/genai (Gemini 2.0 Flash), Zod, opik-gemini (016-voice-recipe-editor)
- Supabase PostgreSQL via Drizzle (existing recipes, ingredients tables) (016-voice-recipe-editor)
- TypeScript 5+ (strict mode) + React 19, Next.js 16, Drizzle ORM 0.45.1, Supabase Auth (017-demo-data-reset)
- Supabase PostgreSQL (user_inventory, user_recipes, recipe_ingredients, ingredients tables) (017-demo-data-reset)
- TypeScript 5+ (strict mode) + React 19, Next.js 16, Drizzle ORM 0.45.1, @google/genai (Gemini 2.0 Flash), Zod, opik-gemini (019-onboarding-revamp)
- Supabase PostgreSQL via Drizzle (user_inventory, ingredients, unrecognized_items, user_recipes, recipe_ingredients) (019-onboarding-revamp)

**Frontend**: TypeScript 5+ (strict), React 19, Next.js 16 App Router, Tailwind CSS v4, RetroUI + shadcn/ui, lucide-react icons

**Backend**: Vercel AI SDK + `@ai-sdk/google` (Gemini), Supabase Auth (@supabase/ssr, @supabase/supabase-js)

**Database**: Supabase PostgreSQL, Drizzle ORM

- Schema: `apps/nextjs/src/db/schema/`
- Migrations: `apps/nextjs/src/db/migrations/` (Drizzle-managed, tracked in `drizzle` schema)
- Deps: drizzle-orm 0.45.1, drizzle-kit 0.31.8, postgres 3.4.8, @supabase/supabase-js, @supabase/ssr
- Notes: User roles/permissions, ingredients table exists
- **Ingredient Taxonomy**: 30 categories (non_classified, e100_e199, ferments, dairy, cheeses, salt, meat, starch, oils_and_fats, alcohol, aroma, cereal, cocoa, water, fruit, vegetables, beans, nuts, seed, plants, mushroom, fish, molluscs, crustaceans, bee_ingredients, synthesized, poultry, eggs, parts, compound_ingredients)
- **Ingredient Data**: 5931 ingredients populated via migration 0003_insert_ingredients

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

## Gemini API Limitations

- **No `z.enum()` in JSON schemas**: Gemini `responseSchema` does not support enum constraints from `z.enum()`. Use `z.string()` instead and validate in prompt text or post-process.
  - Bad: `confidence: z.enum(['high', 'medium', 'low'])`
  - Good: `confidence: z.string()` + describe valid values in prompt

## Next.js Patterns

**Authentication & Route Protection**:

- Next.js v16: `middleware.ts` → `proxy.ts` (file and function renamed)
- File: `src/proxy.ts` (NOT `src/middleware.ts`)
- Function: `export default async function proxy(request: NextRequest)` (NOT `middleware`)
- Migration: `npx @next/codemod@latest middleware-to-proxy .`
- Pattern: Define protected/public routes arrays, use Supabase `getSession()` for auth checks
- When implementing a new React component, we first think about reusability and ensure the component is shared and reusable whenever it makes sense
- Same principle for the code logic that reaches out to our database. We want to make those pieces of code reusable and place them into a shared folder that can be used by other components later on

## Component Organization

**Structure** (`apps/nextjs/src/components/`):

```
components/
├── ErrorBoundary.tsx    (global - error handling)
├── PageContainer.tsx    (global - layout wrapper)
├── app/                 (app page domain - header, nav, modals)
├── inventory/           (inventory page domain)
├── recipes/             (recipes page domain)
└── shared/              (cross-domain reusable components)
```

**Rules**:

- **PascalCase filenames**: `RecipeCard.tsx`, not `recipe-card.tsx`
- **Domain folders**: page-specific components go in their domain folder
- **shared/**: UI primitives (Button, Card, Badge), cross-domain components (HelpModal, VoiceInput)
- **Root level**: only truly global components (ErrorBoundary, PageContainer)
- **Barrel exports**: `shared/index.ts` exports all shared components

**Placement decision**:

- Used by 1 page → domain folder (`app/`, `inventory/`, `recipes/`)
- Used by 2+ pages → `shared/`
- Global wrapper/utility → root level

## Project Scripts

**Ingredient Extraction** (from `apps/nextjs/`):

- Script: `apps/nextjs/scripts/extract-ingredients.ts`
- Usage: `pnpm tsx scripts/extract-ingredients.ts <langCode>`
- Output: `research/<langCode>-ingredient-names.csv`
- Purpose: Extract ingredient names from taxonomy file

**Migration Generation** (from `apps/nextjs/`):

- Script: `apps/nextjs/scripts/generate-ingredient-migration.ts`
- Usage: `pnpm tsx scripts/generate-ingredient-migration.ts`
- Output: `src/db/migrations/NNNN_insert_ingredients.sql`
- Purpose: Generate SQL migration from CSV data

## Recent Changes
- 026-pwa-support: Added TypeScript 5+ (strict mode) + Next.js 16 App Router (built-in PWA metadata support via Metadata API)
- 025-onboarding-integration: Added TypeScript 5+ (strict mode) + React 19, Next.js 16 App Router, Drizzle ORM 0.45.1, @google/genai (Gemini 2.5-Flash-Lite), Zod, opik-gemini, OpenAI (Whisper)

- 024-story-onboarding: Added TypeScript 5+ (strict mode) + React 19, Next.js 16 App Router, Tailwind CSS v4, Drizzle ORM 0.45.1, @google/genai (Gemini), Zod
