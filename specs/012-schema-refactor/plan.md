# Implementation Plan: Database Schema Refactoring

**Branch**: `012-schema-refactor` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-schema-refactor/spec.md`

## Summary

Consolidate pantry staple tracking into user_inventory table via isPantryStaple boolean, rename recipes→user_recipes, rename user_recipes junction→user_saved_recipes, remove isSeeded column. Migration preserves all data while simplifying schema.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: Drizzle ORM 0.45.1, postgres 3.4.8, Next.js 16
**Storage**: Supabase PostgreSQL via Drizzle
**Testing**: Manual validation for MVP (test infrastructure exists)
**Target Platform**: Web server (Next.js App Router)
**Project Type**: Web (Next.js monorepo)
**Performance Goals**: Migration completes <30s, zero data loss
**Constraints**: Zero downtime deployment, backward compatibility during migration
**Scale/Scope**: User tables with existing data (production DB)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ MVP-First Development
- **Status**: PASS
- **Rationale**: Schema changes are foundational, feature completeness prioritized over perfect migration

### ✅ Pragmatic Type Safety
- **Status**: PASS
- **Rationale**: Drizzle provides type derivation from schema, strict TypeScript enabled

### ✅ Essential Validation Only
- **Status**: PASS
- **Rationale**: Migration validates data preservation (critical), runtime validation minimal

### ✅ Test-Ready Infrastructure
- **Status**: PASS
- **Rationale**: Test infrastructure exists, manual testing acceptable for schema migration

### ✅ Type Derivation Over Duplication
- **Status**: PASS
- **Rationale**: Drizzle schema = single source of truth, types auto-derived

### ✅ Named Parameters for Clarity
- **Status**: N/A
- **Rationale**: Schema definitions, not function signatures

### ✅ Vibrant Neobrutalism Design System
- **Status**: N/A
- **Rationale**: Backend schema change, no UI impact

### Non-Negotiable Safeguards
- ✅ No user data loss → Migration preserves all rows via data migration logic
- ✅ No auth bypasses → No auth changes
- ✅ No SQL injection → Drizzle parameterized queries
- ✅ No exposed secrets → No secret changes
- ✅ TypeScript compilation MUST succeed → Schema changes type-checked
- ✅ App MUST run without crashes → Schema changes tested locally before prod

**Overall Assessment**: PASS - All applicable gates satisfied

## Project Structure

### Documentation (this feature)

```text
specs/012-schema-refactor/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (migration strategy, rollback plan)
├── data-model.md        # Phase 1 output (updated schema diagrams)
├── quickstart.md        # Phase 1 output (migration commands)
├── contracts/           # Phase 1 output (schema contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── user-inventory.ts        # Add isPantryStaple boolean
│   │   │   ├── user-pantry-staples.ts   # DELETE after migration
│   │   │   ├── recipes.ts               # Rename to user-recipes.ts, remove isSeeded, check constraint
│   │   │   ├── user-recipes.ts          # Rename to user-saved-recipes.ts
│   │   │   └── index.ts                 # Update exports
│   │   ├── migrations/
│   │   │   └── NNNN_schema_refactor.sql # Generated migration
│   │   └── client.ts
│   └── app/
│       └── api/                         # Update queries for renamed tables
└── scripts/
    └── validate-migration.ts            # Row count validation script
```

**Structure Decision**: Web application with Next.js backend. Schema changes in `apps/nextjs/src/db/schema/`, migration generated via `pnpm db:generate`, applied via `pnpm db:migrate` (local) and `pnpm db:migrate:prod` (production).

## Complexity Tracking

> **No violations - this section intentionally empty**

---

## Phase 0: Research & Unknowns

**Status**: NEEDS EXECUTION

### Research Tasks

1. **Migration Strategy for user_pantry_staples → user_inventory.isPantryStaple**
   - Decision needed: How to handle pantry staples without inventory entries?
   - Options: (A) Create inventory entries with default quantityLevel, (B) Skip orphaned staples
   - Research: Check if orphaned staples exist in production

2. **Table Rename Conflict Resolution**
   - Decision needed: New name for `user_recipes` junction table
   - Options: (A) user_saved_recipes, (B) user_recipe_bookmarks, (C) user_favorite_recipes
   - Research: Existing naming conventions in codebase

3. **Rollback Strategy**
   - Decision needed: How to rollback if migration fails?
   - Research: Drizzle migration rollback capabilities, manual rollback SQL needed?

4. **Foreign Key Cascade Behavior**
   - Decision needed: Impact of renaming recipes table on existing FKs
   - Research: Drizzle handling of FK updates during table rename

### Output Location
`specs/012-schema-refactor/research.md`

---

## Phase 1: Design & Contracts

**Status**: PENDING (blocked by Phase 0)

### Data Model Updates

**Output**: `specs/012-schema-refactor/data-model.md`

1. **user_inventory schema changes**
   - Add: `isPantryStaple boolean NOT NULL DEFAULT false`
   - Indexes: Consider index on (userId, isPantryStaple) for pantry queries

2. **user_recipes (formerly recipes) schema changes**
   - Remove: `isSeeded` column
   - Remove: `recipe_ownership` check constraint
   - Update: `userId` column → NOT NULL (all recipes user-owned)

3. **user_saved_recipes (formerly user_recipes) schema changes**
   - Table rename only, schema unchanged

4. **recipe_ingredients schema changes**
   - Update foreign key reference: recipes.id → user_recipes.id

### API Contracts

**Output**: `specs/012-schema-refactor/contracts/`

1. **Schema Contract** (`schema.contract.json`)
   - Before/after table structures
   - Column type changes
   - Index changes
   - Foreign key updates

2. **Migration Contract** (`migration.contract.sql`)
   - Data preservation guarantees
   - Row count validations
   - Constraint validations

### Quickstart Guide

**Output**: `specs/012-schema-refactor/quickstart.md`

```bash
# Local development
cd apps/nextjs
pnpm db:generate          # Generate migration
pnpm db:migrate           # Apply to local DB
pnpm db:status            # Verify migration applied

# Production deployment
pnpm db:migrate:prod      # Apply to production
pnpm db:status:prod       # Verify production status
```

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` to update CLAUDE.md with:
- Migration commands added to workflow section
- Schema changes documented in Active Technologies

---

## Unresolved Questions

1. Orphaned pantry staples (no inventory entry) - create default entry or skip?
2. Junction table rename - `user_saved_recipes` or alternative?
3. Rollback strategy - Drizzle support or manual SQL?
4. Production data volume - migration duration estimate needed?
5. Downtime acceptable or need zero-downtime approach?
