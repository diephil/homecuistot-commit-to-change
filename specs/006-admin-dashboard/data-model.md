# Data Model: Route Restructuring and Admin Access

**Feature**: 006-admin-dashboard
**Date**: 2026-01-23
**Status**: Phase 1

## Overview

This feature adds minimal data requirements, primarily configuration-based. Admin role determined by environment variable match against Supabase Auth user ID. Future extensibility allows migration to database-backed roles.

## Entities

### Admin User (Configuration-Based)

**Description**: System administrators identified by Supabase Auth user IDs

**Storage**: Environment variable (`ADMIN_USER_IDS`)

**Format**: Comma-separated list of user IDs (e.g., `"uuid1,uuid2,uuid3"`)

**Attributes**:
- `user_id` (string, UUID): Supabase Auth user ID of admin(s)
- Derived from: Existing Supabase Auth users table
- Validation: User ID must be present in comma-separated list

**Access Pattern**:
```typescript
// Middleware check
const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
const isAdmin = user?.id && adminIds.includes(user.id)
```

**Future Extension** (Post-MVP):
```sql
-- Optional: Database table for multi-admin support
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_roles_role ON user_roles(role);
```

### Route Configuration (Code-Based)

**Description**: Mapping of old URLs to new /app/* structure

**Storage**: Middleware logic (no database)

**Attributes**:
- `old_path` (string): Original route path (e.g., "/onboarding")
- `new_path` (string): New route path (e.g., "/app/onboarding")
- `requires_auth` (boolean): Whether route requires authentication
- `admin_only` (boolean): Whether route is admin-restricted

**Implementation**:
```typescript
const ROUTE_MAPPINGS = {
  '/onboarding': { newPath: '/app/onboarding', requiresAuth: true },
  '/inventory': { newPath: '/app/inventory', requiresAuth: true },
  '/recipes': { newPath: '/app/recipes', requiresAuth: true },
  '/suggestions': { newPath: '/app/suggestions', requiresAuth: true },
} as const
```

## Data Flow

### Admin Authentication Flow

```
1. User navigates to /admin
2. Middleware executes:
   a. Create Supabase client from request cookies
   b. Call supabase.auth.getUser()
   c. Split ADMIN_USER_IDS env var by comma and check if user.id is in list
   d. If match: allow access
   e. If no match: rewrite to non-existent route (shows 404, URL stays same)
   f. If no user: redirect to /login
3. Admin page renders
```

### Route Migration Flow

```
1. User navigates to old URL (e.g., /onboarding)
2. Middleware executes:
   a. Check if path matches old route pattern
   b. Lookup new path from ROUTE_MAPPINGS
   c. Return 308 redirect to new path
3. Browser navigates to /app/onboarding
4. Standard protected route handling applies
```

## Validation Rules

### Admin Access Validation

**Rule**: User must be authenticated AND user ID must be in comma-separated `ADMIN_USER_IDS` list

**Enforcement**: Middleware (runs before route handlers)

**Error States**:
- Unauthenticated: Redirect to `/login?redirect=/admin`
- Authenticated but not admin: Rewrite to 404 page (URL unchanged)
- Invalid/missing ADMIN_USER_IDS env var: Log error, show 404 page

### Route Access Validation

**Rule**: Protected routes require authenticated user

**Enforcement**: Existing `(protected)` route group pattern + new middleware checks

**Error States**:
- Unauthenticated on /app/*: Redirect to `/login?redirect={original_path}`
- Auth session expired: Middleware refreshes session, continues or redirects

## State Transitions

### User Role States

```
Anonymous → Authenticated User → Admin (if ID matches)
    ↓              ↓                   ↓
  Public       /app/* routes      /admin routes
```

**Transitions**:
- `Anonymous → Authenticated`: Login via Supabase OAuth
- `Authenticated → Anonymous`: Logout via Supabase Auth
- `Authenticated → Admin`: No transition needed, determined by ID comparison

### Route Migration States

```
Old URL → Middleware Check → 308 Redirect → New URL
                ↓
          (if new URL)
                ↓
         Direct Access → Route Handler
```

## Schema Extensions (Future)

### Phase 2: Multi-Admin Support

```typescript
// Drizzle schema
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  role: text('role').notNull().$type<'admin' | 'user'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

// Type derivation (Constitution Principle V)
export type UserRole = typeof userRoles.$inferSelect
export type NewUserRole = typeof userRoles.$inferInsert
```

### Phase 3: Audit Trail

```typescript
export const adminAuditLog = pgTable('admin_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

## Performance Considerations

### Middleware Efficiency

- **Admin check**: Split comma-separated string and array includes check (O(n) where n=number of admin IDs, typically <10)
- **Route mapping**: Object lookup (O(1))
- **Supabase call**: Cached session, ~10-20ms
- **Total overhead**: <50ms per protected route request

### Scaling

- **Multiple admins (env var)**: No database queries for auth, supports comma-separated list
- **Multi-admin** (future): Add index on user_roles.role for fast admin checks
- **Audit logs** (future): Async background writes, no request blocking

## Dependencies

### Existing Schema

Relies on Supabase Auth tables:
- `auth.users`: User authentication
- Session cookies: Maintained by `@supabase/ssr`

### New Schema

None for MVP. Future extensions require:
- `user_roles` table (Phase 2)
- `admin_audit_log` table (Phase 3)

## Migration Path

### MVP → Multi-Admin

1. Create `user_roles` table via Drizzle migration
2. Seed table with current admin user ID
3. Update middleware to query `user_roles` instead of env var
4. Add admin management UI for role assignment

### Single Tenant → Multi-Tenant

1. Add `tenant_id` to user_roles
2. Scope admin access by tenant
3. Update middleware to check tenant context
