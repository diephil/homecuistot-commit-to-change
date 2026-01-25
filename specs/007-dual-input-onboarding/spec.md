# Feature Specification: Dual Input Onboarding with Text Alternative & Enhanced UX

**Feature Branch**: `007-dual-input-onboarding`
**Created**: 2026-01-25
**Status**: Draft
**Input**: User description: "Dual Input Onboarding with Text Alternative & Enhanced UX - Enhanced onboarding flow with text input alternative to voice, improved user guidance through hints, and refined authentication/navigation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Text Input Fallback for Voice Denial (Priority: P1)

Users who deny microphone permissions or prefer not to use voice input can still complete the onboarding process using text input as an alternative.

**Why this priority**: Critical for accessibility and privacy-conscious users. Without this, users who deny microphone access cannot complete onboarding, creating a blocker to platform adoption.

**Independent Test**: Can be fully tested by denying microphone permissions in browser and verifying text input becomes available, processes user input correctly, and completes onboarding successfully.

**Acceptance Scenarios**:

1. **Given** user denies microphone permission, **When** onboarding page loads, **Then** text input option is automatically displayed
2. **Given** user is on voice input mode, **When** user clicks "Prefer to type instead?", **Then** interface switches to text input mode
3. **Given** user enters text like "eggs, butter, pasta", **When** user submits, **Then** system processes input and adds items to their profile
4. **Given** user has entered valid text, **When** processing completes within 15 seconds, **Then** user sees updated ingredients list
5. **Given** text input fails to process, **When** error occurs, **Then** user sees appropriate error message (timeout, parse error, or network error)

---

### User Story 2 - Guidance Through Usage Hints (Priority: P2)

Users uncertain about how to use voice or text input receive clear guidance through example sentences and visual hints showing natural speech patterns.

**Why this priority**: Improves first-time user experience and reduces friction during onboarding. While not a blocker, it significantly impacts user confidence and completion rates.

**Independent Test**: Can be tested by observing new users' interaction with the onboarding flow and measuring time-to-first-input and successful completion rates before/after hints are added.

**Acceptance Scenarios**:

1. **Given** user reaches voice input step, **When** page loads, **Then** user sees InfoCard with example sentences
2. **Given** user views example sentences, **When** examples are displayed, **Then** they show natural speech patterns like "I have eggs, butter, and pasta"
3. **Given** user makes first voice input error, **When** processing fails, **Then** user sees "Couldn't understand. Try again."
4. **Given** user makes second consecutive error, **When** processing fails again, **Then** user sees "Still having trouble. Would you like to type instead?"
5. **Given** user makes third consecutive error, **When** processing fails third time, **Then** user sees "Please use text input below" and text input becomes prominent

---

### User Story 3 - Flexible Input Mode Switching (Priority: P2)

Users can toggle between voice and text input modes based on their preference, context, or environmental constraints.

**Why this priority**: Enhances user autonomy and accommodates different contexts (noisy environment, privacy concerns, accessibility needs). Adds flexibility without blocking core functionality.

**Independent Test**: Can be tested by starting with voice input, switching to text, completing actions in text mode, switching back to voice, and verifying all modes work correctly.

**Acceptance Scenarios**:

1. **Given** user is in voice mode, **When** user clicks "Prefer to type instead?", **Then** interface switches to text input with full functionality
2. **Given** user is in text mode (not due to permission denial), **When** user clicks "Use voice instead?", **Then** interface switches back to voice input
3. **Given** user switches modes, **When** mode changes, **Then** current onboarding data (dishes, ingredients) persists across modes
4. **Given** microphone permission was denied, **When** user is in text mode, **Then** toggle to voice option is not displayed

---

### User Story 4 - Authentication & Navigation Improvements (Priority: P3)

Users can easily logout from the application and experience improved authentication flows with clear visual design.

**Why this priority**: Important for usability and security but not critical for core onboarding functionality. Can be implemented independently after core features work.

**Independent Test**: Can be tested by logging in, accessing protected routes, clicking logout, and verifying session termination and redirect to login page.

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** user clicks logout button, **Then** session is terminated and user is redirected to login page
2. **Given** user clicks logout, **When** logout is processing, **Then** button shows loading state
3. **Given** unauthenticated user, **When** user tries to access protected routes, **Then** user is redirected to login page
4. **Given** user on login page, **When** page loads, **Then** user sees neobrutalism-styled interface with clear CTAs

---

### User Story 5 - Improved Homepage Value Proposition (Priority: P3)

New visitors understand the application's value proposition through clear messaging, improved responsive design, and better visual hierarchy.

**Why this priority**: Impacts conversion and user acquisition but not core functionality. Can be refined iteratively based on user feedback.

**Independent Test**: Can be tested by showing homepage to new users and measuring comprehension of value proposition, time to CTA click, and mobile vs desktop experience quality.

**Acceptance Scenarios**:

1. **Given** visitor lands on homepage, **When** page loads, **Then** visitor sees clear value proposition within first viewport
2. **Given** visitor uses mobile device, **When** homepage loads, **Then** all content is responsive and readable
3. **Given** visitor scrolls through homepage, **When** viewing sections, **Then** visual hierarchy guides attention to key points
4. **Given** visitor decides to sign up, **When** clicking CTA buttons, **Then** user is directed to appropriate pages (login/app)

---

### Edge Cases

- What happens when text processing API takes longer than 15 seconds?
  - System returns 408 timeout error with user-friendly message "Connection issue. Try again."

- What happens when user enters empty or whitespace-only text?
  - Submit button remains disabled; no API call is made

- What happens when Gemini NLP returns unparseable response?
  - System catches Zod validation error, returns 500 with "Invalid response format from NLP service", user sees "Couldn't understand. Try again."

- What happens when user rapidly switches between voice and text modes?
  - Mode state updates correctly; no race conditions; onboarding data persists

- What happens when network connection drops during text processing?
  - System catches network error, returns 503, user sees "Network error. Please check your connection."

- What happens when user enters text with special characters or emojis?
  - Gemini processes input; special characters handled gracefully; emojis ignored or processed as text context

- What happens when user denies microphone permission after initially granting it?
  - System detects permission change; automatically switches to text input mode; shows appropriate message

- What happens when user completes onboarding with no dishes and no ingredients?
  - "Complete Setup" button remains disabled; user sees message "Add at least one dish or ingredient to continue"

## Requirements *(mandatory)*

### Functional Requirements

#### Text Input Processing

- **FR-001**: System MUST provide text input API endpoint at `/api/onboarding/process-text` that accepts text and current context
- **FR-002**: System MUST process text input using Gemini-based NLP to extract dishes and ingredients
- **FR-003**: System MUST enforce 15-second timeout for text processing requests
- **FR-004**: System MUST validate API responses against OnboardingUpdateSchema (Zod)
- **FR-005**: System MUST return structured add/remove operations matching voice input format
- **FR-006**: System MUST handle errors with specific HTTP status codes: 408 (timeout), 500 (parse error), 503 (network error)

#### Input Mode Management

- **FR-007**: System MUST allow users to toggle between voice and text input modes
- **FR-008**: System MUST automatically switch to text mode when microphone permission is denied
- **FR-009**: System MUST preserve onboarding data (dishes, ingredients) across mode switches
- **FR-010**: System MUST hide voice-to-text toggle when microphone permission is denied
- **FR-011**: System MUST track current input mode state (voice or text)

#### User Guidance & Hints

- **FR-012**: System MUST display InfoCard component with example sentences on voice input screen
- **FR-013**: System MUST show progressive error messages based on failure count: 1st = "Couldn't understand", 2nd = "Would you like to type?", 3rd = "Please use text input"
- **FR-014**: System MUST track consecutive voice/text processing failures
- **FR-015**: System MUST reset failure count on successful processing
- **FR-016**: System MUST provide visual examples of natural speech patterns

#### InfoCard Component

- **FR-017**: System MUST provide InfoCard component with 7 color variants (purple, blue, green, yellow, pink, orange, cyan)
- **FR-018**: InfoCard MUST accept props: variant, emoji, heading, children
- **FR-019**: InfoCard MUST follow neobrutalism design: 3-4px borders, shadow offsets, bold typography
- **FR-020**: InfoCard MUST be responsive with mobile and desktop breakpoints

#### Authentication & Navigation

- **FR-021**: System MUST provide LogoutButton component with loading state
- **FR-022**: LogoutButton MUST terminate user session and redirect to login page
- **FR-023**: System MUST enforce route protection via proxy.ts for protected routes
- **FR-024**: System MUST redirect unauthenticated users to login page
- **FR-025**: System MUST display logout button in app and admin layouts

#### Route Structure

- **FR-026**: System MUST serve main app page at `/app` route (not `/app/suggestions`)
- **FR-027**: System MUST redirect users from onboarding to `/app` on completion
- **FR-028**: System MUST maintain protected route organization under `(protected)` group

#### Design System

- **FR-029**: All components MUST use neobrutalism styling: 3-6px borders, shadow offsets, bold fonts
- **FR-030**: All components MUST meet minimum touch target size of 44x44px for accessibility
- **FR-031**: All components MUST include proper ARIA labels for screen readers
- **FR-032**: System MUST support keyboard navigation for all interactive elements
- **FR-033**: Color palette MUST use pink, orange, yellow, cyan for primary UI elements

#### Homepage

- **FR-034**: Homepage MUST display clear value proposition in first viewport
- **FR-035**: Homepage MUST be fully responsive for mobile and desktop devices
- **FR-036**: Homepage MUST provide CTAs linking to login and app routes
- **FR-037**: Homepage MUST use visual hierarchy to guide user attention

### Key Entities

- **OnboardingUpdate**: Structured response containing add/remove operations for dishes and ingredients; used by both voice and text processing endpoints
- **InputMode**: State value indicating current input method (voice or text); persists during onboarding session
- **FailureCount**: Counter tracking consecutive processing failures; resets on success; triggers progressive hint messages
- **InfoCard**: Reusable UI component for displaying hints, tips, and guidance; configurable color variants and content
- **UserSession**: Authentication state managed by Supabase; validated by proxy.ts for route protection

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users who deny microphone permissions can complete onboarding using text input with 100% feature parity to voice input
- **SC-002**: Text processing requests complete within 15 seconds or timeout with clear error message
- **SC-003**: Users can switch between voice and text modes without losing any onboarding data
- **SC-004**: First-time users who view example sentences in InfoCard show 30% higher successful completion rate compared to users without hints
- **SC-005**: Users experiencing voice input failures receive progressive hints that guide them to text alternative
- **SC-006**: All interactive elements meet 44x44px minimum touch target size for accessibility compliance
- **SC-007**: Users can logout from any protected page within 2 clicks
- **SC-008**: New homepage visitors understand primary value proposition within 10 seconds of landing
- **SC-009**: Mobile users experience full functionality with no loss of features compared to desktop
- **SC-010**: 95% of text input submissions are processed successfully (excluding intentional invalid inputs)

## Assumptions

- Users have modern browsers supporting Web Speech API (for voice) and standard form inputs (for text)
- Gemini NLP service has sufficient capacity to handle text processing within 15-second timeout
- Users understand basic cooking terminology (dishes, ingredients)
- Microphone permission denial is detectable by browser APIs
- InfoCard component examples are sufficient to guide users without additional onboarding tutorial
- Neobrutalism design language is acceptable to target user demographic
- Supabase authentication is already configured and functional
- Route protection logic is enforced consistently across all protected routes
