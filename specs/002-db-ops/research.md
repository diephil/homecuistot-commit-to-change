# Research: Drizzle ORM + Supabase Integration

**Date**: 2026-01-19
**Phase**: 0 (Research & Analysis)

## Research Questions & Decisions

### 1. Testing Framework

**Decision**: Vitest

**Rationale**:
- Official Next.js 16 support with documented integration
- 30-70% faster test execution vs Jest with smart watch mode
- Native ESM, TypeScript, JSX support (esbuild-powered)
- Better Next.js App Router compatibility
- Modern tooling aligned with 2026 ecosystem

**Alternatives Considered**:
- **Jest**: Legacy projects only, complex config for ESM/TS
- **Node Test Runner**: Too basic for ORM integration tests

**Implementation Notes**:
- Use `environment: 'node'` for Drizzle schema/query tests
- E2E tests for async Server Components (Vitest doesn't support yet)
- Test RLS policies with dual client pattern

---

### 2. Connection Pooling Strategy

**Decision**: Supabase Transaction Pooler + `postgres-js` driver + `prepare: false`

**Rationale**:
- Transaction pooler designed for serverless/edge environments
- Critical: Must disable prepared statements (`prepare: false`) - not supported in Transaction mode
- With 200 client limit (base plan), pool size = 1 maximizes concurrent function instances
- Serverless optimization: each function instance gets connection from shared pool

**Alternatives Considered**:
- **Direct Connection**: Exhausts connection pool quickly in serverless (each invocation = new connection)
- **Session Pooler**: Requires persistent connections, incompatible with serverless
- **`@neondatabase/serverless`**: Only for edge runtime, not standard Next.js API routes

**Pool Allocation Strategy**:
- Heavy PostgREST API usage: ≤40% pool to Drizzle
- Otherwise: up to 80% pool to Drizzle
- Always: pool size = 1 for serverless clients

**Code Pattern**:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL, { prepare: false })
const db = drizzle({ client })
```

---

### 3. Migration Coordination

**Decision**: Generate Drizzle migrations → Output to `supabase/migrations/` → Apply via Supabase CLI

**Rationale**:
- Single source of truth: unified migration directory
- Production safety: manual review before applying (vs push = auto-apply)
- Supabase database branching compatibility
- Version control + code review for schema changes
- Rollback capabilities with migration files

**Alternatives Considered**:
- **Drizzle Kit Push**: Fast for local dev, risky for production (no review step)
- **Separate Migration Directories**: Coordination nightmare, schema drift risk
- **Supabase Migrations Only**: Lose Drizzle schema types, manual type definitions

**Workflow**:
- **Local Development**: `drizzle-kit push` for rapid iteration
- **Production**:
  1. `drizzle-kit generate` → timestamped SQL in `supabase/migrations/`
  2. Review generated SQL (especially for existing tables)
  3. `supabase db push` to apply

**Configuration**:
```typescript
// drizzle.config.ts
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations', // Critical: output to Supabase folder
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL }
})
```

---

### 4. PostgreSQL Driver

**Decision**: `postgres` (postgres-js) for standard serverless, `@neondatabase/serverless` for edge

**Rationale**:
- **Standard Serverless** (Next.js API routes, Server Actions): `postgres-js`
  - Recommended by Drizzle for Supabase
  - Supports HTTP + WebSocket protocols
  - Compatible with Transaction pooler

- **Edge Environments** (Cloudflare Workers, Vercel Edge Functions): `@neondatabase/serverless`
  - HTTP/WebSocket instead of TCP
  - HTTP mode: faster for single queries
  - WebSocket mode: required for transactions

**Alternatives Considered**:
- **node-postgres (pg)**: Bulkier, less serverless-optimized
- **Neon driver for standard serverless**: Overkill, designed for edge

**Implementation**:
```typescript
// Standard serverless (default)
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
const client = postgres(process.env.DATABASE_URL, { prepare: false })

// Edge functions (if needed later)
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
const sql = neon(process.env.DATABASE_URL)
```

---

### 5. Supabase Auth Context + RLS Integration

**Decision**: Dual client pattern with JWT token passing via session variables

**Rationale**:
- Drizzle natively supports PostgreSQL RLS with `pgPolicy` definitions
- Must pass Supabase JWT token to database for `auth.uid()` and RLS policies
- Dual client pattern: admin client (bypasses RLS) + user client factory (respects RLS)
- Session variables (`request.jwt.claims`, `role`) enable RLS context

**Alternatives Considered**:
- **Single Admin Client**: Security risk, bypasses all RLS policies
- **Manual SQL for Auth Context**: Error-prone, not type-safe
- **Middleware-based Token Injection**: Complex, harder to debug

**Implementation Pattern**:
```typescript
// src/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Admin client (bypasses RLS) - use sparingly
const adminClient = postgres(process.env.DATABASE_URL, { prepare: false })
export const adminDb = drizzle({ client: adminClient, schema })

// RLS-aware client factory
export function createUserDb(accessToken: string) {
  const userClient = postgres(process.env.DATABASE_URL, {
    prepare: false,
    onconnect: async (connection) => {
      await connection.query(`
        SELECT set_config('request.jwt.claims', '${accessToken}', true);
        SELECT set_config('role', 'authenticated', true);
      `)
    }
  })
  return drizzle({ client: userClient, schema })
}

// Usage in Server Action
export async function myAction() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')

  const db = createUserDb(session.access_token)
  // Queries now respect RLS policies
  const data = await db.query.table.findMany()
}
```

**Security Guidelines**:
- Only use admin client in controlled server environments
- Always validate session before creating user client
- Define RLS policies using `pgPolicy` or Supabase dashboard
- Test RLS policies with different user contexts

---

## Technical Decisions Summary

| Question | Decision | Key Constraint |
|----------|----------|----------------|
| **Testing** | Vitest | Next.js 16 official support, 30-70% faster |
| **Connection** | Transaction pooler + `postgres-js` + `prepare: false` | Serverless-optimized, prepared statements unsupported |
| **Migrations** | Generate → `supabase/migrations/` → manual apply | Single source of truth, production safety |
| **Driver** | `postgres` (standard) / `@neondatabase/serverless` (edge) | Environment-specific optimization |
| **Auth/RLS** | Dual client + JWT token passing via session vars | Native RLS support + Supabase auth integration |

---

## Environment Configuration

**Required Environment Variables**:
```bash
# Standard connection (Transaction pooler)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (for migrations/admin tasks)
DATABASE_URL_DIRECT="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Local development (Supabase local)
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
```

**Configuration Files**:
- `drizzle.config.ts`: Schema path, output dir (`supabase/migrations/`), connection URL
- `vitest.config.ts`: Node environment for DB tests
- `.env.local`: Connection strings, Supabase keys

---

## Integration Architecture

```text
┌─────────────────────────────────────────────────────┐
│ Next.js 16 App Router                              │
│                                                     │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │ Server Component │      │ API Route        │   │
│  │ Server Action    │      │ Route Handler    │   │
│  └────────┬─────────┘      └────────┬─────────┘   │
│           │                         │              │
│           ├─────────────────────────┤              │
│           │                         │              │
│           ▼                         ▼              │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │ Supabase Client  │      │ Drizzle Client   │   │
│  │ (Auth, Realtime) │      │ (Type-safe CRUD) │   │
│  └────────┬─────────┘      └────────┬─────────┘   │
│           │                         │              │
└───────────┼─────────────────────────┼──────────────┘
            │                         │
            │         ┌───────────────┘
            │         │
            ▼         ▼
   ┌─────────────────────────────┐
   │ Supabase PostgreSQL         │
   │ (Transaction Pooler)        │
   │                             │
   │ • Auth (RLS context)        │
   │ • Realtime subscriptions    │
   │ • Drizzle ORM queries       │
   └─────────────────────────────┘
```

**Separation of Concerns**:
- **Supabase Client**: Auth (login/logout), Realtime (subscriptions), Storage
- **Drizzle ORM**: Type-safe CRUD, complex queries, migrations, schema definitions
- **Shared**: PostgreSQL database, RLS policies, connection pooling

---

## Risk Mitigation

**Risk**: Breaking existing Supabase Auth flow
- **Mitigation**: Keep `src/utils/supabase/` untouched, Drizzle coexists independently
- **Validation**: Test auth callback routes after integration

**Risk**: Connection pool exhaustion
- **Mitigation**: Use Transaction pooler with `prepare: false`, pool size = 1
- **Validation**: Load test with concurrent requests

**Risk**: RLS policies not enforced via Drizzle
- **Mitigation**: Dual client pattern with JWT token passing
- **Validation**: Integration tests verifying RLS with different user contexts

**Risk**: Schema drift between Drizzle and Supabase
- **Mitigation**: Output Drizzle migrations to `supabase/migrations/`, single source of truth
- **Validation**: CI check comparing schema definitions

---

## Next Steps (Phase 1)

1. **Data Model**: Define initial Drizzle schema for meal planning entities
2. **Contracts**: Document database client API (admin vs user client)
3. **Quickstart**: Setup guide with configuration files and example queries
4. **Agent Context**: Update AGENTS.md with Drizzle patterns and conventions
