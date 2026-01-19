# Tasks: Drizzle ORM Integration with Supabase

**Input**: Design documents from `/specs/003-db-ops/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are included for validation but not marked as REQUIRED.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: Required markdown checkbox format
- **[ID]**: Task ID (T001, T002, etc.)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4, US5)
- **File paths**: Included in task descriptions

## Path Conventions

Project: Next.js monorepo (`apps/nextjs/`)
- Schema: `apps/nextjs/src/db/schema/`
- Client: `apps/nextjs/src/db/client.ts`
- Migrations: `apps/nextjs/drizzle/migrations/`
- Tests: `apps/nextjs/tests/db/`, `apps/nextjs/tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure Drizzle tooling

- [X] T001 Install Drizzle dependencies in apps/nextjs/package.json (drizzle-orm, postgres, drizzle-kit, vitest, @vitejs/plugin-react)
- [X] T002 [P] Create drizzle.config.ts in apps/nextjs/ with schema path, output to supabase/migrations/, PostgreSQL dialect
- [X] T003 [P] Create vitest.config.ts in apps/nextjs/ with node environment for database tests
- [X] T004 [P] Add DATABASE_URL and DATABASE_URL_DIRECT to apps/nextjs/.env.local (Transaction pooler + direct connection)
- [X] T005 [P] Create directory structure: apps/nextjs/src/db/schema/, apps/nextjs/drizzle/migrations/, apps/nextjs/tests/db/, apps/nextjs/tests/integration/
- [X] T006 [P] Add test scripts to apps/nextjs/package.json ("test": "vitest", "test:db": "vitest run tests/db")

**Checkpoint**: Drizzle tooling configured, directories created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema definitions and database client that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Create apps/nextjs/src/db/schema/enums.ts with ingredientCategoryEnum, ingredientTypeEnum, recipeSourceEnum
- [X] T008 [P] Create apps/nextjs/src/db/schema/ingredients.ts with ingredients table and ingredientAliases table definitions
- [X] T009 [P] Create apps/nextjs/src/db/schema/recipes.ts with recipes table and recipeIngredients table definitions
- [X] T010 [P] Create apps/nextjs/src/db/schema/user-inventory.ts with userInventory table definition
- [X] T011 [P] Create apps/nextjs/src/db/schema/user-recipes.ts with userRecipes table definition
- [X] T012 [P] Create apps/nextjs/src/db/schema/cooking-log.ts with cookingLog table definition
- [X] T013 [P] Create apps/nextjs/src/db/schema/unrecognized-items.ts with unrecognizedItems table definition
- [X] T014 Create apps/nextjs/src/db/schema/index.ts to re-export all schemas (enums, ingredients, recipes, user-inventory, user-recipes, cooking-log, unrecognized-items)
- [X] T015 Create apps/nextjs/src/db/client.ts with adminDb (singleton), createUserDb factory (JWT token passing), and type exports for all entities
- [X] T016 Verify schema compilation with TypeScript (run pnpm tsc --noEmit in apps/nextjs/)

**Checkpoint**: Foundation ready - schema definitions compile, database client created, user story implementation can begin

---

## Phase 3: User Story 1 - Define Database Schema with Drizzle (Priority: P1) 🎯 MVP

**Goal**: Deliver type-safe database schema definitions using Drizzle ORM

**Independent Test**: Create schema files → TypeScript compiles without errors → Generate migration → Verify SQL DDL matches expected schema

**Success Criteria**:
- FR-001: Schema defined using Drizzle TypeScript API ✅ (T007-T014)
- SC-001: TypeScript compilation catches query type errors
- SC-006: CRUD operations have full IntelliSense support

### Validation for User Story 1

- [X] T017 [US1] Create apps/nextjs/tests/db/schema.test.ts to test schema structure (verify tables exist, columns have correct types, enums have valid values)
- [X] T018 [US1] Run schema validation test with pnpm test:db and verify all tests pass

### Schema Relations for User Story 1

- [X] T019 [P] [US1] Add relations to apps/nextjs/src/db/schema/ingredients.ts (ingredientsRelations, ingredientAliasesRelations) for type-safe joins
- [X] T020 [P] [US1] Add relations to apps/nextjs/src/db/schema/recipes.ts (recipesRelations, recipeIngredientsRelations) for type-safe joins
- [X] T021 [P] [US1] Add relations to apps/nextjs/src/db/schema/user-inventory.ts (userInventoryRelations) for type-safe joins
- [X] T022 [P] [US1] Add relations to apps/nextjs/src/db/schema/user-recipes.ts (userRecipesRelations) for type-safe joins
- [X] T023 [P] [US1] Add relations to apps/nextjs/src/db/schema/cooking-log.ts (cookingLogRelations) for type-safe joins

**Checkpoint**: User Story 1 complete - schema definitions are type-safe, relations defined, validation tests pass

---

## Phase 4: User Story 2 - Execute Type-Safe Database Queries (Priority: P1)

**Goal**: Deliver type-safe query builder for CRUD operations

**Independent Test**: Write SELECT/INSERT/UPDATE/DELETE queries → TypeScript compilation catches invalid queries → Queries execute successfully against database

**Success Criteria**:
- FR-002: Type-safe query builders generated from schema ✅
- FR-008: Type-safe CRUD operations (create, read, update, delete)
- FR-009: Complex queries (joins, aggregations, subqueries) supported
- SC-004: Write queries without consulting database schema docs

### Query Implementation for User Story 2

- [X] T024 [P] [US2] Create apps/nextjs/tests/db/queries.test.ts with basic CRUD tests (insert, select, update, delete on userInventory)
- [X] T025 [US2] Implement example CRUD functions in apps/nextjs/src/db/client.ts (getIngredients, addInventoryItem, updateInventoryQuantity, deleteInventoryItem) using adminDb
- [X] T026 [US2] Test join queries in apps/nextjs/tests/db/queries.test.ts (userInventory with ingredients, recipes with recipeIngredients)
- [X] T027 [US2] Implement Tier 1 recipe query (all anchors present) in apps/nextjs/src/db/client.ts per data-model.md example
- [X] T028 [US2] Test aggregation queries in apps/nextjs/tests/db/queries.test.ts (count recipes, average inventory quantity)
- [X] T029 [US2] Verify TypeScript catches invalid queries (wrong column names, type mismatches) by attempting to compile intentionally broken queries

### Transaction Support for User Story 2

- [X] T030 [US2] Implement transaction example in apps/nextjs/src/db/client.ts (cooking flow: insert cookingLog + update userInventory in transaction)
- [X] T031 [US2] Test transaction rollback in apps/nextjs/tests/db/queries.test.ts (verify rollback on error)

**Checkpoint**: User Story 2 complete - type-safe queries work, CRUD operations validated, complex queries (joins, aggregations, transactions) functional

---

## Phase 5: User Story 3 - Manage Database Migrations (Priority: P1)

**Goal**: Deliver migration generation and application workflow using Drizzle Kit

**Independent Test**: Modify schema → Generate migration → Review SQL → Apply migration → Verify database schema updated

**Success Criteria**:
- FR-005: Migrations generated from schema changes
- FR-006: Migrations apply to local and production databases
- SC-002: Schema changes generate correct migrations 100% of time
- SC-007: Migration generation completes in <5s

### Migration Workflow for User Story 3

- [X] T032 [US3] Generate initial migration from Drizzle schema with pnpm drizzle-kit generate in apps/nextjs/ (outputs to supabase/migrations/)
- [X] T033 [US3] Review generated migration SQL in apps/nextjs/supabase/migrations/ directory to verify correct DDL (enums, tables, indexes, constraints)
- [X] T034 [US3] Apply migration to local database with supabase db push from apps/nextjs/
- [X] T035 [US3] Verify migration applied successfully with supabase db status from apps/nextjs/
- [X] T036 [US3] Test schema introspection with pnpm drizzle-kit introspect in apps/nextjs/ (verify generates matching TypeScript schema from existing database)
- [X] T037 [US3] Document migration workflow in apps/nextjs/README.md (generate → review → apply steps, local vs production commands)

### Migration Validation for User Story 3

- [X] T038 [US3] Test migration generation performance (measure time for drizzle-kit generate, ensure <5s per SC-007)
- [X] T039 [US3] Verify idempotency: apply migration twice, ensure no errors on second application

**Checkpoint**: User Story 3 complete - migration workflow functional, schema changes tracked in version control, local database synced

---

## Phase 6: User Story 4 - Integrate with Supabase Auth (Priority: P2)

**Goal**: Deliver auth-aware database client that respects Supabase RLS policies

**Independent Test**: Authenticate user → Execute query with user client → Verify RLS filters data correctly (user sees only their own data)

**Success Criteria**:
- FR-010: Supabase Auth integration for user context in queries
- SC-008: Drizzle queries work seamlessly with Supabase RLS policies

### RLS Integration for User Story 4

- [X] T040 [US4] Enhance createUserDb factory in apps/nextjs/src/db/client.ts to set PostgreSQL session variables (request.jwt.claims, role) via onconnect callback
- [X] T041 [US4] Create apps/nextjs/tests/integration/auth-flow.test.ts to test RLS enforcement (user1 cannot see user2's inventory)
- [X] T042 [US4] Test authenticated query in apps/nextjs/tests/integration/auth-flow.test.ts (verify userInventory filtered by auth.uid())
- [X] T043 [US4] Test recipes RLS policy in apps/nextjs/tests/integration/auth-flow.test.ts (user sees seeded recipes + own custom recipes)
- [X] T044 [US4] Document RLS patterns in apps/nextjs/src/db/client.ts (comments explaining dual client pattern, when to use admin vs user client)

### Error Handling for User Story 4

- [X] T045 [US4] Add error handling for invalid session tokens in apps/nextjs/src/db/client.ts (throw clear error if accessToken missing/invalid)
- [X] T046 [US4] Test error scenarios in apps/nextjs/tests/integration/auth-flow.test.ts (expired token, missing session, unauthorized access)

**Checkpoint**: User Story 4 complete - RLS policies enforced via Drizzle, auth context flows from Supabase session, error handling robust

---

## Phase 7: User Story 5 - Use Drizzle in Next.js Server Components (Priority: P2)

**Goal**: Deliver working examples of Drizzle queries in Next.js App Router (Server Components, Server Actions, API Routes)

**Independent Test**: Create Server Component with Drizzle query → Navigate to page → Verify data renders → Check auth enforcement

**Success Criteria**:
- FR-011: Drizzle works in Next.js server components with async handling
- FR-012: Drizzle works in Next.js API routes with error handling
- SC-003: Query overhead <5% vs raw SQL

### Server Component Integration for User Story 5

- [ ] T047 [P] [US5] Create example Server Component in apps/nextjs/src/app/(protected)/inventory/page.tsx using createUserDb with Supabase session
- [ ] T048 [P] [US5] Create example Server Action in apps/nextjs/src/app/actions/inventory.ts for updateInventoryQuantity using createUserDb
- [ ] T049 [P] [US5] Create example API Route in apps/nextjs/src/app/api/inventory/route.ts using createUserDb with proper error handling
- [ ] T050 [US5] Test Server Component integration: navigate to /inventory page, verify data renders, check session validation redirects
- [ ] T051 [US5] Test Server Action integration: call updateInventoryQuantity from client component, verify database update, check revalidatePath works
- [ ] T052 [US5] Test API Route integration: make fetch request to /api/inventory, verify JSON response, check 401 for unauthorized

### Performance Validation for User Story 5

- [ ] T053 [US5] Measure query performance in apps/nextjs/tests/db/queries.test.ts (compare Drizzle vs raw SQL, verify overhead <5% per SC-003)
- [ ] T054 [US5] Test connection pooling with concurrent requests (verify Transaction pooler handles multiple simultaneous queries without exhaustion)

**Checkpoint**: User Story 5 complete - Drizzle integrated in Server Components, Server Actions, API Routes, performance validated, connection pooling working

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and final validation

- [ ] T055 [P] Update apps/nextjs/README.md with Drizzle setup instructions (reference quickstart.md)
- [ ] T056 [P] Add TypeScript type exports to apps/nextjs/src/db/client.ts for all entities (Ingredient, Recipe, UserInventory, etc.)
- [ ] T057 [P] Run full test suite with pnpm test in apps/nextjs/ and verify all tests pass
- [ ] T058 [P] Validate against quickstart.md checklist (confirm all setup steps completed)
- [ ] T059 [P] Run TypeScript compilation check with pnpm tsc --noEmit in apps/nextjs/ (verify no type errors)
- [ ] T060 [P] Run linting with pnpm lint in apps/nextjs/ and fix any issues
- [ ] T061 Document common query patterns in apps/nextjs/src/db/README.md (basic CRUD, joins, transactions, RLS usage)
- [ ] T062 Add connection string validation in apps/nextjs/src/db/client.ts (throw clear error if DATABASE_URL missing)
- [ ] T063 Verify Supabase Auth flow unchanged (test existing auth callback routes in apps/nextjs/src/app/auth/)

**Checkpoint**: All user stories complete and validated, documentation up to date, system ready for production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3 (US1 - Schema)**: Depends on Phase 2 - Can run independently
- **Phase 4 (US2 - Queries)**: Depends on Phase 3 (needs schema) - Can run after US1 complete
- **Phase 5 (US3 - Migrations)**: Depends on Phase 3 (needs schema) - Can run in parallel with US2
- **Phase 6 (US4 - Auth)**: Depends on Phase 2 + Phase 4 (needs client and queries) - Can run after US2 complete
- **Phase 7 (US5 - Next.js)**: Depends on Phase 4 + Phase 6 (needs queries and auth) - Final integration
- **Phase 8 (Polish)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 2 (Foundational - REQUIRED)
├── Phase 3 (US1: Schema) ─────┐
│   ├── Phase 4 (US2: Queries) ├─► Phase 6 (US4: Auth)
│   └── Phase 5 (US3: Migrations)               ├─► Phase 7 (US5: Next.js) ─► Phase 8 (Polish)
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 6 (US4) → Phase 7 (US5) → Phase 8

**Parallel Opportunities**:
- Phase 1: All tasks (T001-T006) can run in parallel
- Phase 2: All schema files (T007-T013) can run in parallel
- Phase 3 (US1): All relation additions (T019-T023) can run in parallel
- Phase 5 (US3): Can start after Phase 3, run in parallel with Phase 4
- Phase 7 (US5): Server Component, Server Action, API Route examples (T047-T049) can run in parallel
- Phase 8: Most documentation and validation tasks can run in parallel

### Within Each User Story

**US1 (Schema)**:
1. Schema files (parallel) → index.ts re-export → validation test → relations (parallel)

**US2 (Queries)**:
1. Basic CRUD test + functions → join queries → aggregations → transactions

**US3 (Migrations)**:
1. Generate → review → apply → verify → document → test performance

**US4 (Auth)**:
1. Enhance client factory → RLS tests → error handling

**US5 (Next.js)**:
1. Examples (parallel) → integration tests → performance validation

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all schema file creation tasks together:
Task T007: "Create enums.ts"
Task T008: "Create ingredients.ts"
Task T009: "Create recipes.ts"
Task T010: "Create user-inventory.ts"
Task T011: "Create user-recipes.ts"
Task T012: "Create cooking-log.ts"
Task T013: "Create unrecognized-items.ts"

# Then sequentially:
Task T014: "Create index.ts to re-export" (depends on T007-T013)
Task T015: "Create client.ts" (depends on T014)
Task T016: "Verify compilation" (depends on T015)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

**Recommended MVP Scope**: US1 (Schema) + US2 (Queries) + US3 (Migrations)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T016) - CRITICAL BLOCKER
3. Complete Phase 3: US1 - Schema (T017-T023)
4. Complete Phase 4: US2 - Queries (T024-T031)
5. Complete Phase 5: US3 - Migrations (T032-T039)
6. **STOP and VALIDATE**:
   - Run all tests (pnpm test)
   - Generate migration and apply locally
   - Verify type-safe queries work
7. Deploy/demo if ready

**Why this MVP**: Delivers core ORM functionality (schema, queries, migrations) without Next.js integration complexity

### Incremental Delivery

1. **Foundation** (Phase 1+2) → Schema definitions compile, client created
2. **MVP** (US1+US2+US3) → Type-safe queries + migrations working → Deploy
3. **Auth Integration** (US4) → RLS policies enforced → Deploy
4. **Next.js Integration** (US5) → Server Components working → Deploy
5. **Polish** (Phase 8) → Documentation complete, tests passing → Production ready

### Parallel Team Strategy

With 2 developers:

1. **Both**: Complete Phase 1+2 together (setup + foundation)
2. **After Phase 2 complete**:
   - Developer A: US1 (Schema) → US2 (Queries)
   - Developer B: US3 (Migrations) in parallel with US2
3. **After US2 complete**:
   - Developer A: US4 (Auth)
   - Developer B: Continue US3 or help with US4
4. **After US4 complete**:
   - Either developer: US5 (Next.js integration)
5. **Both**: Phase 8 (Polish) together

---

## Task Statistics

**Total Tasks**: 63
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 10 tasks (BLOCKING)
- Phase 3 (US1 - Schema): 7 tasks
- Phase 4 (US2 - Queries): 8 tasks
- Phase 5 (US3 - Migrations): 8 tasks
- Phase 6 (US4 - Auth): 7 tasks
- Phase 7 (US5 - Next.js): 8 tasks
- Phase 8 (Polish): 9 tasks

**Parallel Opportunities**: 28 tasks marked [P] (44% can run in parallel)

**MVP Tasks** (US1+US2+US3): 16 + 10 foundational + 6 setup = 32 tasks total for MVP

---

## Notes

- ✅ All tasks follow required checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] marker indicates parallelizable tasks (different files, no dependencies)
- [Story] label maps task to user story for traceability (US1, US2, US3, US4, US5)
- Each user story independently testable and deliverable
- Tests included for validation but not marked as REQUIRED (not explicitly requested in spec)
- Stop at any checkpoint to validate story independently before proceeding
- Commit after each task or logical group of tasks
- Avoid cross-story dependencies that break independence
