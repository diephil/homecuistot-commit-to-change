# Feature Specification: LLM Rate Limiting

**Feature Branch**: `031-llm-rate-limit`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Rate Limiting — LLM Usage Per Day: Limit free users to 50 LLM calls/day to control costs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rate-Limited User Receives Clear Feedback (Priority: P1)

A user who has exhausted their daily LLM quota attempts to use any AI-powered feature (recipe generation, inventory analysis, voice processing, etc.) and is immediately informed that they have reached their daily limit.

**Why this priority**: Core value proposition — without enforcement, there is no cost control. Users must understand why their request was blocked and when they can try again.

**Independent Test**: Can be fully tested by making 50+ LLM requests in a single day and verifying the 51st request returns a clear rate-limit error. Delivers cost protection and user transparency.

**Acceptance Scenarios**:

1. **Given** a user has made 50 LLM calls today, **When** they attempt a 51st LLM call, **Then** the system blocks the request and returns a rate-limit error indicating the daily limit has been reached.
2. **Given** a user was rate-limited yesterday, **When** a new UTC day begins, **Then** their counter resets and they can make LLM calls again.
3. **Given** a user has made 30 LLM calls today, **When** they attempt another LLM call, **Then** the request proceeds normally with no rate-limit interference.

---

### User Story 2 - Admin Users Bypass Rate Limits (Priority: P2)

Administrators can use all AI features without any daily usage restrictions, ensuring uninterrupted access for testing, support, and platform management.

**Why this priority**: Admins need unrestricted access for platform operations. Without this, admins would be blocked from debugging or demonstrating features.

**Independent Test**: Can be fully tested by configuring an admin user and verifying they can exceed the daily limit without being blocked.

**Acceptance Scenarios**:

1. **Given** an admin user has made 100+ LLM calls today, **When** they make another LLM call, **Then** the request proceeds normally without rate-limit checks.
2. **Given** a non-admin user has the same call count, **When** they make the same request, **Then** they are rate-limited as expected.

---

### User Story 3 - Usage Tracking for Analytics (Priority: P3)

Each successful LLM call is logged with the user, endpoint, and timestamp, enabling future analytics on usage patterns and cost attribution.

**Why this priority**: Provides operational visibility. Not user-facing but essential for monitoring costs and understanding usage patterns over time.

**Independent Test**: Can be tested by making several LLM calls and querying the usage log to verify each call was recorded with correct metadata.

**Acceptance Scenarios**:

1. **Given** a user makes a successful LLM call, **When** the response is returned, **Then** a usage record is created with the user identity, endpoint path, and timestamp.
2. **Given** an LLM call fails (upstream error), **When** the failure occurs, **Then** no usage record is created (failed calls do not count against the limit).

---

### Edge Cases

- What happens when two requests arrive simultaneously and both are at exactly the limit (request 50 and 51 in parallel)? One or both may succeed due to race conditions on INSERT vs COUNT; this is acceptable — off-by-one tolerance is fine for cost control.
- What happens if the daily limit configuration is changed mid-day? The new limit applies immediately to all subsequent checks.
- What happens if the usage log storage is unavailable (database outage)? The LLM call should fail rather than bypassing the limit (fail closed).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST track each successful LLM call per user with a timestamp and endpoint identifier.
- **FR-002**: System MUST block LLM requests when a user's daily call count meets or exceeds the configured limit, returning a rate-limit error.
- **FR-003**: System MUST reset the daily count at UTC midnight without requiring scheduled jobs (query-based reset using timestamps).
- **FR-004**: System MUST exempt administrator users from rate-limit enforcement.
- **FR-005**: System MUST allow the daily limit to be configured via an environment variable, defaulting to 50 if not set.
- **FR-006**: System MUST only count successful LLM calls (calls that fail before producing a response do not increment the counter).
- **FR-007**: System MUST enforce rate limits across all LLM-powered endpoints consistently (8 endpoints identified).
- **FR-008**: System MUST fail closed — if the usage check itself fails, the LLM request is denied rather than allowed.

### Key Entities

- **Usage Log Entry**: Represents a single successful LLM call. Attributes: unique identifier, user reference, endpoint path, creation timestamp. One user has many usage log entries. Entries are append-only (never updated or soft-deleted in normal operation).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users exceeding the daily limit receive a clear rate-limit error within 1 second of their request, with no LLM processing initiated.
- **SC-002**: Admin users can make unlimited LLM calls per day without any rate-limit interference.
- **SC-003**: Daily usage counters reset automatically at UTC midnight without manual intervention or scheduled jobs.
- **SC-004**: The daily limit is configurable without code changes (environment variable).
- **SC-005**: All 8 LLM-powered endpoints enforce rate limiting consistently.
- **SC-006**: Failed LLM calls do not count against a user's daily limit.

## Assumptions

- The daily limit of 50 is a reasonable starting default and can be adjusted via environment variable without redeployment (only restart required).
- UTC midnight reset is acceptable for all users regardless of timezone — no per-user timezone customization needed.
- Minor race conditions (off-by-one at the boundary) are acceptable; exact enforcement is not required.
- No user-facing "remaining calls" counter or warning system is needed at this time.
- Old usage log rows can accumulate indefinitely; periodic cleanup is optional and out of scope for this feature.
- All routes needing rate limiting already use or can be upgraded to use authenticated database-connected handlers.
