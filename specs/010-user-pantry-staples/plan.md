# Implementation Plan: Schema Cleanup & User Pantry Staples Table

**Branch**: `010-user-pantry-staples` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Remove ingredient aliases table, add userPantryStaples table for future use

## Summary

Remove `ingredientAliases` table and add `userPantryStaples` table (for future use). No UI changes in this feature.

**Note**: userPantryStaples table created but UI for marking/viewing staples not implemented (deferred to future feature).

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: Drizzle ORM 0.45.1
**Storage**: Supabase PostgreSQL via Drizzle
**Testing**: Manual (MVP phase per constitution)
**Target Platform**: Web (Next.js App Router)
**Project Type**: Monorepo (apps/nextjs/)

## Project Structure

### Documentation (this feature)

```text
specs/010-user-pantry-staples/
├── spec.md              # Feature specification
├── plan.md              # This file
├── data-model.md        # Database schema details
├── quickstart.md        # Quick implementation guide
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   └── db/
│       ├── schema/
│       │   ├── ingredients.ts          # MODIFY: remove ingredientAliases
│       │   ├── user-pantry-staples.ts  # NEW: userPantryStaples table
│       │   └── index.ts                # MODIFY: export new table
│       └── migrations/                 # NEW: migration for schema changes
```

---

## Phase 0: Research

### Findings

- Drizzle migration handles DROP TABLE + CREATE TABLE in single migration
- CASCADE DELETE on foreign keys for data integrity

---

## Phase 1: Database Changes

1. **Remove** `ingredientAliases` table and relations from `ingredients.ts`
2. **Add** `userPantryStaples` table (schema in data-model.md)
3. **Export** new table from `index.ts`
4. **Generate** and apply migration

See [data-model.md](./data-model.md) for schema details.
