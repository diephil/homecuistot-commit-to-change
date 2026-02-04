# Feature Specification: Admin Unrecognized Ingredient Promotion

**Feature Branch**: `023-admin-ingredient-promotion`
**Created**: 2026-02-04
**Status**: Draft
**Input**: User description: "Admin page to review unrecognized ingredients captured during recipe operations (via Opik LLM tracing) and promote them into the ingredients database table with a proper category."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fetch and Display Unrecognized Ingredients (Priority: P1)

As an admin, I want to fetch the next unprocessed span from Opik containing unrecognized ingredients so I can see which ingredient names need review.

**Why this priority**: Core data retrieval. Without fetching spans and displaying unrecognized items, no other workflow is possible.

**Independent Test**: Admin clicks "Search Next Span", system queries Opik for unprocessed spans, and displays the list of unrecognized ingredient names from the span's metadata. Delivers visibility into unrecognized items.

**Acceptance Scenarios**:

1. **Given** there are unprocessed spans tagged `unrecognized_items` (without `promotion_reviewed`), **When** the admin clicks "Search Next Span", **Then** the system fetches the next span and displays a list of unrecognized ingredient names
2. **Given** a span contains duplicate ingredient names, **When** the span is loaded, **Then** duplicates are removed and each ingredient appears only once
3. **Given** a span contains ingredients that already exist in the ingredients database, **When** the span is loaded, **Then** those ingredients are filtered out and only truly unrecognized items are displayed
4. **Given** no unprocessed spans remain, **When** the admin clicks "Search Next Span", **Then** the system displays a message indicating all spans have been reviewed

---

### User Story 2 - Promote Ingredients with Category (Priority: P2)

As an admin, I want to assign a category to each unrecognized ingredient and promote it to the ingredients database so it gets recognized in future recipe operations.

**Why this priority**: Core value delivery — turning unrecognized items into recognized ingredients. Depends on P1 for data display.

**Independent Test**: Admin selects a category for an ingredient and clicks promote. The ingredient appears in the ingredients table with the chosen category. Delivers ingredient enrichment.

**Acceptance Scenarios**:

1. **Given** an unrecognized ingredient is displayed, **When** the admin selects a category from the dropdown and clicks "Save/Promote", **Then** the ingredient is inserted into the ingredients database with the selected category
2. **Given** the admin promotes all items in a span, **When** the promote action completes, **Then** the span is tagged `promotion_reviewed` so it won't appear again
3. **Given** the admin promotes some items and skips others, **When** the promote action completes, **Then** only selected items are inserted and the span is still tagged `promotion_reviewed`
4. **Given** the admin tries to promote an ingredient that was added to the database by another process since the span was loaded, **When** the promote action runs, **Then** the system handles the conflict gracefully (skip duplicate, inform admin)

---

### User Story 3 - Skip/Dismiss Non-Ingredients (Priority: P3)

As an admin, I want to dismiss items that are not real ingredients (e.g., "car", "msg") so they don't clutter the review and the span is still marked as processed.

**Why this priority**: Prevents junk data from entering the ingredients table. Lower priority because the system still works without it (admin can just not promote them), but improves workflow quality.

**Independent Test**: Admin dismisses an item, it disappears from the review list. After all items are handled (promoted or dismissed), span is marked reviewed. Delivers data quality control.

**Acceptance Scenarios**:

1. **Given** an unrecognized item is displayed, **When** the admin clicks "Skip/Dismiss", **Then** the item is removed from the current review list without being added to the database
2. **Given** all items in a span are dismissed (none promoted), **When** the last item is dismissed, **Then** the span is still tagged `promotion_reviewed`

---

### User Story 4 - Continuous Processing Flow (Priority: P4)

As an admin, I want the system to automatically load the next unprocessed span after I finish reviewing the current one, so I can process multiple spans efficiently in one session.

**Why this priority**: Productivity improvement. Core review works without auto-advance (admin can manually click "Search Next Span"), but auto-loading streamlines the workflow.

**Independent Test**: Admin finishes reviewing a span, system automatically fetches and displays the next one. Delivers efficient batch processing.

**Acceptance Scenarios**:

1. **Given** the admin finishes reviewing a span (all items promoted or dismissed), **When** the review is complete, **Then** the system automatically fetches and displays the next unprocessed span
2. **Given** the admin finishes the last remaining span, **When** the review is complete, **Then** the system displays a "No more spans to review" message

---

### Edge Cases

- What happens when the Opik service is unavailable? → Display error message, allow retry
- What happens when a span's metadata is malformed (missing `unrecognized` array)? → Skip the span, tag it as reviewed, fetch next
- What happens when all items in a span already exist in the database after deduplication? → Show empty state for that span, auto-tag as reviewed, fetch next
- What happens when the admin session expires mid-review? → Existing admin auth handles redirect to login; unfinished span remains untagged for next session
- What happens when two admins review simultaneously? → Span tagging is idempotent; duplicate ingredient inserts handled gracefully

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch unprocessed Opik spans tagged `unrecognized_items` that are NOT tagged `promotion_reviewed`
- **FR-002**: System MUST extract ingredient names from span metadata field `metadata.unrecognized` (string array)
- **FR-003**: System MUST deduplicate ingredient names within a span (case-insensitive)
- **FR-004**: System MUST check each ingredient name against the existing ingredients database using case-insensitive matching and only display items not already present
- **FR-005**: System MUST present a category dropdown with all 30 ingredient categories for each unrecognized item, defaulting to `non_classified` (admin can override)
- **FR-006**: System MUST insert promoted ingredients into the ingredients database table with the admin-selected category, storing names in lowercase
- **FR-007**: System MUST tag processed spans with `promotion_reviewed` via Opik API after all items are handled
- **FR-008**: System MUST allow admins to dismiss/skip items without promoting them to the database
- **FR-009**: System MUST automatically load the next unprocessed span after the current span is fully reviewed
- **FR-010**: System MUST display a completion message when no unprocessed spans remain
- **FR-011**: System MUST handle duplicate ingredient conflicts gracefully when promoting (skip and inform admin)
- **FR-012**: System MUST be accessible only to authorized admin users (using existing admin layout authentication)

### Key Entities

- **Opik Span**: An external tracing record containing metadata about unrecognized ingredients encountered during recipe operations. Key attributes: span ID, trace ID, tags, metadata (totalUnrecognized, unrecognized items array)
- **Ingredient**: A food item in the database with a unique lowercase name and one of 30 predefined categories. Promoted items become ingredients. All name comparisons and storage use case-insensitive matching (stored lowercase)
- **Ingredient Category**: One of 30 predefined classification types (meat, dairy, vegetables, fruit, etc.) assigned to each ingredient

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can review and process an unrecognized ingredient span in under 60 seconds per span
- **SC-002**: 100% of promoted ingredients appear in the ingredients database with correct category
- **SC-003**: Processed spans never reappear in the admin review queue
- **SC-004**: Admin can process 20+ spans in a single session without page refresh or navigation
- **SC-005**: Zero junk entries (non-food items) enter the ingredients database when admin uses dismiss functionality

## Clarifications

### Session 2026-02-04

- Q: How should ingredient name matching work (case sensitivity)? → A: Case-insensitive matching; store names in lowercase
- Q: Should promoting ingredients also update `resolvedAt` in `unrecognized_items` table? → A: Deferred — address in a future feature; keep the two systems independent for now
- Q: Should category dropdown have a default value? → A: Default to `non_classified`; admin can override

## Assumptions

- Existing admin layout at `(admin)/admin/layout.tsx` provides sufficient authentication and access control
- Opik API is accessible from the application server at the configured URL
- Span search API supports filtering by tag presence and absence
- The 30 ingredient categories are stable and do not change frequently
- Spans are processed one at a time (no batch multi-span processing needed for MVP)
- The `promotion_reviewed` tag is sufficient to track processing status (no separate database tracking needed)
- Dismissed items do not need to be tracked separately (they are implicitly handled by the span being marked reviewed)
- Promoting ingredients does NOT update the `unrecognized_items` DB table; the two systems remain independent (deferred to future feature)
- The Opik project name is available via environment configuration
