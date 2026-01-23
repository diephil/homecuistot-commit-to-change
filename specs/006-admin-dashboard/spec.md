# Feature Specification: Route Restructuring and Admin Access

**Feature Branch**: `006-admin-dashboard`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "I want all pages to be served behind the '/app' route (except for the landing page). Prepare a dummy dashboard page behind '/admin'. Only me can have access to that dashboard."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Route Restructuring (Priority: P1)

As a user of the application, I need all main application pages organized under /app route (except landing page), providing clear separation between public and application content.

**Why this priority**: Foundation for URL structure. Must be completed before admin routes. Affects all existing pages and navigation.

**Independent Test**: Navigate to existing pages via new /app/* URLs. Landing page remains at root. Old URLs redirect to new structure. Delivers organized URL architecture.

**Acceptance Scenarios**:

1. **Given** I am on the landing page at "/", **When** I navigate to application features, **Then** URLs follow /app/* pattern (e.g., /app/onboarding, /app/meals)
2. **Given** I am on the landing page, **When** the page loads, **Then** it remains at "/" without /app prefix
3. **Given** I bookmark an /app/* URL, **When** I return to it later, **Then** the page loads correctly at the new URL
4. **Given** I navigate directly to an old URL (e.g., /onboarding), **When** the page loads, **Then** I see a 404 error

---

### User Story 2 - Admin Access Control (Priority: P2)

As the system administrator, I need to access an admin-only dashboard while preventing unauthorized users from accessing these admin functions.

**Why this priority**: Establishes security boundary for admin features. Depends on route structure from P1. Required before building admin functionality.

**Independent Test**: Admin user navigates to /admin and sees dashboard. Non-admin users see unauthorized message. Delivers secure admin access.

**Acceptance Scenarios**:

1. **Given** I am the authorized admin user and logged in, **When** I navigate to /admin, **Then** I see the admin dashboard placeholder page
2. **Given** I am a non-admin user, **When** I attempt to access /admin, **Then** I see a 404 page
3. **Given** I am not logged in, **When** I attempt to access /admin, **Then** I am redirected to login page

---

### User Story 3 - Admin Placeholder Page (Priority: P3)

As the admin user, I need a basic landing page at /admin that serves as entry point for future admin features.

**Why this priority**: Visual confirmation admin access works. Lower priority as core value is access control (P2), not UI polish.

**Independent Test**: Login as admin, navigate to /admin, verify placeholder page displays. Delivers admin entry point.

**Acceptance Scenarios**:

1. **Given** I am the admin user and on /admin, **When** the page loads, **Then** I see a placeholder page indicating this is the admin dashboard
2. **Given** I am on the admin dashboard, **When** I view the page, **Then** I see a message indicating features will be added in future
3. **Given** I am the admin user, **When** I view the dashboard, **Then** I see basic navigation or branding consistent with the application

---

### Edge Cases

- What happens when admin user logs out while on /admin page? → Redirect to login, prevent access until re-authenticated
- How does system handle direct navigation to /admin/* subpages by unauthorized users? → Same unauthorized message/redirect as /admin root
- What happens when user manually edits URL from /app/* to old URL pattern? → 404 error (old URLs not supported)
- How does system handle deep links or bookmarks to old URLs? → 404 error (users must update bookmarks)
- What happens when non-admin tries to guess admin routes? → All /admin/* routes protected with same access control

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST serve all existing application pages under /app/* route structure (except landing page)
- **FR-002**: Landing page MUST remain accessible at root "/" without /app prefix
- **FR-003**: System MUST update all internal navigation links to use /app/* URLs (old URLs will 404)
- **FR-004**: System MUST restrict /admin route access to authorized admin user only
- **FR-005**: System MUST display 404 page to non-admin users attempting /admin access
- **FR-006**: System MUST redirect unauthenticated users from /admin to login page
- **FR-007**: Admin dashboard MUST display placeholder landing page indicating admin area
- **FR-008**: System MUST identify admin users via comma-separated list of user IDs in environment variable
- **FR-009**: All /admin/* subpages MUST enforce same access control as /admin root

### Key Entities

- **Admin User**: Authorized system administrators (supports multiple users), has permissions to access /admin routes
- **Application Route**: URL paths under /app/* that contain main application functionality, separate from public landing page and admin areas

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing application pages function correctly under new /app/* route structure with zero broken links
- **SC-002**: Non-admin users see 404 page within 1 second when attempting /admin access
- **SC-003**: Admin user can access /admin dashboard in under 2 clicks from any application page
- **SC-004**: 100% of internal navigation links updated to /app/* URLs (no old URLs remain)
- **SC-005**: Landing page remains at root "/" and loads in under 2 seconds

## Assumptions

- Admin authentication uses existing Supabase Auth system with role/permission extension
- Multiple admin users supported via comma-separated list of user IDs
- Existing application pages are compatible with route prefix addition
- Landing page remains publicly accessible without authentication requirement
- No backward compatibility needed for old URLs (internal app only, no external links to preserve)
- All internal navigation will be updated to new /app/* URLs
- Admin dashboard is web-based, accessible via browser
- No mobile-specific admin interface required in MVP
