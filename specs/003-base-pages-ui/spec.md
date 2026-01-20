# Feature Specification: Base Pages UI Foundation

**Feature Branch**: `003-base-pages-ui`
**Created**: 2026-01-20
**Status**: Draft
**Input**: User description: "Read raw-description-pages.md and create a straightforward plan for the app's pages. Constraints: Mock data only - no interactions, no behavior. Focus purely on visual design/layout. Build foundational pages that can evolve, not throwaway prototypes. Keep it simple - no over-engineering. Goal: Define the baseline UI structure we'll iterate on, not a complete feature set we'll have to scrap later."

## Clarifications

### Session 2026-01-20

- Q: What should empty states display visually? → A: Simple text message with illustrative icon (e.g., "No recipes yet" + empty plate icon)
- Q: How many mock items should each list/collection contain? → A: Medium set (5-10 items per category)
- Q: How should long text (ingredient/recipe names) be handled visually? → A: Truncate with ellipsis (...) after single line
- Q: How should badge-style buttons wrap on narrow mobile screens? → A: Wrap to next line (maintain badge size, create multi-row layout)
- Q: What placeholder content should microphone input sections display? → A: Icon + instructional text (e.g., "Tap to speak" or "Click to add items")

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First Time Visitor Exploration (Priority: P1)

A new visitor arrives at the landing page, reads about the app's purpose, and decides whether to sign up or log in.

**Why this priority**: Landing page is the first impression and entry point - must exist before any other features.

**Independent Test**: Can be fully tested by navigating to root URL and verifying all visual sections are present with proper layout and readable content.

**Acceptance Scenarios**:

1. **Given** user visits root URL, **When** page loads, **Then** they see logo, title "Home Cuistot", and sign up/login CTAs at top
2. **Given** user scrolls down landing page, **When** viewing content, **Then** they see hero section with headline, origin/problem section, how-it-works section in order
3. **Given** user views landing page on mobile, **When** page renders, **Then** layout adapts responsively without horizontal scroll

---

### User Story 2 - Onboarding Journey Visualization (Priority: P2)

A newly authenticated user progresses through three onboarding steps on a single page to understand the app's setup flow.

**Why this priority**: Second step after auth - establishes baseline user data model before main app features.

**Independent Test**: Can be fully tested by navigating to /onboarding and clicking through step transitions, verifying visual layout and content at each step.

**Acceptance Scenarios**:

1. **Given** user is on /onboarding at step 1, **When** page loads, **Then** they see welcome message and single "Start Onboarding" CTA
2. **Given** user advances to step 2, **When** viewing page, **Then** they see three sections (dishes, fridge items, pantry items) with selectable badge-style buttons and continue/clear CTAs at bottom
3. **Given** user advances to step 3, **When** viewing page, **Then** they see summary of selected dishes and ingredients, microphone input CTA, and "Finish Onboarding" button

---

### User Story 3 - Main App Navigation Structure (Priority: P3)

An onboarded user navigates between the three main app pages to understand available functionality.

**Why this priority**: Core app structure - needed after onboarding but can be developed independently.

**Independent Test**: Can be fully tested by navigating to /suggestions, /inventory, and /recipes, verifying each page's layout and visual sections render properly.

**Acceptance Scenarios**:

1. **Given** user is on /suggestions page, **When** page loads, **Then** they see two sections (available recipes, almost-available recipes) plus navigation CTAs to inventory and recipes
2. **Given** user is on /inventory page, **When** viewing page, **Then** they see list of ingredients with quantity indicators and instructions for quantity editing plus microphone CTA
3. **Given** user is on /recipes page, **When** page loads, **Then** they see grid of recipe cards plus "Add a new recipe" card

---

### Edge Cases

- Empty states (no ingredients/recipes): Display simple text message with illustrative icon (e.g., "No recipes yet" with empty plate icon)
- Long ingredient or recipe names: Truncate with ellipsis (...) after single line to maintain layout integrity
- Badge-style buttons on narrow mobile screens: Wrap to next line maintaining badge size (multi-row layout)
- Microphone input placeholder: Display icon with instructional text (e.g., "Tap to speak" or "Click to add items")

## Requirements *(mandatory)*

### Functional Requirements

**Public Pages**:
- **FR-001**: System MUST display landing page at root URL (/) with logo, title, sign-up/login CTAs, hero section, origin/problem section, and how-it-works section
- **FR-002**: System MUST display login page at /login with Google and Discord OAuth CTAs
- **FR-003**: Landing and login pages MUST be accessible without authentication

**Onboarding Page (Protected)**:
- **FR-004**: System MUST display onboarding page at /onboarding with three visual steps using sliding/transition UI (single route, multiple states)
- **FR-005**: Step 1 MUST show welcome message, voice authorization note, and "Start Onboarding" CTA
- **FR-006**: Step 2 MUST show three sections: dishes selection, fridge items selection, pantry items selection, displayed as badge-style buttons, with continue/clear CTAs
- **FR-007**: Step 3 MUST show summary of selected dishes, fridge items (grouped as "Ingredients"), and pantry items (grouped as "Ingredients"), microphone input CTA, and "Finish Onboarding" button
- **FR-008**: All onboarding steps MUST use mock/placeholder data for selectable items (5-10 items per category: dishes, fridge items, pantry items)

**Main App Pages (Protected)**:
- **FR-009**: System MUST display suggestions page at /suggestions with two sections: available recipes (all ingredients present) and almost-available recipes (missing 1-2 ingredients), plus CTAs to inventory and recipes pages, and a "Mark as Cooked" CTA per recipe
- **FR-010**: System MUST display inventory page at /inventory with list of all ingredients showing quantity levels (0-3), instructions for editing quantities by tapping, and microphone input CTA
- **FR-011**: System MUST display recipes page at /recipes with grid of recipe cards plus "Add a new recipe" card with CTAs to edit, delete, or mark as cooked per recipe
- **FR-012**: All main app pages MUST use mock/placeholder data for recipes and ingredients (5-10 items per category)

**Visual/Layout Requirements**:
- **FR-013**: All badge-style buttons MUST be short, compact, and visually distinct
- **FR-014**: All pages MUST render responsively on mobile and desktop viewports
- **FR-015**: Onboarding step transitions MUST use sliding/carousel visual effect (purely visual, no actual routing)
- **FR-016**: Microphone input CTAs MUST include visual microphone icon with instructional text (e.g., "Tap to speak" or "Click to add items")
- **FR-017**: Recipe cards MUST display title, description placeholder, and ingredient list preview
- **FR-018**: Ingredient lists MUST show ingredient name and current quantity level (0-3)
- **FR-019**: Empty states MUST display simple text message with illustrative icon (e.g., "No recipes yet" with empty plate icon)
- **FR-020**: Long text (ingredient names, recipe titles) MUST truncate with ellipsis (...) after single line to maintain layout integrity
- **FR-021**: Badge-style buttons MUST wrap to next line on narrow screens while maintaining badge size (multi-row layout, no horizontal scroll)

### Key Entities *(include if feature involves data)*

- **Page Route**: Represents a navigable URL path with associated layout and visual content sections
- **Visual Section**: Represents a distinct content area within a page (hero, list, card grid, CTA group)
- **Mock Data Item**: Placeholder content displayed in lists, cards, or selectable items (dishes, ingredients, recipes)
- **Navigation Flow**: Represents the progression between pages (public → auth → onboarding → main app)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 defined page routes (/, /login, /onboarding, /suggestions, /inventory, /recipes) render without errors
- **SC-002**: Onboarding page displays all 3 steps with sliding transitions (visual step changes, no route changes)
- **SC-003**: Pages display correctly on viewport widths from 320px (mobile) to 1920px (desktop) without horizontal scroll
- **SC-004**: All required visual sections appear on each page/step in the specified order
- **SC-005**: Mock data displays in appropriate format (badges for selections, cards for recipes, lists for ingredients)
- **SC-006**: Navigation between pages works via CTAs (links render with correct hrefs)
- **SC-007**: Empty states render with text message and illustrative icon when mock data arrays are empty
- **SC-008**: Pages load and render initial view within 2 seconds on standard connection

## Assumptions

1. **Authentication state**: Mock authentication - pages marked "protected" render regardless of actual auth status for baseline UI development
2. **Voice input**: Microphone CTAs are visual-only placeholders with no actual voice capture functionality
3. **Data persistence**: No data is saved; page refreshes reset any mock state changes
4. **Routing**: Standard Next.js file-based routing used for page structure
5. **Onboarding steps**: Single /onboarding route with client-side step state (sliding transitions between steps 1-3, no route changes)
6. **Styling approach**: Tailwind CSS used for responsive layout and component styling (per project conventions)
7. **Component library**: shadcn/ui and RetroUI registry used for base components (per project setup)
8. **Mock data source**: Hardcoded arrays within page components (no API calls, database queries, or external data sources); 5-10 items per category (dishes, fridge items, pantry items, recipes, ingredients) to test layout variety and scrolling
9. **Interactivity**: No click handlers, form submissions, or state mutations - purely visual layout demonstration
10. **Ingredient quantity levels**: 0 = none, 1 = low, 2 = medium, 3 = full/maximum (for visual display only)
11. **Badge selection**: Pre-selected items shown visually highlighted but no actual selection state tracking

## Dependencies

- Next.js 16 routing system must be configured
- Tailwind CSS v4 must be available for styling
- shadcn/ui and RetroUI registry components must be accessible
- Protected routes should have placeholder auth wrapper (even if non-functional)

## Out of Scope

- User authentication implementation
- Voice input capture and processing
- Data persistence (database, local storage)
- State management (recipe/ingredient updates)
- Form validation
- API integration
- Real-time data updates
- User interaction handlers (clicks, form submissions)
- Accessibility enhancements beyond semantic HTML
- Animation and transitions
- Error handling and loading states
- Performance optimization beyond basic rendering
