# Implementation Plan: Route Restructuring and Admin Access

**Branch**: `006-admin-dashboard` | **Date**: 2026-01-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-admin-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Restructure Next.js application to serve pages under /app/* route (except landing page at /), create admin-only dashboard at /admin with role-based access control, update all internal navigation to new URLs, and display placeholder admin landing page.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16
**Primary Dependencies**: Next.js App Router, Supabase Auth (@supabase/ssr, @supabase/supabase-js), Drizzle ORM
**Storage**: Supabase PostgreSQL (user roles/permissions)
**Testing**: Vitest (configured)
**Target Platform**: Web (Next.js SSR/Client)
**Project Type**: Web application (Next.js App Router with route groups)
**Performance Goals**: <100ms route transition, <1s auth check, <2s page load
**Constraints**: Must preserve existing auth flow, update all internal navigation links
**Scale/Scope**: Single admin user initially, ~6 existing protected pages to migrate, 1 new admin route

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Critical Safeguards (MVP Phase)

- ✅ **No user data loss**: Route migration preserves all data; admin role stored in Supabase
- ✅ **No auth bypasses**: Admin access uses Supabase Auth + role check middleware
- ✅ **No SQL injection**: Drizzle ORM handles queries (parameterized)
- ✅ **No exposed secrets**: Admin user ID in environment variable
- ✅ **TypeScript compilation**: Must succeed (strict mode enabled)
- ✅ **App stability**: All existing pages must work on happy paths

### MVP Principles Compliance

- ✅ **MVP-First**: Feature complete (route migration + admin access) over perfect code
- ✅ **Pragmatic Types**: Strict at boundaries (auth checks, middleware), loose internally OK
- ✅ **Essential Validation**: Admin role validation REQUIRED; form validation deferred
- ✅ **Test-Ready**: Manual testing acceptable for MVP (vitest configured)
- ✅ **Type Derivation**: Derive types from Supabase/Drizzle schemas
- ✅ **Named Parameters**: Use object destructuring for route config, auth checks
- ⚠️ **Neobrutalism Design**: Admin placeholder page follows vibrant neobrutalism (pink/yellow/cyan, thick borders, bold shadows)

### Gate Status: ✅ PASSED (Initial) → ✅ PASSED (Post-Design)

**Initial Check**: All critical safeguards addressed. No constitution violations.

**Post-Design Re-check** (After Phase 1):
- ✅ **No user data loss**: Middleware preserves all requests, route migration tested
- ✅ **No auth bypasses**: Middleware enforces auth on /app/*, admin role on /admin/*
- ✅ **No SQL injection**: No database queries in middleware (env var check only)
- ✅ **No exposed secrets**: ADMIN_USER_IDS in .env.local, never sent to client
- ✅ **TypeScript compilation**: All contracts use proper types, middleware typed correctly
- ✅ **App stability**: Backward-compatible redirects, no breaking changes to existing pages
- ✅ **Named Parameters**: Middleware uses destructured params (`{ pathname }`)
- ✅ **Type Derivation**: No complex types to derive (using primitives and Next.js types)
- ✅ **Neobrutalism Design**: Admin and unauthorized pages follow Constitution Principle VII

**Final Status**: All constitution principles followed. Ready for implementation.

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
│   ├── app/
│   │   ├── (auth)/              # Existing: login pages
│   │   ├── (protected)/         # Existing: onboarding, inventory, recipes, suggestions
│   │   ├── (app)/               # NEW: Migrated protected pages under /app route
│   │   ├── (admin)/             # NEW: Admin-only pages under /admin route
│   │   ├── api/                 # Existing: API routes
│   │   ├── auth/                # Existing: OAuth callback
│   │   ├── page.tsx             # Existing: Landing page (stays at /)
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css
│   ├── components/              # Existing: RetroUI components
│   ├── db/                      # Drizzle schema/migrations
│   │   └── schema/              # User roles schema (NEW)
│   ├── lib/                     # Existing: Utilities
│   ├── utils/
│   │   └── supabase/            # Existing: Auth utilities
│   ├── types/                   # Type definitions
│   └── middleware.ts            # NEW: Admin auth + route redirects
└── tests/                       # Vitest test files (optional for MVP)
```

**Structure Decision**: Next.js App Router with route groups. Use `(app)` group for migrated protected pages, `(admin)` group for admin pages. Middleware handles auth checks and URL redirects. Existing `(protected)` group remains temporarily for migration safety.

## Implementation Phases

### Phase 1: Route Structure Setup
- Create `(app)` and `(admin)` route groups
- Create layout files for each group
- Copy/migrate pages from `(protected)` to `(app)`

### Phase 2: Middleware Implementation
- Create `middleware.ts` with auth checks and redirects
- Configure matcher for relevant routes
- Test admin access control

### Phase 3: Admin Pages
- Create admin dashboard placeholder
- Create unauthorized page
- Apply neobrutalism design

### Phase 4: Navigation Link Migration
**CRITICAL**: Update all internal navigation links to new /app/* URLs

**Files to Update**:
- `(protected)/suggestions/page.tsx`: `/inventory` → `/app/inventory`, `/recipes` → `/app/recipes`
- `(protected)/onboarding/page.tsx`: `router.push("/suggestions")` → `router.push("/app/suggestions")`
- `(auth)/login/page.tsx`: OAuth redirect `/onboarding` → `/app/onboarding`

**Search Pattern**:
```bash
grep -r "href=\"/inventory" apps/nextjs/src/
grep -r "href=\"/recipes" apps/nextjs/src/
grep -r "href=\"/suggestions" apps/nextjs/src/
grep -r "router.push.*suggestions" apps/nextjs/src/
grep -r "next=/onboarding" apps/nextjs/src/
```

**Why Important**:
- Avoid unnecessary 308 redirects (performance)
- Correct URLs in browser address bar
- Better user experience (no redirect flash)

### Phase 5: Verification & Cleanup
- Manual testing of all routes
- Remove old `(protected)` group (optional, can defer)
- TypeScript compilation check

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. All complexity justified by requirements:
- Route groups: Standard Next.js pattern for route organization
- Middleware: Required for centralized auth/redirect logic
- Environment variable admin: MVP-appropriate, simpler than database roles
