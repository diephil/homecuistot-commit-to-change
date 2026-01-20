# Implementation Plan: Drizzle ORM Integration with Supabase

**Branch**: `003-db-ops` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-db-ops/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate Drizzle ORM with existing Supabase PostgreSQL database to provide type-safe database operations in Next.js 16 application. Maintains Supabase Auth integration while adding TypeScript-first query builder and schema management via Drizzle Kit migrations.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode), Node.js 18+
**Primary Dependencies**: drizzle-orm, drizzle-kit, @neondatabase/serverless (or postgres driver), @supabase/supabase-js, @supabase/ssr
**Storage**: Supabase PostgreSQL (existing), Drizzle schema in src/db/schema/, migrations in drizzle/migrations/
**Testing**: Vitest (Node environment for DB tests, official Next.js 16 support)
**Target Platform**: Next.js 16 (App Router), React Server Components, API Routes
**Project Type**: web (monorepo: apps/nextjs/)
**Performance Goals**: Query overhead <5% vs raw SQL, migration generation <5s, schema introspection <10s
**Constraints**: Must coexist with Supabase Auth, RLS policies, existing connection pooling. No breaking changes to current Supabase integration
**Scale/Scope**: Single Next.js app, ~10-20 database tables initially (meal planning domain), expected growth to 50+ tables

**Key Integration Points** (resolved in research.md):
- Supabase Auth context: Dual client pattern with JWT token passing via session variables
- Connection pooling strategy: Supabase Transaction pooler + postgres-js + `prepare: false`
- Migration coordination: Drizzle Kit generate → `supabase/migrations/` → manual apply via Supabase CLI
- Environment configuration: local Supabase (Docker) + production Supabase project

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template-only constitution found (no project-specific principles defined)

**Assumed Standard Gates** (based on software engineering best practices):
- ✅ **Library-First**: Drizzle is established npm library (drizzle-orm), not custom implementation
- ✅ **Test Coverage**: Vitest setup defined in quickstart.md, schema + RLS tests documented
- ✅ **Integration Testing**: Database integration tests for RLS policies in tests/integration/
- ✅ **Simplicity**: Single ORM layer coexisting with Supabase (not replacing), minimal abstractions
- ✅ **Breaking Changes**: Mitigation complete - dual client pattern preserves Supabase Auth flow

**Phase 1 Re-evaluation (PASSED)**: All gates satisfied, design maintains architectural simplicity

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── db/
│   │   ├── schema/           # Drizzle schema definitions (*.ts)
│   │   │   └── index.ts      # Re-export all schemas
│   │   ├── client.ts         # Drizzle client singleton
│   │   └── migrate.ts        # Migration runner (if needed)
│   ├── app/
│   │   ├── (protected)/      # Auth-required routes using Drizzle
│   │   └── api/              # API routes with Drizzle queries
│   └── utils/
│       └── supabase/         # Existing: client.ts, server.ts (keep)
├── drizzle/
│   ├── migrations/           # Generated migration SQL files
│   └── meta/                 # Drizzle Kit metadata
├── drizzle.config.ts         # Drizzle Kit configuration
├── tests/                    # Integration tests for Drizzle
│   ├── db/
│   │   ├── schema.test.ts
│   │   └── queries.test.ts
│   └── integration/
│       └── auth-flow.test.ts
└── package.json              # Add drizzle-orm, drizzle-kit deps
```

**Structure Decision**: Web application (Next.js monorepo). Drizzle schema/client in `src/db/`, migrations in `drizzle/` at app root. Coexists with existing `src/utils/supabase/` setup - Supabase for auth/realtime, Drizzle for type-safe queries.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
