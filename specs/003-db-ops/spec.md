# Feature Specification: Drizzle ORM Integration with Supabase

**Feature Branch**: `003-db-ops`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "I'm using supabase, and i want to use drizzle Typescript orm. let's integrate that in my nextjs app"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Define Database Schema with Drizzle (Priority: P1)

A developer needs to define database schema using TypeScript instead of raw SQL. They create Drizzle schema files that define tables, columns, constraints, and relationships using type-safe TypeScript code.

**Why this priority**: Foundation for using Drizzle ORM. Without schema definitions, queries cannot be type-safe.

**Independent Test**: Can be fully tested by creating schema files and verifying they generate correct SQL DDL statements. Delivers type-safe schema definitions.

**Acceptance Scenarios**:

1. **Given** a database table requirement, **When** developer creates Drizzle schema, **Then** schema generates correct PostgreSQL DDL with proper types
2. **Given** existing Supabase tables, **When** developer introspects database, **Then** Drizzle generates matching TypeScript schema
3. **Given** schema with relationships, **When** developer defines foreign keys, **Then** TypeScript types enforce referential integrity

---

### User Story 2 - Execute Type-Safe Database Queries (Priority: P1)

A developer needs to query the database with full TypeScript type safety. They use Drizzle query builder to construct and execute queries that are validated at compile time.

**Why this priority**: Core value of ORM - type-safe queries prevent runtime errors and improve developer experience.

**Independent Test**: Can be fully tested by writing queries against schema and verifying TypeScript compilation catches invalid queries. Delivers type-safe database operations.

**Acceptance Scenarios**:

1. **Given** defined schema, **When** developer writes SELECT query, **Then** result types match schema definitions exactly
2. **Given** invalid query (wrong column), **When** developer compiles code, **Then** TypeScript error prevents compilation
3. **Given** complex join query, **When** developer uses query builder, **Then** result types include all selected fields from joined tables

---

### User Story 3 - Manage Database Migrations (Priority: P1)

A developer needs to evolve database schema over time. They generate and apply migrations from Drizzle schema changes using Drizzle Kit.

**Why this priority**: Required for schema evolution in development and production. Without migrations, schema changes cannot be applied safely.

**Independent Test**: Can be fully tested by modifying schema, generating migration, and verifying correct SQL is produced. Delivers schema version control.

**Acceptance Scenarios**:

1. **Given** schema change, **When** developer runs drizzle-kit generate, **Then** migration SQL file is created with correct DDL
2. **Given** pending migration, **When** developer runs drizzle-kit push, **Then** changes are applied to database
3. **Given** migration with data transformation needs, **When** developer reviews generated SQL, **Then** they can edit migration before applying

---

### User Story 4 - Integrate with Supabase Auth (Priority: P2)

A developer needs to access authenticated user context in queries. They use Supabase client for auth and Drizzle for queries, maintaining user context across both systems.

**Why this priority**: Required for row-level security and user-scoped queries but depends on basic ORM setup first.

**Independent Test**: Can be fully tested by authenticating user, executing query with user context, and verifying correct data filtering. Delivers auth-aware queries.

**Acceptance Scenarios**:

1. **Given** authenticated user, **When** developer executes query, **Then** query has access to user ID from Supabase session
2. **Given** RLS policy on table, **When** developer queries table, **Then** only authorized rows are returned
3. **Given** server component, **When** developer uses Drizzle, **Then** queries respect Supabase auth context

---

### User Story 5 - Use Drizzle in Next.js Server Components (Priority: P2)

A developer needs to fetch data in React Server Components using Drizzle. They execute queries directly in components with proper connection pooling and error handling.

**Why this priority**: Essential for Next.js 16 app router but not needed for API routes alone.

**Independent Test**: Can be fully tested by creating server component with Drizzle query and verifying data renders correctly. Delivers server-side data fetching.

**Acceptance Scenarios**:

1. **Given** server component, **When** developer uses Drizzle query, **Then** data is fetched at request time with proper caching
2. **Given** multiple parallel queries, **When** component renders, **Then** queries use connection pooling efficiently
3. **Given** query error, **When** component renders, **Then** error boundary catches and displays appropriate message

---

### Edge Cases

- What happens when Drizzle schema diverges from actual database schema?
- How does system handle connection pooling limits with many concurrent queries?
- What happens when migration conflicts with Supabase-managed tables (auth.users)?
- How does Drizzle handle Supabase's PostgreSQL extensions (uuid-ossp, pg_trgm)?
- What happens when query exceeds Supabase connection timeout?
- How does system prevent SQL injection despite using ORM?
- What happens when running drizzle-kit push against production accidentally?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define database schema using Drizzle ORM TypeScript API
- **FR-002**: System MUST generate type-safe query builders from schema definitions
- **FR-003**: System MUST connect to Supabase PostgreSQL using Drizzle client
- **FR-004**: System MUST support both direct database connections and Supabase connection pooling
- **FR-005**: System MUST generate SQL migrations from schema changes using Drizzle Kit
- **FR-006**: System MUST apply migrations to local and production databases
- **FR-007**: System MUST support schema introspection from existing Supabase databases
- **FR-008**: System MUST provide type-safe CRUD operations (create, read, update, delete)
- **FR-009**: System MUST support complex queries including joins, aggregations, and subqueries
- **FR-010**: System MUST integrate with Supabase Auth for user context in queries
- **FR-011**: System MUST work in Next.js server components with proper async handling
- **FR-012**: System MUST work in Next.js API routes with proper error handling
- **FR-013**: System MUST handle database errors gracefully with typed error objects
- **FR-014**: System MUST support transaction handling for atomic operations
- **FR-015**: System MUST validate schema changes before generating migrations

### Key Entities

- **Schema Definition**: TypeScript file defining tables, columns, types using Drizzle schema builder. Located in `src/db/schema/` directory.
- **Database Client**: Configured Drizzle instance connected to Supabase PostgreSQL. Singleton pattern for connection reuse.
- **Migration File**: SQL file generated by Drizzle Kit containing schema changes. Stored in `drizzle/migrations/` directory.
- **Query Builder**: Type-safe query interface generated from schema. Used in application code for database operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: TypeScript compilation catches 100% of query type errors (wrong columns, wrong types)
- **SC-002**: Schema changes generate correct migrations 100% of the time
- **SC-003**: Query execution time remains comparable to raw SQL (within 5% overhead)
- **SC-004**: Developer can write type-safe query without consulting database schema documentation
- **SC-005**: Schema introspection from existing Supabase database completes in under 10 seconds
- **SC-006**: All CRUD operations have full TypeScript IntelliSense support
- **SC-007**: Migration generation from schema changes completes in under 5 seconds
- **SC-008**: Drizzle queries work seamlessly with Supabase RLS policies

## Assumptions

1. **Supabase Setup**: Existing Supabase project with PostgreSQL database accessible
2. **Next.js Version**: Using Next.js 16+ with App Router
3. **TypeScript**: Project uses TypeScript 5+ with strict mode enabled
4. **Node Version**: Node.js 18+ for native ESM support
5. **Database Access**: Direct PostgreSQL connection string available (not just Supabase client)
6. **Migration Strategy**: Drizzle migrations supplement (not replace) existing Supabase migrations
7. **Connection Pooling**: Using Supabase connection pooler for production queries
8. **Auth Integration**: Existing Supabase Auth implementation present
9. **Development Workflow**: Developers work with local Supabase instance
10. **Performance**: Database queries performance-sensitive, ORM overhead matters

## Dependencies

1. Drizzle ORM (`drizzle-orm` package)
2. Drizzle Kit (`drizzle-kit` package) for migrations
3. PostgreSQL driver (`@neondatabase/serverless` or `postgres`)
4. Existing Supabase client and auth setup
5. TypeScript configuration with strict type checking
6. Database connection string with direct PostgreSQL access
7. Environment variables for connection configuration

## Technical Implementation Learnings

### Critical: Drizzle Relations

**What**: Type-safe metadata defining table relationships for nested queries without manual joins.

**Why Critical**:
- Enables `db.query.tableName.findMany({ with: { relation: true } })` syntax
- Provides TypeScript autocomplete for nested data access
- Eliminates manual join writing and type casting
- Required for optimal developer experience with Drizzle

**Implementation**:
```typescript
// Define relations in schema files
import { relations } from 'drizzle-orm'

export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  userRecipes: many(userRecipes),
}))

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))
```

**Benefit**: Query transforms from verbose SQL joins to clean nested queries:
```typescript
// Before: Manual joins with type casting
const data = await db.select().from(recipes)
  .leftJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
  .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))

// After: Type-safe nested query with autocomplete
const data = await db.query.recipes.findMany({
  with: {
    recipeIngredients: {
      with: { ingredient: true }
    }
  }
})
```

### Critical: Separate Connection Pools for RLS

**What**: Distinct Postgres connection pools for admin operations vs user operations.

**Why Critical**:
- Session state (role, config variables) persists on connections
- Single pool creates race conditions where admin/user contexts mix
- RLS policies fail when role switching isn't isolated per transaction
- Supabase `auth.uid()` requires proper `set_config()` context per request

**Implementation**:
```typescript
// WRONG: Single pool reused for admin and user (race conditions)
const client = postgres(url)
const db = drizzle({ client })
// Both admin and user use same connections → context leakage

// CORRECT: Separate pools with proper isolation
const adminClient = postgres(url, { prepare: false })
export const adminDb = drizzle({ client: adminClient, schema })

const userClient = postgres(url, { prepare: false })
export const userDb = drizzle({ client: userClient, schema })

export function createUserDb(token: SupabaseToken) {
  return (async (transaction, ...rest) => {
    return await userDb.transaction(async (tx) => {
      try {
        await tx.execute(sql`
          select set_config('request.jwt.claims', '${sql.raw(JSON.stringify(token))}', TRUE);
          select set_config('request.jwt.claim.sub', '${sql.raw(token.sub ?? '')}', TRUE);
          set local role ${sql.raw(token.role ?? 'anon')};
        `)
        return await transaction(tx)
      } finally {
        await tx.execute(sql`
          select set_config('request.jwt.claims', NULL, TRUE);
          select set_config('request.jwt.claim.sub', NULL, TRUE);
          reset role;
        `)
      }
    }, ...rest)
  }) as typeof userDb.transaction
}
```

**Usage**:
```typescript
// Admin operations (bypass RLS)
import { adminDb } from '@/db/client'
await adminDb.select().from(recipes) // All recipes

// User operations (respects RLS)
import { createUserDb } from '@/db/client'
const userDb = createUserDb(supabaseToken)
await userDb((tx) => tx.select().from(recipes)) // Only user's recipes
```

### Additional Best Practices

**Environment Variable Validation**:
- Add validation at module load, not runtime
- Provide clear error messages for missing vars
- Prevents confusing runtime crashes in production

```typescript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in environment')
}
```

**Strategic Indexing**:
- Index foreign keys for join performance
- Add composite indexes for common query patterns
- Use filtered indexes for subset queries (e.g., `where quantity > 0`)

```typescript
export const recipes = pgTable('recipes', {
  // ... columns
}, (table) => [
  index('idx_recipes_user').on(table.userId),
  index('idx_recipes_user_seeded').on(table.userId, table.isSeeded),
])
```

**Circular Dependency Handling**:
- Import related tables directly in relation definitions
- Drizzle handles circular deps automatically
- No need for string-based forward references

```typescript
// CORRECT: Direct imports
import { recipeIngredients } from './recipes'
export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  recipeIngredients: many(recipeIngredients), // ✅ Works
}))
```

## Out of Scope

1. Replacing Supabase Client entirely (use both for different purposes)
2. Database administration UI or visual query builder
3. Custom ORM features beyond Drizzle capabilities
4. Database performance tuning or query optimization tools
5. Data migration from other ORMs or raw SQL
6. GraphQL schema generation from Drizzle
7. Real-time subscriptions (use Supabase Realtime)
8. File storage operations (use Supabase Storage)
9. Edge function integration with Drizzle
10. Multi-database support beyond PostgreSQL
