# Research: Route Restructuring and Admin Access

**Feature**: 006-admin-dashboard
**Date**: 2026-01-23
**Status**: Complete

## Research Questions

### Q1: Next.js App Router Route Migration Strategy

**Question**: How to migrate existing protected pages from `(protected)` group to `/app/*` route without breaking existing functionality?

**Decision**: Use parallel route groups during migration, then deprecate old routes

**Rationale**:
- Next.js App Router supports multiple route groups serving same pages
- Create `(app)` route group parallel to existing `(protected)` group
- Implement redirects in middleware for old → new URLs
- Safe migration path: deploy new routes → verify → add redirects → remove old routes

**Alternatives Considered**:
- Direct file moves: Risky, no rollback capability
- URL rewrite at build time: Complex, harder to debug
- Client-side redirects: SEO impact, slower UX

**Implementation Pattern**:
```typescript
// Middleware redirects
if (pathname.startsWith('/onboarding')) {
  return NextResponse.redirect(new URL('/app/onboarding', request.url))
}
```

### Q2: Admin Role Storage and Validation

**Question**: How to identify and validate single admin user using existing Supabase Auth?

**Decision**: Store admin user ID in environment variable, validate via middleware

**Rationale**:
- MVP requires single admin only (application owner)
- No need for complex RBAC system yet
- Environment variable approach: simple, secure, fast
- Middleware check: centralized, runs before route handlers
- Future extensibility: can migrate to database roles later

**Alternatives Considered**:
- Supabase custom claims: Overkill for single user, requires JWT customization
- Database roles table: Over-engineering for MVP, adds query overhead
- Hardcoded email check: Less flexible than user ID

**Implementation Pattern**:
```typescript
// .env.local
ADMIN_USER_IDS=uuid1,uuid2,uuid3

// Middleware
const { data: { user } } = await supabase.auth.getUser()
const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
const isAdmin = user?.id && adminIds.includes(user.id)
```

### Q3: Middleware Architecture for Auth and Redirects

**Question**: Should we use single middleware or separate concerns (auth vs redirects)?

**Decision**: Single middleware with conditional logic based on route patterns

**Rationale**:
- Next.js supports one middleware.ts per app
- Route pattern matching (matcher config) allows efficient execution
- Combined approach: check auth state once, apply rules per route
- Performance: single middleware execution per request
- Maintainability: all routing logic in one place

**Alternatives Considered**:
- Multiple middleware via middleware chain library: Additional dependency, complexity
- Route-level auth checks: Duplication across routes, inconsistent
- Separate redirect service: Split logic, harder to reason about

**Implementation Pattern**:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Check auth state once
  const supabase = createClient(request)

  // Route-specific logic
  if (pathname.startsWith('/admin')) {
    // Admin checks
  } else if (pathname.startsWith('/app')) {
    // Auth checks
  } else if (oldRoutePattern) {
    // Redirects
  }
}

export const config = {
  matcher: ['/admin/:path*', '/app/:path*', '/onboarding', '/inventory', ...]
}
```

### Q4: Next.js Middleware with Supabase SSR

**Question**: How to properly use Supabase Auth in Next.js 16 middleware?

**Decision**: Use `@supabase/ssr` createServerClient in middleware with cookie handling

**Rationale**:
- Next.js middleware runs on Edge Runtime
- `@supabase/ssr` provides Edge-compatible client
- Cookie-based session: compatible with middleware environment
- Existing pattern in project: `utils/supabase/server.ts` uses same approach

**Implementation Pattern**:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return response
}
```

### Q5: Backward Compatible URL Redirects

**Question**: Should we redirect old URLs to new /app/* structure?

**Decision**: No backward-compatible redirects. Old URLs will 404.

**Rationale**:
- All internal navigation updated to new URLs
- No external links or bookmarks to preserve (MVP)
- Simpler middleware implementation
- No redirect overhead for any navigation
- Cleaner migration: force cut-over, no mixed state

**Alternatives Considered**:
- 308 Permanent Redirect: Adds complexity, unnecessary for internal-only app
- Dual route support: Confusing, maintains technical debt
- Gradual migration: MVP doesn't need it

**Implementation**: Remove old route patterns from middleware matcher entirely

## Best Practices

### Next.js Middleware Optimization

- **Matcher config**: Limit middleware execution to relevant routes only
- **Early returns**: Check conditions in order of frequency (most common first)
- **Cookie efficiency**: Minimize cookie reads/writes in middleware
- **Edge Runtime limits**: Avoid heavy computations, use lightweight checks

### Supabase Auth Patterns

- **Session refresh**: Middleware handles automatic session refresh
- **Error handling**: Graceful degradation if Supabase unavailable
- **User context**: Pass user info to route handlers via headers
- **Auth state caching**: Middleware sets response headers for downstream use

### Route Migration Safety

- **Feature flags**: Optional ENV var to enable/disable new routes
- **Monitoring**: Log redirect activity during migration period
- **Gradual rollout**: Deploy new routes → test → enable redirects → deprecate old
- **Rollback plan**: Keep old routes until traffic confirms migration success

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route Structure | Parallel route groups (`(app)`, `(admin)`) | Safe migration, clear separation |
| Admin Auth | ENV variable + middleware check | Simple, secure, MVP-appropriate |
| Middleware Pattern | Single middleware with route matching | Performance, maintainability |
| Supabase Integration | `@supabase/ssr` in middleware | Edge-compatible, project pattern |
| Redirect Status | 308 Permanent Redirect | Method-preserving, SEO-friendly |
| Migration Strategy | Deploy new → redirect old → deprecate | Zero-downtime, reversible |

## Dependencies

No new dependencies required. All solutions use existing packages:
- `@supabase/ssr` (existing)
- `@supabase/supabase-js` (existing)
- Next.js 16 App Router (existing)
- Drizzle ORM (existing, for future role storage)
