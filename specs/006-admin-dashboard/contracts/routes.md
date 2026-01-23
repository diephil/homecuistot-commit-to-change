# Route Contracts: Application and Admin Routes

**Feature**: 006-admin-dashboard
**Type**: Next.js App Router Pages

## Route Structure

### Landing Page (Public)

**Path**: `/`
**File**: `apps/nextjs/src/app/page.tsx`
**Auth**: None required
**Purpose**: Public landing page

**Behavior**:
- Accessible to all users (authenticated or not)
- No redirect logic
- Existing implementation preserved

---

### Login Page (Public)

**Path**: `/login`
**File**: `apps/nextjs/src/app/(auth)/login/page.tsx`
**Auth**: None required (public login form)
**Purpose**: User authentication entry point

**Query Parameters**:
- `redirect` (optional): URL to redirect after successful login

**Behavior**:
- Display Supabase OAuth login options
- After successful login, redirect to `redirect` param or `/app/onboarding`

---

### Protected Application Routes

**Base Path**: `/app/*`
**File Pattern**: `apps/nextjs/src/app/(app)/{route}/page.tsx`
**Auth**: Required (any authenticated user)
**Route Group**: `(app)`

#### Migrated Routes

| Old URL | New URL | File | Purpose |
|---------|---------|------|---------|
| `/onboarding` | `/app/onboarding` | `(app)/onboarding/page.tsx` | Kitchen setup wizard |
| `/inventory` | `/app/inventory` | `(app)/inventory/page.tsx` | User's food inventory |
| `/recipes` | `/app/recipes` | `(app)/recipes/page.tsx` | Available recipes |
| `/suggestions` | `/app/suggestions` | `(app)/suggestions/page.tsx` | Meal suggestions |

**Behavior**:
- Middleware checks authentication before rendering
- Unauthenticated users redirected to `/login?redirect={path}`
- Existing page components moved to new route group
- No functional changes to page logic

**Layout**:
```typescript
// apps/nextjs/src/app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* App navigation/header */}
      <main>{children}</main>
    </div>
  )
}
```

---

### Admin Routes

**Base Path**: `/admin/*`
**File Pattern**: `apps/nextjs/src/app/(admin)/{route}/page.tsx`
**Auth**: Required (admin users only)
**Route Group**: `(admin)`

#### Admin Landing Page

**Path**: `/admin`
**File**: `apps/nextjs/src/app/(admin)/page.tsx`
**Purpose**: Admin dashboard placeholder

**Component Contract**:
```typescript
// apps/nextjs/src/app/(admin)/page.tsx
export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-black uppercase mb-8">
        Admin Dashboard
      </h1>

      <div className="border-4 border-black bg-gradient-to-br from-pink-200 to-pink-300
                      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10">
        <p className="text-xl font-bold mb-6">
          Welcome to the admin area. This is a placeholder for future features.
        </p>

        <h2 className="text-2xl font-black uppercase mb-4">Coming Soon:</h2>
        <ul className="space-y-2 text-lg font-bold">
          <li>📊 System analytics</li>
          <li>🔧 Configuration management</li>
          <li>👥 User management</li>
          <li>📝 Content administration</li>
        </ul>
      </div>
    </div>
  )
}
```

**Design Requirements** (Constitution Principle VII):
- Vibrant neobrutalism: pink/yellow/cyan gradients
- Thick black borders (4-8px desktop, 3-4px mobile)
- Bold box shadows (6-12px solid offset)
- Uppercase headings (font-black, 900 weight)
- Mobile-first responsive (remove rotations on mobile)

**Behavior**:
- Middleware validates admin role before rendering
- Non-admin authenticated users → `/unauthorized`
- Unauthenticated users → `/login?redirect=/admin`

**Future Routes** (Not in MVP):
- `/admin/users` - User management
- `/admin/opik` - Opik queue processing
- `/admin/settings` - System configuration

---

### Unauthorized Page

**Path**: `/unauthorized`
**File**: `apps/nextjs/src/app/(auth)/unauthorized/page.tsx` (NEW)
**Auth**: None required
**Purpose**: Error page for insufficient permissions

**Component Contract**:
```typescript
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="border-4 border-black bg-gradient-to-br from-yellow-200 to-orange-300
                      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-black uppercase mb-6">
          Access Denied
        </h1>
        <p className="text-xl font-bold mb-6">
          You don't have permission to access this area.
        </p>
        <p className="text-lg font-bold text-gray-700">
          Admin pages are for system administration tasks like processing
          user feedback and managing application data.
        </p>
        <a href="/" className="inline-block mt-8 px-6 py-3 bg-cyan-400
                               border-4 border-black font-black uppercase
                               shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                               hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                               hover:translate-x-[2px] hover:translate-y-[2px]
                               transition-all">
          ← Back to Home
        </a>
      </div>
    </div>
  )
}
```

---

### Auth Callback (Existing)

**Path**: `/auth/callback`
**File**: `apps/nextjs/src/app/auth/callback/route.ts`
**Auth**: None (processes OAuth callback)
**Purpose**: Exchange OAuth code for session

**Behavior** (Existing):
- Receives OAuth code from Supabase
- Exchanges code for session token
- Sets session cookies
- Redirects to app or specified URL

---

## Route Group Structure

```
apps/nextjs/src/app/
├── (auth)/                   # Public auth pages
│   ├── login/
│   │   └── page.tsx         # Login form
│   └── unauthorized/
│       └── page.tsx         # NEW: Access denied page
│
├── (app)/                    # NEW: Protected app routes under /app/*
│   ├── layout.tsx           # NEW: App-specific layout
│   ├── onboarding/
│   │   └── page.tsx         # Moved from (protected)/onboarding
│   ├── inventory/
│   │   └── page.tsx         # Moved from (protected)/inventory
│   ├── recipes/
│   │   └── page.tsx         # Moved from (protected)/recipes
│   └── suggestions/
│       └── page.tsx         # Moved from (protected)/suggestions
│
├── (admin)/                  # NEW: Admin routes under /admin/*
│   ├── layout.tsx           # NEW: Admin-specific layout
│   └── page.tsx             # NEW: Admin dashboard placeholder
│
├── (protected)/              # DEPRECATED: Old protected routes
│   └── ...                  # Keep temporarily, remove after migration
│
├── api/                      # API routes (unchanged)
├── auth/                     # OAuth callback (unchanged)
├── layout.tsx                # Root layout
└── page.tsx                  # Landing page (unchanged)
```

## Layout Hierarchy

### Root Layout
```typescript
// apps/nextjs/src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}  {/* Route group layouts render here */}
      </body>
    </html>
  )
}
```

### App Layout
```typescript
// apps/nextjs/src/app/(app)/layout.tsx
export default function AppLayout({ children }) {
  // Common layout for /app/* routes
  return (
    <>
      <AppHeader />
      <main>{children}</main>
      <AppFooter />
    </>
  )
}
```

### Admin Layout
```typescript
// apps/nextjs/src/app/(admin)/layout.tsx
export default function AdminLayout({ children }) {
  // Admin-specific layout
  return (
    <>
      <AdminHeader />
      <main>{children}</main>
    </>
  )
}
```

## Auth Redirect Rules Summary

| Source URL | Destination | Status | Condition |
|------------|-------------|--------|-----------|
| `/app/*` | `/login?redirect={path}` | 302 | Not authenticated |
| `/admin/*` | `/login?redirect={path}` | 302 | Not authenticated |
| `/admin/*` | `/unauthorized` | 302 | Not admin user |

**Note**: Old URLs (`/onboarding`, `/inventory`, etc.) will return 404. All internal navigation updated to new `/app/*` URLs.

## Testing Checklist

### Route Access
- [ ] Landing page `/` accessible to all
- [ ] Login page `/login` accessible to all
- [ ] `/app/onboarding` requires authentication
- [ ] `/app/inventory` requires authentication
- [ ] `/admin` requires admin role
- [ ] `/unauthorized` accessible to all

### Old URLs (Should 404)
- [ ] `/onboarding` returns 404 (no redirect)
- [ ] `/inventory` returns 404
- [ ] `/recipes` returns 404
- [ ] `/suggestions` returns 404

### Authentication
- [ ] Unauthenticated user at `/app/*` → `/login`
- [ ] Unauthenticated user at `/admin` → `/login`
- [ ] Non-admin user at `/admin` → `/unauthorized`
- [ ] Admin user at `/admin` → renders page

### Design
- [ ] Admin page follows neobrutalism design
- [ ] Unauthorized page follows neobrutalism design
- [ ] Mobile responsive (no overflow, readable text)
- [ ] Touch targets ≥44px on mobile

## Dependencies

```typescript
// Next.js
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Components
import { Button } from '@/components/retroui/Button'
import { PageContainer } from '@/components/PageContainer'

// Utils (if needed for client-side auth checks)
import { createClient } from '@/utils/supabase/client'
```
