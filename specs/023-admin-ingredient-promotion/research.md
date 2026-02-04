# Research: Admin Unrecognized Ingredient Promotion

## 1. Opik REST API for Span Search

**Decision**: Use Opik REST API directly via backend service (`lib/services/opik-spans.ts`)

**Rationale**:
- No existing REST API wrapper in codebase
- Project uses `opik` Node SDK for tracing (creating spans) only, not querying
- Span search/update requires REST API calls

**Alternatives rejected**:
- `opik` Node SDK — supports creating traces/spans only; no `searchSpans()` or update methods
- Frontend Opik queries — rejected; Opik API requires secrets (API key in production) and must stay server-side

### API Endpoints

**Search spans** (POST): `{OPIK_URL_OVERRIDE}/v1/private/spans/search`

```json
{
  "project_name": "{OPIK_PROJECT_NAME}",
  "filters": [
    { "field": "tags", "operator": "contains", "value": "unrecognized_items" },
    { "field": "tags", "operator": "not_contains", "value": "promotion_reviewed" }
  ],
  "limit": 1
}
```

Returns: `{ "data": [{ "id": "...", "trace_id": "...", "tags": [...], ... }] }`

**Get span by ID** (GET): `{OPIK_URL_OVERRIDE}/v1/private/spans/{id}`

Returns full span object including current `tags`, `trace_id`, `metadata`. Used to re-fetch the span's current state before PATCH to avoid stale tag data.

**Update span tags** (PATCH): `{OPIK_URL_OVERRIDE}/v1/private/spans/{id}`

```json
{
  "trace_id": "<from GET response>",
  "tags": ["<current tags from GET>", "promotion_reviewed"]
}
```

**Tag update flow**: Always GET span by ID first, then PATCH with current tags + `promotion_reviewed`. Never rely on tags cached from initial search — they may be stale.
```

### Authentication

**Local (self-hosted)**: No auth headers required
- Base URL: `http://localhost:5173/api`

**Production (Opik Cloud)**: Two headers required on every request
- `Comet-Workspace: philippe-diep` (from `OPIK_WORKSPACE` env var)
- `authorization: <OPIK_API_KEY>` (from `OPIK_API_KEY` env var, no Bearer prefix)

### Environment Variables

| Variable | Local | Production |
|----------|-------|-----------|
| `OPIK_URL_OVERRIDE` | `http://localhost:5173/api` | `https://www.comet.com/opik/api` |
| `OPIK_PROJECT_NAME` | `homecuistot-hackathon` | `homecuistot-commit-to-change` |
| `OPIK_API_KEY` | Not set | Set in secrets |
| `OPIK_WORKSPACE` | Not set | `philippe-diep` |

---

## 2. Database Access Pattern

**Decision**: Use `adminDb` (bypasses RLS) for ingredient operations

**Rationale**:
- `ingredients` is a global catalog, not user-scoped
- RLS policies don't apply to shared tables
- Codebase documents `adminDb` for administrative operations

**Alternatives rejected**:
- `createUserDb(token)` — unnecessary overhead for non-user-scoped data

### Insert Pattern

```typescript
import { adminDb } from "@/db/client";
import { ingredients } from "@/db/schema";

await adminDb
  .insert(ingredients)
  .values({
    name: ingredientName.toLowerCase(),
    category: selectedCategory,
  })
  .onConflictDoNothing(); // Graceful duplicate handling
```

### Lookup Pattern (case-insensitive)

```typescript
import { sql } from "drizzle-orm";

const existing = await adminDb
  .select({ name: ingredients.name })
  .from(ingredients)
  .where(
    sql`LOWER(${ingredients.name}) IN (${sql.join(
      names.map((n) => sql`${n.toLowerCase()}`),
      sql`, `,
    )})`,
  );
```

---

## 3. Admin Route Protection

**Decision**: Extend existing `proxy.ts` admin protection to API routes

**Rationale**:
- Admin pages already protected in `src/proxy.ts` via `ADMIN_USER_IDS` environment variable
- Proxy validates user session + checks against comma-separated admin ID list
- Returns 404 for unauthorized users

**Existing proxy.ts Protection** (page routes):

```typescript
if (path.startsWith("/admin")) {
  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || [];
  if (!user || !adminIds.includes(user.id)) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }
}
```

**Note**: Proxy protects `/admin` page routes only. API routes at `/api/admin/*` need independent auth checks to verify session + validate against `ADMIN_USER_IDS`.

---

## 4. Frontend-Backend Communication

**Decision**: Next.js API routes (`/api/admin/*`) as backend service layer

**Rationale**: User requirement—"rest api opik must be reached via a dedicated service; backend handles opik contact with proper secrets and returns information necessary for span updates."

**Alternatives rejected**:
- Server Actions — viable but user explicitly requested REST API pattern
- Direct frontend Opik calls — rejected; secrets must stay server-side

### Required API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/spans/next` | GET | Fetch next unprocessed span; deduplicate items; filter against DB; return cleaned list + span ID |
| `/api/admin/ingredients/promote` | POST | Insert ingredients into DB; re-fetch span by ID; tag as reviewed |
| `/api/admin/spans/mark-reviewed` | POST | Re-fetch span by ID; tag as `promotion_reviewed` (dismiss-all case) |

**Key pattern**: Promote and mark-reviewed endpoints re-fetch the span from Opik (GET by ID) before PATCH. Frontend only sends `spanId` — backend handles fetching current tags and trace_id.

---

## 5. Opik Project Name Resolution

**Decision**: Use `OPIK_PROJECT_NAME` environment variable

**Rationale**:
- Already configured in `.env.local` and `.env.prod`
- Opik SDK already reads this variable
- Maintains environment portability

**Alternatives rejected**: Hardcoding project names—rejected for portability.

---

## 6. UI Component Strategy

**Decision**: Use existing RetroUI/shared components with neobrutalism design

**Rationale**:
- Admin layout already uses neobrutalist styling (vibrant, bold borders, high contrast)
- Shared components available: Button, Card, Badge, Text
- Consistent with design system

**Component Mapping**:

| Use Case | Component | Source |
|----------|-----------|--------|
| Primary actions | Button | `@/components/shared` |
| Containers | Card | `@/components/shared` |
| Category tags | Badge | `@/components/shared` |
| Labels/descriptions | Text | `@/components/shared` |
| Category selection | Native `<select>` or RetroUI select | Built-in |

**Alternatives rejected**: shadcn/ui—available but RetroUI is primary design system per constitution.

---

## Resolved Questions

- **Span data shape**: Opik search returns `{ data: [{ id, trace_id, name, tags, metadata, ... }] }`. GET by ID returns same fields for a single span.
- **Duplicate detection**: Exact match (case-insensitive) against `ingredients.name`. No fuzzy/similarity matching for MVP.
- **Pagination**: Fetch 1 span at a time (`limit: 1`). Admin processes sequentially.
- **Error handling**: Log + return 500 to frontend. No automatic retry for MVP. Frontend shows error + retry CTA.
- **Tag staleness**: Backend re-fetches span by ID (GET) before every PATCH to get current tags. Frontend never sends tags.
