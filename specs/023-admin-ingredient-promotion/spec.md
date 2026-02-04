# Feature Specification: Admin Unrecognized Ingredient Promotion

**Feature Branch**: `023-admin-ingredient-promotion`
**Created**: 2026-02-04
**Status**: Draft
**Input**: User description: "Admin page to review unrecognized ingredients captured during recipe operations (via Opik LLM tracing) and promote them into the ingredients database table with a proper category."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Welcome Page (Priority: P1)

As an admin, I want to see a welcome page at `/admin` listing available admin features so I can navigate to the tool I need.

**Why this priority**: Entry point for all admin functionality. Replaces the existing placeholder page and provides navigation context. Must exist before feature-specific pages.

**Independent Test**: Admin navigates to `/admin`, sees a welcome page listing "Review unrecognized items to enrich the ingredient database" as an available feature with a link to `/admin/unrecognized`. Delivers admin orientation.

**Acceptance Scenarios**:

1. **Given** I am an authorized admin, **When** I navigate to `/admin`, **Then** I see a welcome page listing available admin features
2. **Given** I am on the admin welcome page, **When** I view the feature list, **Then** I see "Review unrecognized items to enrich the ingredient database" as a feature with a link to `/admin/unrecognized`
3. **Given** I am on the admin welcome page, **When** I click the unrecognized items feature, **Then** I am navigated to `/admin/unrecognized`

---

### User Story 2 - Admin Header Navigation (Priority: P1)

As an admin, I want a header with navigation items so I can move between admin sections and back to the main app.

**Why this priority**: Shared navigation infrastructure. Co-priority with P1 since the header is needed for all admin pages. Includes "Go To App" CTA for navigating to `/app` and "Unrecognized Items" tab for `/admin/unrecognized`.

**Independent Test**: Admin sees header with "Unrecognized Items" nav link and "Go To App" CTA on any admin page. Clicking each navigates correctly. Delivers admin navigation.

**Acceptance Scenarios**:

1. **Given** I am on any admin page, **When** I view the header, **Then** I see an "Unrecognized Items" navigation link
2. **Given** I am on any admin page, **When** I view the header, **Then** I see a "Go To App" CTA that links to `/app`
3. **Given** I am on the admin welcome page, **When** I click "Unrecognized Items" in the header, **Then** I am navigated to `/admin/unrecognized`
4. **Given** I am on any admin page, **When** I click "Go To App", **Then** I am navigated to `/app`
5. **Given** I am on `/admin/unrecognized`, **When** I view the header, **Then** the "Unrecognized Items" nav item is visually highlighted as active

---

### User Story 3 - Load and Display Unrecognized Ingredients (Priority: P2)

As an admin, I want to click a CTA on the `/admin/unrecognized` page to load the most recent unprocessed span from Opik and see the unrecognized ingredient names that need review.

**Why this priority**: Core data retrieval for the promotion workflow. The page starts with no data loaded — admin explicitly triggers the first span fetch via a CTA button.

**Independent Test**: Admin navigates to `/admin/unrecognized`, sees a CTA to load spans. Clicks it, system fetches the most recent unprocessed span and displays the unrecognized ingredient names. Delivers visibility into unrecognized items.

**Acceptance Scenarios**:

1. **Given** I am on `/admin/unrecognized` and no span is loaded, **When** the page renders, **Then** I see a CTA button to load the first span (no auto-loading)
2. **Given** there are unprocessed spans tagged `unrecognized_items` (without `promotion_reviewed`), **When** I click the load CTA, **Then** the system fetches the most recent span and displays a list of unrecognized ingredient names
3. **Given** a span contains duplicate ingredient names, **When** the span is loaded, **Then** duplicates are removed and each ingredient appears only once
4. **Given** a span contains ingredients that already exist in the ingredients database, **When** the span is loaded, **Then** those ingredients are displayed as read-only with an "Already in database" indicator (no category dropdown, no dismiss button)
5. **Given** no unprocessed spans remain, **When** I click the load CTA, **Then** the system displays a message indicating all spans have been reviewed

---

### User Story 4 - Promote Ingredients with Category (Priority: P3)

As an admin, I want to assign a category to each unrecognized ingredient and promote it to the ingredients database so it gets recognized in future recipe operations.

**Why this priority**: Core value delivery — turning unrecognized items into recognized ingredients. Depends on P2 for data display.

**Independent Test**: Admin selects a category for an ingredient and clicks promote. The ingredient appears in the ingredients table with the chosen category. Delivers ingredient enrichment.

**Acceptance Scenarios**:

1. **Given** an unrecognized ingredient is displayed, **When** I select a category from the dropdown and click "Save/Promote", **Then** the ingredient is inserted into the ingredients database with the selected category
2. **Given** I promote all items in a span, **When** the promote action completes, **Then** the span is tagged `promotion_reviewed` so it won't appear again
3. **Given** I promote some items and skip others, **When** the promote action completes, **Then** only selected items are inserted and the span is still tagged `promotion_reviewed`
4. **Given** I try to promote an ingredient that was added to the database by another process since the span was loaded, **When** the promote action runs, **Then** the system handles the conflict gracefully (skip duplicate, inform admin)

---

### User Story 5 - Skip/Dismiss Non-Ingredients (Priority: P4)

As an admin, I want to dismiss items that are not real ingredients (e.g., "car", "msg") so they don't clutter the review and the span is still marked as processed.

**Why this priority**: Prevents junk data from entering the ingredients table. Lower priority because the system still works without it (admin can just not promote them), but improves workflow quality.

**Independent Test**: Admin dismisses an item, it disappears from the review list. After all items are handled (promoted or dismissed), span is marked reviewed. Delivers data quality control.

**Acceptance Scenarios**:

1. **Given** an unrecognized item is displayed, **When** I click "Skip/Dismiss", **Then** the item is visually dimmed (not removed) and its category dropdown is hidden, indicating it won't be promoted
2. **Given** a dismissed item is displayed dimmed, **When** I click "Undo" on it, **Then** the item is restored to active state with its category dropdown visible again
3. **Given** all items in a span are dismissed (none promoted), **When** I click "Mark as Reviewed", **Then** the span is tagged `promotion_reviewed` without any DB inserts

---

### User Story 6 - Load Next Span (Priority: P5)

As an admin, after finishing review of a span, I want to click a CTA to load the next unprocessed span so I can continue processing sequentially.

**Why this priority**: Enables sequential processing across multiple spans. No auto-loading — admin explicitly triggers each next span fetch.

**Independent Test**: Admin finishes reviewing a span, clicks "Load Next Span" CTA, system fetches and displays the next unprocessed span. Delivers sequential batch processing.

**Acceptance Scenarios**:

1. **Given** I finished reviewing a span (all items promoted or dismissed), **When** the review is complete, **Then** a "Load Next Span" CTA appears
2. **Given** I click "Load Next Span", **When** there are remaining unprocessed spans, **Then** the system fetches the next most recent span and displays its unrecognized items
3. **Given** I click "Load Next Span", **When** no unprocessed spans remain, **Then** the system displays a "No more spans to review" message

---

### Edge Cases

- What happens when the Opik service is unavailable? → Display error message on the CTA area, allow retry
- What happens when a span's metadata is malformed (missing `unrecognized` array)? → Skip the span, tag it as reviewed, fetch next
- What happens when all items in a span already exist in the database after deduplication? → Show all items as read-only with "Already in database" indicator. Admin must explicitly click "Mark as Reviewed" to tag the span. No silent auto-tagging.
- What happens when the admin session expires mid-review? → Existing admin auth handles redirect to login; unfinished span remains untagged for next session
- What happens when two admins review simultaneously? → Span tagging is idempotent; duplicate ingredient inserts handled gracefully
- What happens when admin navigates away from `/admin/unrecognized` mid-review and comes back? → Page resets to initial state (no span loaded), admin clicks CTA to load again

## Requirements *(mandatory)*

### Functional Requirements

**Admin Welcome & Navigation**:

- **FR-001**: System MUST replace the existing `/admin` placeholder page with a welcome page listing available admin features
- **FR-002**: The welcome page MUST list "Review unrecognized items to enrich the ingredient database" as a feature linking to `/admin/unrecognized`
- **FR-003**: Admin header MUST include an "Unrecognized Items" navigation link to `/admin/unrecognized`
- **FR-004**: Admin header MUST include a "Go To App" CTA linking to `/app`
- **FR-005**: The active navigation item MUST be visually highlighted in the header

**Unrecognized Items Page (`/admin/unrecognized`)**:

- **FR-006**: The page MUST initially display a CTA to load the first span (no auto-loading on page load)
- **FR-007**: System MUST fetch the most recent unprocessed Opik span tagged `unrecognized_items` that is NOT tagged `promotion_reviewed`
- **FR-008**: System MUST extract ingredient names from span metadata field `metadata.unrecognized` (string array)
- **FR-009**: System MUST deduplicate ingredient names within a span (case-insensitive)
- **FR-010**: System MUST check each ingredient name against the existing ingredients database using case-insensitive matching and annotate each item with its DB status (`existsInDb: boolean`)
- **FR-010a**: Items already in the database MUST be displayed as read-only with an "Already in database" indicator — no category dropdown, no dismiss button
- **FR-010b**: System MUST NOT silently auto-review spans. Admin must always see the span contents and explicitly trigger review tagging.
- **FR-011**: System MUST present a category dropdown with all 30 ingredient categories for each new (not-in-DB) unrecognized item, defaulting to `non_classified` (admin can override)
- **FR-012**: System MUST insert promoted ingredients into the ingredients database table with the admin-selected category, storing names in lowercase
- **FR-013**: System MUST tag processed spans with `promotion_reviewed` via Opik API after all items are handled
- **FR-014**: System MUST allow admins to dismiss/skip new items without promoting them to the database. Dismissed items MUST remain visible but dimmed (not removed), with an "Undo" option to restore them.
- **FR-014a**: The "Promote" action MUST only send non-dismissed new items to the backend. Dismissed items are excluded from promotion.
- **FR-014b**: When zero promotable items remain (all dismissed or all existing), the system MUST show a "Mark as Reviewed" CTA to explicitly tag the span.
- **FR-015**: After a span is fully reviewed, system MUST display a "Load Next Span" CTA (no auto-loading)
- **FR-016**: System MUST display a completion message when no unprocessed spans remain
- **FR-017**: System MUST handle duplicate ingredient conflicts gracefully when promoting (skip and inform admin)
- **FR-018**: System MUST be accessible only to authorized admin users (using existing admin layout authentication)

### Design & Component Requirements

- **FR-019**: All admin pages MUST follow the Vibrant Neobrutalism design system (thick black borders, bold shadows, vibrant gradients, uppercase headings, font-black weight) per project constitution Principle VII
- **FR-020**: Reusable UI components (e.g., `AdminNavLink`, `ItemReviewRow`, `CategorySelect`) MUST be created as shared components in `components/admin/` before being referenced in page files. Components are designed for reuse across future admin features.

### Key Entities

- **Opik Span**: An external tracing record containing metadata about unrecognized ingredients encountered during recipe operations. Key attributes: span ID, trace ID, tags, metadata (totalUnrecognized, unrecognized items array)
- **Ingredient**: A food item in the database with a unique lowercase name and one of 30 predefined categories. Promoted items become ingredients. All name comparisons and storage use case-insensitive matching (stored lowercase)
- **Ingredient Category**: One of 30 predefined classification types (meat, dairy, vegetables, fruit, etc.) assigned to each ingredient

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can navigate from `/admin` welcome page to `/admin/unrecognized` in 1 click
- **SC-002**: Admin can navigate back to `/app` from any admin page in 1 click via header CTA
- **SC-003**: Admin can review and process an unrecognized ingredient span in under 60 seconds per span
- **SC-004**: 100% of promoted ingredients appear in the ingredients database with correct category
- **SC-005**: Processed spans never reappear in the admin review queue
- **SC-006**: Admin can process 20+ spans in a single session without page refresh or navigation away from `/admin/unrecognized`
- **SC-007**: Zero junk entries (non-food items) enter the ingredients database when admin uses dismiss functionality

## Clarifications

### Session 2026-02-04

- Q: How should ingredient name matching work (case sensitivity)? → A: Case-insensitive matching; store names in lowercase
- Q: Should promoting ingredients also update `resolvedAt` in `unrecognized_items` table? → A: Deferred — address in a future feature; keep the two systems independent for now
- Q: Should category dropdown have a default value? → A: Default to `non_classified`; admin can override
- Q: Should spans auto-load? → A: No auto-loading; admin clicks CTA to load first span and each subsequent span
- Q: Where does the promotion feature live? → A: Dedicated page at `/admin/unrecognized`, accessible via header nav tab
- Q: What happens to the existing `/admin` placeholder? → A: Replaced with welcome page listing available admin features

### Session 2026-02-04 (Phase 9 — post-manual-testing)

- Q: Should spans where all items already exist in DB be silently auto-reviewed? → A: No. Admin must always see span contents. Existing items shown read-only with "Already in database" indicator. Admin explicitly clicks "Mark as Reviewed".
- Q: Should dismissed items disappear from the list? → A: No. Dismissed items stay visible but dimmed (reduced opacity, category dropdown hidden). "Undo" button to restore.
- Q: What are the 3 item visual states? → A: (1) New/active: category dropdown + dismiss "X", full opacity. (2) New/dismissed: dimmed, no dropdown, "Undo" button. (3) Existing in DB: read-only, "Already in database" badge, no controls.
- Q: What does "Promote" send? → A: Only non-dismissed new items. Dismissed and existing items excluded.
- Q: When does "Mark as Reviewed" appear? → A: When zero promotable items remain (all new items dismissed, or all items already exist in DB).

## Assumptions

- Existing admin layout at `(admin)/admin/layout.tsx` provides sufficient authentication and access control
- Admin header will be updated in the layout to include navigation items and "Go To App" CTA
- Opik API is accessible from the application server at the configured URL
- Span search API supports filtering by tag presence and absence
- The 30 ingredient categories are stable and do not change frequently
- Spans are processed one at a time (no batch multi-span processing needed for MVP)
- The `promotion_reviewed` tag is sufficient to track processing status (no separate database tracking needed)
- Dismissed items do not need to be tracked separately (they are implicitly handled by the span being marked reviewed)
- Promoting ingredients does NOT update the `unrecognized_items` DB table; the two systems remain independent (deferred to future feature)
- The Opik project name is available via environment configuration
- No auto-loading of spans; all span fetches are user-initiated via CTA clicks
