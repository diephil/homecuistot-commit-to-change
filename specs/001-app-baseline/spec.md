# Feature Specification: Application Baseline - Authentication & AI Infrastructure

**Feature Branch**: `001-app-baseline`
**Created**: 2026-01-18
**Status**: Implemented (Documentation)
**Input**: User description: "Analyze the current state of the art of the application and write the spec file that matches what has been built so far."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Authentication via Google OAuth (Priority: P1)

A user wants to access the Homecuistot meal planning application and needs to authenticate using their Google account. This is the entry point for all application functionality.

**Why this priority**: Authentication is the foundational requirement for accessing the application and establishing user identity. Without this, no personalized features can function.

**Independent Test**: Can be fully tested by attempting to sign in with a Google account, verifying session creation, accessing protected pages, and signing out. Delivers immediate value by securing the application and establishing user identity.

**Acceptance Scenarios**:

1. **Given** a user visits the application, **When** they navigate to the login page, **Then** they see a "Continue with Google" button
2. **Given** a user clicks "Continue with Google", **When** Google authentication completes successfully, **Then** they are redirected to the onboarding page with their email displayed
3. **Given** a user is authenticated, **When** they attempt to access the login page, **Then** they are automatically redirected to the onboarding page
4. **Given** an unauthenticated user attempts to access protected pages, **When** the page loads, **Then** they are redirected to the login page
5. **Given** an authenticated user clicks "Sign Out", **When** the sign-out process completes, **Then** their session is cleared and they are redirected to the login page

---

### User Story 2 - Post-Login Welcome Experience (Priority: P2)

After successful authentication, users are greeted with a welcome page that confirms their identity and provides basic account controls.

**Why this priority**: This provides immediate feedback that authentication succeeded and gives users a clear starting point for future feature access. It's the bridge between authentication and the core application features.

**Independent Test**: Can be tested by logging in and verifying the onboarding page displays the user's email address and provides a functional sign-out button.

**Acceptance Scenarios**:

1. **Given** a user successfully authenticates, **When** they are redirected to the onboarding page, **Then** they see a welcome message with their email address
2. **Given** a user is on the onboarding page, **When** they view the page, **Then** they can access a sign-out button
3. **Given** a user is on the onboarding page, **When** they click sign out, **Then** they are logged out and redirected to the login page

---

### User Story 3 - AI Service Observability (Priority: P3)

Development team needs visibility into AI service calls to monitor performance, debug issues, and optimize LLM usage for future meal planning features.

**Why this priority**: While not user-facing, this infrastructure enables reliable AI feature development. It provides the foundation for debugging and optimizing the upcoming recipe recommendation and meal planning features.

**Independent Test**: Can be tested by making an AI API call and verifying that telemetry data appears in the Opik dashboard at http://localhost:5173 with proper service name, tags, and metadata.

**Acceptance Scenarios**:

1. **Given** the application makes an AI API call, **When** the call executes, **Then** telemetry data is captured and sent to Opik
2. **Given** telemetry data is captured, **When** viewing the Opik dashboard, **Then** calls show service name "homecuistot-hackathon" with environment tags
3. **Given** a test AI endpoint is called, **When** the Gemini model responds, **Then** the response is returned and telemetry includes full trace data

---

### Edge Cases

- What happens when Google OAuth fails or user denies permission?
  - User is redirected to auth error page with clear messaging
- What happens when session expires while user is on protected page?
  - Middleware detects invalid session and redirects to login page
- What happens when Opik service is unavailable?
  - AI calls still function but telemetry is not captured (graceful degradation)
- What happens when user has no internet connection during auth?
  - Google OAuth flow will fail with browser error before reaching callback

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide Google OAuth as the authentication method
- **FR-002**: System MUST store user sessions securely using HTTP-only cookies
- **FR-003**: System MUST protect routes requiring authentication by redirecting unauthenticated users to login page
- **FR-004**: System MUST prevent authenticated users from accessing login page by redirecting to onboarding page
- **FR-005**: System MUST exchange OAuth authorization code for user session via secure callback endpoint
- **FR-006**: System MUST display user email address on post-login welcome page
- **FR-007**: System MUST provide sign-out functionality that clears user session and redirects to login
- **FR-008**: System MUST handle OAuth errors by displaying dedicated error page with retry option
- **FR-009**: System MUST integrate AI service (Gemini) with telemetry tracking for all LLM calls
- **FR-010**: System MUST capture service name, environment tags, and request metadata in telemetry data
- **FR-011**: System MUST provide test endpoint demonstrating AI text generation capability
- **FR-012**: System MUST use lightweight Gemini model (flash-lite tier) for efficient processing
- **FR-013**: System MUST provide local Opik platform via git submodule with Docker Compose scripts for LLM telemetry development
- **FR-014**: System MUST support local Supabase instance via CLI for database and authentication development
- **FR-015**: System MUST enable developers to iterate on features entirely in local environment without cloud dependencies
- **FR-016**: System MUST configure Google OAuth 2.0 client in Google Console with authorized JavaScript origins (http://localhost:3000, http://127.0.0.1:3000) and redirect URI (http://127.0.0.1:54321/auth/v1/callback) for local development
- **FR-017**: OAuth client MUST request OpenID scope, manually configured in Google Cloud Console

### Key Entities

- **User**: Represents an authenticated person with Google account. Key attributes include unique identifier, email address, and authentication session state. Users are stored in the authentication system's user table.
- **Session**: Represents an active user authentication state. Contains session token, expiration time, and association to specific user. Sessions enable stateful authentication across page requests.
- **AI Trace**: Represents a single AI service call with telemetry data. Includes timestamp, model used, prompt/response content, latency, and environment metadata. Used for monitoring and debugging AI features.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete authentication flow from login to onboarding page in under 10 seconds (assuming normal Google OAuth response time)
- **SC-002**: 100% of protected routes correctly redirect unauthenticated users to login page
- **SC-003**: 100% of AI service calls generate telemetry traces visible in Opik dashboard within 5 seconds
- **SC-004**: Sign-out flow completes successfully and returns user to login page within 2 seconds
- **SC-005**: System handles OAuth errors gracefully with clear error messaging to users (no cryptic technical errors)
- **SC-006**: Session state persists correctly across page navigations for authenticated users
- **SC-007**: Test AI endpoint returns valid response from Gemini model within 3 seconds

## Assumptions

- Google OAuth 2.0 client ID created in Google Console with local development URLs configured
  - Authorized JavaScript origins: http://localhost:3000, http://127.0.0.1:3000
  - Authorized redirect URI: http://127.0.0.1:54321/auth/v1/callback (Supabase local auth endpoint)
  - OpenID scope manually added in Google Cloud Console
- OAuth client credentials configured in Supabase local instance
- Users have existing Google accounts and are willing to use Google for authentication
- Local development environment supports Docker, Docker Compose, and Supabase CLI
- Developers can run Supabase locally via CLI (provides full auth + database stack)
- Developers can run Opik locally via git submodule Docker Compose scripts
- Local development enables complete feature iteration without cloud service dependencies
- Internet connection is available for OAuth flow and AI service calls
- Gemini API key is configured and has sufficient quota for test calls
- Future meal planning features will leverage the established AI infrastructure
- No custom user profile data is required at this baseline stage (only email from Google)

## Out of Scope

- Custom email/password authentication (only Google OAuth is supported)
- User profile customization or settings management
- Multi-factor authentication or advanced security features
- Social authentication providers other than Google (Facebook, Apple, etc.)
- Meal planning, recipe management, or inventory tracking features (future phases)
- User data beyond authentication (preferences, dietary restrictions, etc.)
- Mobile applications (this baseline is web-only)
- Offline functionality or progressive web app features

## Dependencies

- External Google OAuth service must be operational for authentication
- Supabase: Local instance via Supabase CLI for development (provides database, auth, Google OAuth configuration)
- Opik: Local instance via git submodule + Docker Compose for LLM telemetry capture (development mode)
- Google Gemini API must be accessible with valid API key
- Modern web browsers with JavaScript enabled and cookie support
- Docker and Docker Compose for running local Opik platform
- Supabase CLI for managing local Supabase instance
