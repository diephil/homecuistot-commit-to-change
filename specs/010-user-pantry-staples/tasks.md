# Tasks: Schema Cleanup & User Pantry Staples Table

**Input**: Design documents from `/specs/010-user-pantry-staples/`
**Prerequisites**: plan.md, spec.md, data-model.md

**Tests**: Manual testing per constitution (no automated tests)

## Path Conventions

- **Monorepo**: `apps/nextjs/src/` for all source code
- **Schema**: `apps/nextjs/src/db/schema/`

---

## Phase 1: Setup

**Purpose**: Project structure verification

- [x] T001 Verify branch `010-user-pantry-staples` is active and clean
- [x] T002 Verify Supabase local running (`make sbstart`) and `.env.local` configured

---

## Phase 2: Database Schema Changes

**Purpose**: Remove ingredientAliases, add userPantryStaples

- [x] T003 Remove `ingredientAliases` table from `apps/nextjs/src/db/schema/ingredients.ts`
- [x] T004 Remove `ingredientAliasesRelations` from `apps/nextjs/src/db/schema/ingredients.ts`
- [x] T005 Remove `aliases` relation from `ingredientsRelations` in `apps/nextjs/src/db/schema/ingredients.ts`
- [x] T006 Create `apps/nextjs/src/db/schema/user-pantry-staples.ts` with userPantryStaples table per data-model.md
- [x] T007 Export `userPantryStaples` and relations from `apps/nextjs/src/db/schema/index.ts`
- [x] T008 Run `pnpm db:generate` from `apps/nextjs/` to generate migration
- [x] T009 Run `pnpm db:migrate` to apply migration to local DB
- [x] T010 Verify migration: `ingredient_aliases` dropped, `user_pantry_staples` created

**Checkpoint**: Database schema updated

---

## Phase 3: Verification & Cleanup

**Purpose**: Ensure no lingering references

- [x] T011 Run `pnpm lint` and fix any issues
- [x] T012 Run `pnpm build` to verify TypeScript compilation
- [x] T013 Search codebase for remaining `ingredientAliases` references and remove
- [ ] T014 Run `pnpm db:migrate:prod` to apply migration to production

---

## Notes

- No automated tests per constitution (manual testing)
- userPantryStaples table created for future use (UI not implemented)
