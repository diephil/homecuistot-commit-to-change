# Proxy Contract: Route Protection and Redirection

**Feature**: 006-admin-dashboard
**Type**: Edge Proxy
**Runtime**: Next.js Edge Runtime

## Overview

Proxy handles authentication checks, admin role validation, and backward-compatible URL redirects. Runs before all route handlers.

## Execution Context

**File**: `apps/nextjs/src/proxy.ts`
**Runtime**: Edge Runtime (Vercel Edge, Cloudflare Workers compatible)
**Execution Order**: Before all route handlers and API routes
**Performance Budget**: <50ms total execution time

## Route Matcher Configuration

```typescript
export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',

    // Protected app routes
    '/app/:path*',

    // Exclude static files and internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Function Signature

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest): Promise<NextResponse>
```

## Input

### Request Object

```typescript
interface MiddlewareRequest {
  url: string                    // Full request URL
  nextUrl: {
    pathname: string             // Route pathname (e.g., "/admin/dashboard")
    searchParams: URLSearchParams
  }
  cookies: RequestCookies         // Request cookies (Supabase session)
  headers: Headers                // Request headers
}
```

### Environment Variables

```typescript
// Required
NEXT_PUBLIC_SUPABASE_URL: string        // Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string  // Supabase anon key
ADMIN_USER_IDS: string                    // Comma-separated admin user UUIDs from Supabase Auth (e.g., "uuid1,uuid2,uuid3")

// Optional
ENABLE_ROUTE_REDIRECTS?: string          // Feature flag for URL redirects (default: "true")
```

## Output

### Response Types

#### 1. Allow Access (200)
```typescript
const response = NextResponse.next()
// Optionally set headers
response.headers.set('x-user-role', isAdmin ? 'admin' : 'user')
return response
```

#### 2. Redirect (308)
```typescript
return NextResponse.redirect(
  new URL('/app/onboarding', request.url),
  { status: 308 }  // Permanent redirect, preserves HTTP method
)
```

#### 3. Unauthorized (401 → Redirect to Login)
```typescript
const loginUrl = new URL('/login', request.url)
loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
return NextResponse.redirect(loginUrl)
```

#### 4. Forbidden (403 → Show 404)
```typescript
// Rewrite to non-existent route to show 404 page without changing URL
return NextResponse.rewrite(new URL('/this-page-does-not-exist', request.url))
```

## Behavior Specification

### Admin Route Protection (`/admin/*`)

```typescript
// Pseudocode
if (pathname.startsWith('/admin')) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return redirect('/login?redirect=/admin')
  }

  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
  if (!user.id || !adminIds.includes(user.id)) {
    return rewrite('/this-page-does-not-exist')  // Shows 404, URL unchanged
  }

  return next()  // Allow access
}
```

**Test Cases**:
- ✅ Admin user navigates to /admin → Allow (200)
- ❌ Non-admin user navigates to /admin → Rewrite to 404 (URL stays /admin)
- ❌ Unauthenticated user navigates to /admin → Redirect to /login (401)
- ✅ Admin user navigates to /admin/dashboard → Allow (200)

### Protected Route Authentication (`/app/*`)

```typescript
// Pseudocode
if (pathname.startsWith('/app')) {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return redirect(`/login?redirect=${pathname}`)
  }

  return next()  // Allow access
}
```

**Test Cases**:
- ✅ Authenticated user navigates to /app/onboarding → Allow (200)
- ❌ Unauthenticated user navigates to /app/onboarding → Redirect to /login (401)
- ✅ User bookmarks /app/recipes → Redirect to /login preserves redirect URL

### Old Route Handling

**Decision**: No backward-compatible redirects. Old URLs (`/onboarding`, `/inventory`, etc.) will return 404.

**Rationale**: All internal navigation updated to new URLs. No external links or bookmarks to preserve (MVP).

## Error Handling

### Supabase Connection Failure

```typescript
try {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('[Middleware] Supabase auth error:', error)
    // Fail open: allow access but log error (MVP behavior)
    // Production: fail closed (deny access)
    return NextResponse.next()
  }
} catch (err) {
  console.error('[Middleware] Unexpected error:', err)
  return NextResponse.next()  // Graceful degradation
}
```

### Missing Environment Variables

```typescript
if (!process.env.ADMIN_USER_IDS) {
  console.error('[Middleware] ADMIN_USER_IDS not configured')
  // Deny all /admin access
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
}
```

### Session Expired

```typescript
// Supabase SSR client automatically refreshes expired sessions
// If refresh fails, user is treated as unauthenticated
const { data: { user } } = await supabase.auth.getUser()
if (!user && pathname.startsWith('/app')) {
  return redirect('/login?redirect=${pathname}')
}
```

## Performance Considerations

### Optimization Strategies

1. **Early Returns**: Check most common cases first
2. **Cookie Efficiency**: Supabase client caches session from cookies
3. **Matcher Precision**: Limit middleware execution to relevant routes only
4. **No Database Calls**: MVP uses env var for admin check (no DB query)

### Performance Budget

| Operation | Target | Maximum |
|-----------|--------|---------|
| Route match check | <1ms | 5ms |
| Supabase getUser() | <20ms | 50ms |
| Admin ID check (split + includes) | <1ms | 2ms |
| Redirect response | <5ms | 10ms |
| **Total** | **<30ms** | **50ms** |

## Security Considerations

### Session Security

- Session token stored in HTTP-only cookies (Supabase default)
- HTTPS-only in production (Next.js enforces)
- CSRF protection via SameSite cookie attribute

### Admin ID Protection

- `ADMIN_USER_IDS` stored in environment variable (not exposed to client)
- Comparison happens server-side only (Edge Runtime)
- No admin role information leaked in response headers (optional header removed for security)

### Route Protection

- Middleware runs before all route handlers (no bypass possible)
- Unauthenticated users cannot access /app/* or /admin/*
- Non-admin users cannot access /admin/* even if authenticated

## Testing Contract

### Unit Tests (Optional for MVP)

```typescript
describe('middleware', () => {
  it('allows admin access for correct user ID', async () => {
    const response = await middleware(
      mockRequest('/admin', { userId: ADMIN_USER_IDS })
    )
    expect(response.status).toBe(200)
  })

  it('denies admin access for non-admin user', async () => {
    const response = await middleware(
      mockRequest('/admin', { userId: 'other-user-id' })
    )
    expect(response.status).toBe(302)  // Redirect to /unauthorized
  })

  it('requires auth for /app routes', async () => {
    const response = await middleware(mockRequest('/app/onboarding'))
    expect(response.status).toBe(302)  // Redirect to /login
  })
})
```

### Manual Testing Checklist

- [ ] Admin user can access /admin
- [ ] Non-admin user sees unauthorized page at /admin
- [ ] Unauthenticated user redirected to login at /admin
- [ ] Authenticated user can access /app/onboarding
- [ ] Unauthenticated user redirected to login at /app/onboarding
- [ ] Landing page / remains accessible without auth
- [ ] All internal navigation uses /app/* URLs (no old URLs)

## Dependencies

```typescript
// Package imports
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
process.env.ADMIN_USER_IDS
```

## Future Extensions

### Phase 2: Database-Backed Roles

```typescript
// Query user role from database
const { data: userRole } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single()

const isAdmin = userRole?.role === 'admin'
```

### Phase 3: Rate Limiting

```typescript
// Track admin access attempts
const attempts = await redis.incr(`admin_attempts:${user.id}`)
if (attempts > 5) {
  return new NextResponse('Too many attempts', { status: 429 })
}
```

### Phase 4: Audit Logging

```typescript
// Log admin access
if (pathname.startsWith('/admin') && isAdmin) {
  await logAdminAccess({
    userId: user.id,
    path: pathname,
    timestamp: new Date(),
  })
}
```
