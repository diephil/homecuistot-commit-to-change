# Quickstart: Route Restructuring and Admin Access

**Feature**: 006-admin-dashboard
**Branch**: `006-admin-dashboard`
**Estimated Time**: 3-4 hours

## Prerequisites

- ✅ Next.js 16 app running
- ✅ Supabase Auth configured
- ✅ Admin user created in Supabase Auth
- ✅ `.env.local` with Supabase credentials

## Step-by-Step Implementation

### Phase 1: Environment Setup (5 min)

**1. Add admin user ID to environment**

Get your user ID from Supabase dashboard or:
```bash
# Login to your app, then check browser devtools console
# Or query Supabase directly
```

Add to `apps/nextjs/.env.local`:
```bash
ADMIN_USER_IDS=uuid1,uuid2,uuid3  # Comma-separated list of admin user IDs
```

**2. Verify existing setup**
```bash
cd apps/nextjs
pnpm dev
# Visit http://localhost:3000, login should work
```

---

### Phase 2: Create Route Groups (15 min)

**1. Create new route group directories**

```bash
cd apps/nextjs/src/app
mkdir -p "(app)/onboarding"
mkdir -p "(app)/inventory"
mkdir -p "(app)/recipes"
mkdir -p "(app)/suggestions"
mkdir -p "(admin)"
mkdir -p "(auth)/unauthorized"
```

**2. Create App Layout**

```typescript
// apps/nextjs/src/app/(app)/layout.tsx
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

**3. Create Admin Layout**

```typescript
// apps/nextjs/src/app/(admin)/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

---

### Phase 3: Migrate Protected Pages (20 min)

**1. Copy pages to new (app) route group**

```bash
cp -r "(protected)/onboarding" "(app)/onboarding"
cp -r "(protected)/inventory" "(app)/inventory"
cp -r "(protected)/recipes" "(app)/recipes"
cp -r "(protected)/suggestions" "(app)/suggestions"
```

**2. Verify pages render at new URLs**

```bash
pnpm dev
# Test: http://localhost:3000/app/onboarding (should work)
```

---

### Phase 4: Create Admin Page (30 min)

**1. Create admin dashboard page**

```typescript
// apps/nextjs/src/app/(admin)/page.tsx
export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-6xl font-black uppercase mb-6 md:mb-8
                       leading-tight tracking-tight">
          Admin Dashboard
        </h1>

        <div className="border-4 md:border-6 border-black
                        bg-gradient-to-br from-pink-200 to-pink-300
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                        md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                        p-6 md:p-10">
          <p className="text-lg md:text-xl font-bold mb-6">
            Welcome to the admin area. This is a placeholder for future features.
          </p>

          <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
            Coming Soon:
          </h2>
          <ul className="space-y-2 text-base md:text-lg font-bold">
            <li>📊 System analytics</li>
            <li>🔧 Configuration management</li>
            <li>👥 User management</li>
            <li>📝 Content administration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

**2. Create unauthorized page**

```typescript
// apps/nextjs/src/app/(auth)/unauthorized/page.tsx
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="border-4 md:border-6 border-black
                      bg-gradient-to-br from-yellow-200 to-orange-300
                      shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                      md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                      p-6 md:p-10 max-w-2xl w-full">
        <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 md:mb-6
                       leading-tight">
          Access Denied
        </h1>
        <p className="text-lg md:text-xl font-bold mb-4 md:mb-6">
          You don't have permission to access this area.
        </p>
        <p className="text-base md:text-lg font-bold text-gray-700 mb-6 md:mb-8">
          Admin pages are for system administration tasks like processing
          user feedback and managing application data.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 md:px-6 md:py-3
                     bg-cyan-400 border-3 md:border-4 border-black
                     font-black uppercase text-sm md:text-base
                     shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                     md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[2px] hover:translate-y-[2px]
                     transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
```

---

### Phase 5: Implement Middleware (45 min)

**1. Create middleware file**

```typescript
// apps/nextjs/src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response
  let response = NextResponse.next()

  // Initialize Supabase client
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

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    if (!user) {
      // Not authenticated: redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin role
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
    const isAdmin = user.id && adminIds.includes(user.id)

    if (!isAdmin) {
      // Authenticated but not admin: show unauthorized
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Admin user: allow access
    return response
  }

  // Protected app route authentication
  if (pathname.startsWith('/app')) {
    if (!user) {
      // Not authenticated: redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Authenticated user: allow access
    return response
  }

  // All other routes: allow access
  return response
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',

    // Protected app routes
    '/app/:path*',

    // Exclude static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**2. Test middleware**

```bash
pnpm dev

# Test cases:
# 1. Visit /admin (not logged in) → should redirect to /login
# 2. Login as non-admin user, visit /admin → should show /unauthorized
# 3. Login as admin user, visit /admin → should show admin dashboard
# 4. Visit /app/inventory → should require login
# 5. Visit /onboarding → should return 404 (old URL)
```

---

### Phase 6: Verification (30 min)

**1. Manual test checklist**

```bash
# Route Access
□ Landing page / accessible without login
□ /login accessible without login
□ /app/onboarding requires login
□ /admin requires admin role

# Old URLs (Should 404)
□ /onboarding returns 404
□ /inventory returns 404
□ /recipes returns 404
□ /suggestions returns 404

# Authentication
□ Unauthenticated at /app/* → redirects to /login
□ Unauthenticated at /admin → redirects to /login
□ Non-admin at /admin → shows /unauthorized
□ Admin at /admin → shows admin dashboard

# Design
□ Admin page uses neobrutalism (pink gradient, thick borders)
□ Unauthorized page uses neobrutalism (yellow/orange gradient)
□ Mobile responsive (no horizontal overflow)
```

**2. Verify environment**

```bash
# Check .env.local has ADMIN_USER_IDS
grep ADMIN_USER_IDS .env.local

# Should output: ADMIN_USER_IDS=your-uuid
```

**3. Check TypeScript compilation**

```bash
pnpm build
# Should succeed with no errors
```

---

### Phase 7: Update Navigation Links (15 min) **REQUIRED**

**1. Update suggestions page links**

```typescript
// apps/nextjs/src/app/(protected)/suggestions/page.tsx
// AND apps/nextjs/src/app/(app)/suggestions/page.tsx

// Find and replace:
- <Link href="/inventory">View Inventory</Link>
+ <Link href="/app/inventory">View Inventory</Link>

- <Link href="/recipes">All Recipes</Link>
+ <Link href="/app/recipes">All Recipes</Link>
```

**2. Update onboarding router.push calls**

```typescript
// apps/nextjs/src/app/(protected)/onboarding/page.tsx
// AND apps/nextjs/src/app/(app)/onboarding/page.tsx

// Find and replace:
- router.push("/suggestions")
+ router.push("/app/suggestions")
```

**3. Update login OAuth redirect**

```typescript
// apps/nextjs/src/app/(auth)/login/page.tsx

// Find and replace:
- redirectTo: `${getURL()}auth/callback?next=/onboarding`,
+ redirectTo: `${getURL()}auth/callback?next=/app/onboarding`,
```

**4. Verify all links updated**

```bash
# Search for remaining old links (should return nothing)
grep -r "href=\"/inventory\"" apps/nextjs/src/app/ --include="*.tsx"
grep -r "href=\"/recipes\"" apps/nextjs/src/app/ --include="*.tsx"
grep -r "href=\"/suggestions\"" apps/nextjs/src/app/ --include="*.tsx"
grep -r "push.*\"/suggestions\"" apps/nextjs/src/app/ --include="*.tsx"
grep -r "next=/onboarding" apps/nextjs/src/app/ --include="*.tsx"
```

**Why This Matters**:
- Avoids unnecessary 308 redirects (better performance)
- Users see correct URLs in browser address bar
- No redirect "flash" during navigation

---

### Phase 8: Cleanup (15 min)

**1. Optional: Remove old (protected) routes**

```bash
# After verifying all /app/* routes work:
# rm -rf "apps/nextjs/src/app/(protected)"

# For MVP, keep old routes as backup
# Remove in follow-up PR after confidence
```

**2. Update navigation links**

Search codebase for hardcoded route references:
```bash
grep -r "href=\"/onboarding\"" apps/nextjs/src/
grep -r "href=\"/inventory\"" apps/nextjs/src/
grep -r "href=\"/recipes\"" apps/nextjs/src/
grep -r "href=\"/suggestions\"" apps/nextjs/src/

# Update to /app/* URLs
```

---

## Quick Commands

```bash
# Development
cd apps/nextjs
pnpm dev

# Build (verify no errors)
pnpm build

# Run tests (if any)
pnpm test

# Check TypeScript
npx tsc --noEmit

# Lint
pnpm lint
```

## Troubleshooting

### Issue: Infinite redirect loop at /admin

**Cause**: ADMIN_USER_IDS not matching logged-in user

**Fix**:
```bash
# Get your user ID from Supabase dashboard
# Or add console.log in middleware
console.log('User ID:', user.id)
console.log('Admin ID:', process.env.ADMIN_USER_IDS)

# Update .env.local with correct UUID
```

### Issue: /app/onboarding returns 404

**Cause**: Page not copied to new route group

**Fix**:
```bash
# Verify file exists
ls apps/nextjs/src/app/(app)/onboarding/page.tsx

# If missing, copy from (protected)
cp -r apps/nextjs/src/app/(protected)/onboarding apps/nextjs/src/app/(app)/
```

### Issue: Old routes not redirecting

**Cause**: Middleware matcher not including old routes

**Fix**:
```typescript
// Check middleware.ts config.matcher includes:
'/onboarding',
'/inventory',
'/recipes',
'/suggestions',
```

### Issue: Middleware not running

**Cause**: File in wrong location or not exported correctly

**Fix**:
```bash
# Middleware must be at:
apps/nextjs/src/middleware.ts

# Verify export:
export async function middleware(request: NextRequest) { ... }
export const config = { matcher: [...] }
```

## Success Criteria

✅ All test cases pass
✅ TypeScript compiles without errors
✅ No console errors in browser
✅ Admin dashboard visible to admin user only
✅ Old URLs redirect to new /app/* structure
✅ Mobile responsive design (test on mobile viewport)

## Next Steps

After successful implementation:

1. **Deploy to staging** - Test with real users
2. **Monitor redirects** - Check analytics for 308 traffic
3. **Gather feedback** - Admin user experience
4. **Phase 2**: Implement Opik annotation processing (separate feature)
5. **Deprecation**: Remove old (protected) route group after confidence

## Estimated Completion Time

- ✅ Phase 1: Environment Setup (5 min)
- ✅ Phase 2: Create Route Groups (15 min)
- ✅ Phase 3: Migrate Pages (20 min)
- ✅ Phase 4: Create Admin Page (30 min)
- ✅ Phase 5: Implement Middleware (45 min)
- ✅ Phase 6: Verification (30 min)
- ✅ Phase 7: Update Navigation Links (15 min) **REQUIRED**
- ✅ Phase 8: Cleanup (15 min)

**Total**: ~3 hours (MVP implementation)
