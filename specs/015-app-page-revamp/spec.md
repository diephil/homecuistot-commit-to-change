# Feature Specification: App Page Revamp

**Feature Branch**: `015-app-page-revamp`
**Created**: 2026-01-28
**Status**: Draft
**Input**: User description: "Revamp main app page with navigation header, recipe availability sections (available/almost-available), mark-as-cooked modal with ingredient quantity adjustment, and cooking log integration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Available Recipes (Priority: P1)

As a user on the main app page, I want to see recipes I can cook right now based on my inventory, so I can quickly decide what to make without checking ingredients.

**Why this priority**: Core value proposition - showing users what they can cook immediately is the primary purpose of the main page.

**Independent Test**: Can be fully tested by creating a user with recipes and matching inventory, then verifying only recipes with all anchor ingredients in stock appear in the "Available" section.

**Acceptance Scenarios**:

1. **Given** I have recipes where all anchor ingredients are in my inventory (quantity > 0 or pantry staple), **When** I visit /app, **Then** those recipes appear in the "Available Recipes" section at the top
2. **Given** I have a recipe with anchor ingredients but one has quantity = 0 and is not a pantry staple, **When** I visit /app, **Then** that recipe does NOT appear in available section
3. **Given** I have multiple available recipes, **When** I view the available section, **Then** I see each recipe with title, description, ingredients list, and "Mark as Cooked" button

---

### User Story 2 - View Almost-Available Recipes (Priority: P2)

As a user, I want to see recipes that are almost ready (missing 1-2 anchor ingredients), so I can plan a quick shopping trip or substitute ingredients.

**Why this priority**: Secondary value - helps users understand what's close to being cookable and drives shopping decisions.

**Independent Test**: Can be tested by creating recipes missing 1-2 anchor ingredients and verifying they appear in the "Almost Available" section with missing ingredients clearly listed.

**Acceptance Scenarios**:

1. **Given** I have a recipe missing exactly 1 anchor ingredient, **When** I visit /app, **Then** that recipe appears in "Almost Available" section with the missing ingredient displayed
2. **Given** I have a recipe missing exactly 2 anchor ingredients, **When** I visit /app, **Then** that recipe appears in "Almost Available" section with both missing ingredients displayed
3. **Given** I have a recipe missing 3 or more anchor ingredients, **When** I visit /app, **Then** that recipe does NOT appear on the main page at all
4. **Given** a recipe card in "Almost Available" section, **When** I view it, **Then** I see the missing ingredients prominently displayed (no "Mark as Cooked" button)

---

### User Story 3 - Mark Recipe as Cooked (Priority: P1)

As a user with an available recipe, I want to mark it as cooked and adjust my inventory accordingly, so my ingredient quantities stay accurate without manual entry.

**Why this priority**: Tied with P1 - completing the cook cycle is essential for the app's value loop of tracking inventory changes.

**Independent Test**: Can be tested by clicking "Mark as Cooked" on an available recipe, confirming the modal shows ingredient diffs, adjusting quantities, saving, and verifying both cooking_log entry and inventory updates.

**Acceptance Scenarios**:

1. **Given** I click "Mark as Cooked" on an available recipe, **When** the modal opens, **Then** I see a confirmation prompt asking if I cooked the recipe
2. **Given** the modal is open, **When** I view the ingredients, **Then** I see each anchor ingredient with a proposed quantity reduction (current → suggested new value)
3. **Given** the modal shows ingredient diffs, **When** I tap an ingredient, **Then** I can adjust the final quantity using the same interaction as the inventory update modal
4. **Given** I have adjusted quantities and click Save, **When** the save completes, **Then** the recipe is added to cooking_log and my inventory quantities are updated per my adjustments
5. **Given** I click Cancel on the modal, **When** the modal closes, **Then** no changes are made to cooking_log or inventory

---

### User Story 4 - Redirect Non-Onboarded Users (Priority: P1)

As a new user with no recipes and no inventory, I should be redirected to onboarding so I can set up my account before using the app.

**Why this priority**: Essential gate - ensures users have baseline data before seeing an empty main page.

**Independent Test**: Can be tested by logging in as a user with zero recipes and zero inventory items, then verifying automatic redirect to /onboarding.

**Acceptance Scenarios**:

1. **Given** I am logged in but have no recipes AND no inventory items, **When** I navigate to /app, **Then** I am redirected to /onboarding
2. **Given** I have at least one recipe (but zero inventory), **When** I navigate to /app, **Then** I remain on /app (no redirect)
3. **Given** I have at least one inventory item (but zero recipes), **When** I navigate to /app, **Then** I remain on /app (no redirect)

---

### User Story 5 - Navigate Between App Sections (Priority: P2)

As a user on any /app page, I want persistent navigation to quickly access the main page, recipes, or inventory without hunting for links.

**Why this priority**: Quality of life improvement - reduces friction in navigating the app.

**Independent Test**: Can be tested by visiting each /app route and verifying navigation items are visible and functional, with the active page highlighted.

**Acceptance Scenarios**:

1. **Given** I am on any /app route, **When** I view the header, **Then** I see navigation items for: Main (/app), Recipes (/app/recipes), Inventory (/app/inventory)
2. **Given** I am on /app, **When** I view navigation, **Then** the "Main" item is visually highlighted as active
3. **Given** I am on /app/recipes, **When** I view navigation, **Then** the "Recipes" item is visually highlighted as active
4. **Given** I am on /app/inventory, **When** I view navigation, **Then** the "Inventory" item is visually highlighted as active
5. **Given** I click a navigation item, **When** the page loads, **Then** I am taken to the corresponding route

---

### Edge Cases

- What happens when a recipe has only optional ingredients (no anchors)? → Treated as available (no required ingredients to check)
- What happens when inventory has quantity=0 for an anchor but it's a pantry staple? → Still considered available (pantry staples assumed always accessible)
- What happens when user marks a recipe cooked but the recipe gets deleted mid-flow? → Modal should handle gracefully with error message
- What happens if ingredient quantity would go negative after cooking? → Quantity floors at 0, no negative values allowed
- What happens if there are no available or almost-available recipes? → Show empty state message in each section

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST redirect users with zero recipes AND zero inventory items to /onboarding when accessing any /app route
- **FR-002**: System MUST display a persistent navigation header on all /app routes with links to Main, Recipes, and Inventory
- **FR-003**: System MUST visually distinguish the active navigation item based on current route
- **FR-004**: System MUST display "Available Recipes" section showing recipes where ALL anchor ingredients have quantity > 0 OR are pantry staples
- **FR-005**: System MUST display "Almost Available Recipes" section showing recipes missing exactly 1 or 2 anchor ingredients
- **FR-006**: System MUST NOT display recipes missing 3+ anchor ingredients on the main page
- **FR-007**: Available recipe cards MUST display a "Mark as Cooked" CTA button
- **FR-008**: Almost-available recipe cards MUST display the list of missing anchor ingredients (no "Mark as Cooked" button)
- **FR-009**: "Mark as Cooked" modal MUST show all anchor ingredients with their proposed quantity changes (current → new)
- **FR-010**: Users MUST be able to tap each ingredient in the modal to adjust final quantity (matching inventory update modal interaction)
- **FR-011**: System MUST create a cooking_log entry when user confirms the "cooked" action
- **FR-012**: System MUST update user inventory quantities according to user's final adjustments when saving

### Key Entities

- **Available Recipe**: A user recipe where all anchor ingredients are present in inventory (quantity > 0 or pantry staple)
- **Almost-Available Recipe**: A user recipe missing 1-2 anchor ingredients (ingredients with quantity = 0 and not pantry staples)
- **Cooking Log Entry**: Record linking user, recipe (optional FK), recipe name (snapshot), and timestamp
- **Ingredient Quantity Diff**: Visual representation showing current quantity → proposed new quantity for each ingredient used in cooking

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view available recipes and mark one as cooked in under 30 seconds from page load
- **SC-002**: Users can identify missing ingredients for almost-available recipes at a glance without additional clicks
- **SC-003**: Navigation between main app sections requires at most 1 click from any /app page
- **SC-004**: Users without recipes/inventory are redirected to onboarding within 1 second of accessing /app
- **SC-005**: 100% of "Mark as Cooked" flows result in both a cooking_log entry AND accurate inventory updates
- **SC-006**: Active navigation state correctly reflects current route 100% of the time

## Assumptions

- Pantry staples are always considered "in stock" regardless of quantity level (existing behavior)
- Optional ingredients are not considered when determining recipe availability (only anchor ingredients matter)
- Quantity reduction for cooked recipes defaults to decrementing by 1 level (user can adjust)
- The navigation header replaces or augments the existing simple header (not a completely new layout)
- Cooking log already has migration/schema in place (confirmed: `cooking_log` table exists)
