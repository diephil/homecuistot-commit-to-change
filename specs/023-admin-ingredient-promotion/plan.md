# Implementation Plan: Admin Unrecognized Ingredient Promotion

**Branch**: `023-admin-ingredient-promotion` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-admin-ingredient-promotion/spec.md`

## Summary

Admin page to review unrecognized ingredients captured during recipe operations (via Opik LLM tracing) and promote them into the `ingredients` database table with a proper category. Replaces the existing `/admin` placeholder with a welcome page, adds header navigation, and implements a dedicated `/admin/unrecognized` page for the promotion workflow. Backend contacts Opik REST API with proper secrets and returns data to frontend.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16 App Router, Drizzle ORM 0.45.1, Opik REST API (external)
**Storage**: Supabase PostgreSQL (existing `ingredients` table — no schema changes)
**Testing**: Manual testing (MVP phase per constitution)
**Target Platform**: Web (browser), Vercel deployment
**Project Type**: Web application (Next.js monorepo)
**Performance Goals**: Span review < 60s per span, 20+ spans per session
**Constraints**: Opik API rate limit 2000 req/min; admin-only access via ADMIN_USER_IDS env var
**Scale/Scope**: Single admin user, ~100s of unprocessed spans, 5931 existing ingredients

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ Pass | No over-engineering; manual CTA-triggered flow |
| II. Pragmatic Type Safety | ✅ Pass | Types at API boundaries; Zod for request validation |
| III. Essential Validation Only | ✅ Pass | Validate API inputs + ingredient inserts; skip internal |
| IV. Test-Ready Infrastructure | ✅ Pass | Manual testing for MVP; test infra exists |
| V. Type Derivation | ✅ Pass | Use schema-derived types for ingredients |
| VI. Named Parameters | ✅ Pass | All service functions use named params |
| VII. Vibrant Neobrutalism | ✅ Pass | Follow existing admin layout styling |
| Non-Negotiable Safeguards | ✅ Pass | No data loss risk (insert only); admin auth enforced; no SQL injection (Drizzle ORM); secrets in env vars |

**Post-Phase 1 Re-check**: ✅ All gates pass. No schema changes, no new dependencies beyond `fetch()` for Opik REST API.

## Project Structure

### Documentation (this feature)

```text
specs/023-admin-ingredient-promotion/
├── plan.md              # This file
├── research.md          # Phase 0: Opik API research, DB patterns, auth
├── data-model.md        # Phase 1: Entity model, data flows, state transitions
├── quickstart.md        # Phase 1: Developer implementation guide
├── contracts/
│   ├── admin-api.md     # Phase 1: Internal API contracts (3 endpoints)
│   └── opik-api.md      # Phase 1: External Opik REST API contracts
└── tasks.md             # Phase 2: Implementation tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── app/
│   ├── (admin)/admin/
│   │   ├── layout.tsx              # MODIFY: add nav links + Go To App CTA
│   │   ├── page.tsx                # MODIFY: replace placeholder with welcome page
│   │   └── unrecognized/
│   │       └── page.tsx            # NEW: unrecognized items review page
│   └── api/admin/
│       ├── spans/
│       │   ├── next/route.ts       # NEW: GET — fetch next unprocessed span
│       │   └── mark-reviewed/route.ts  # NEW: POST — tag span as reviewed
│       └── ingredients/
│           └── promote/route.ts    # NEW: POST — promote ingredients + tag span
├── lib/
│   └── services/
│       └── opik-spans.ts           # NEW: Opik REST API service (search, get by ID, mark reviewed)
└── db/
    └── client.ts                   # READ ONLY: use adminDb for ingredient inserts
```

**Structure Decision**: Next.js App Router convention. New files placed in existing directory patterns: API routes under `app/api/admin/`, service under `lib/services/`, pages under `app/(admin)/admin/`. No new top-level directories.

## Complexity Tracking

No constitution violations. All gates pass.
