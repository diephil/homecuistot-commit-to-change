# Feature Specification: Demo Data Reset

**Feature Branch**: `017-demo-data-reset`
**Created**: 2026-01-28
**Status**: Draft
**Input**: User description: "Allow user to reset all data and start with demo data to discover app capabilities. Start demo button on /app page opens confirmation modal, wipes data, inserts predefined demo inventory and recipes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Demo Mode (Priority: P1)

User wants to explore the app's full capabilities without manually adding ingredients and recipes. They click "Start Demo" button, confirm the action, and receive a pre-populated account with demo data.

**Why this priority**: Core feature value - enables new users to immediately see what the app can do with realistic data.

**Independent Test**: Can be tested by clicking the Start Demo button and verifying demo inventory and recipes appear.

**Acceptance Scenarios**:

1. **Given** user is on /app page, **When** they click "Start Demo" button, **Then** a confirmation modal appears warning that all existing data will be replaced.
2. **Given** confirmation modal is open, **When** user clicks "Confirm", **Then** all user data is deleted and demo data is inserted.
3. **Given** demo data insertion completes, **When** user views /app page, **Then** they see "Ready To Cook" and "Almost Available" recipes based on demo inventory.
4. **Given** demo data insertion completes, **When** user navigates to /app/inventory, **Then** they see pre-populated Available Ingredients and Pantry Staples.
5. **Given** demo data insertion completes, **When** user navigates to /app/recipes, **Then** they see 6 pre-populated recipes.

---

### User Story 2 - Cancel Demo Reset (Priority: P2)

User accidentally clicks "Start Demo" but realizes they don't want to lose their data. They can cancel the operation from the modal.

**Why this priority**: Prevents accidental data loss.

**Independent Test**: Click Start Demo, then Cancel, verify no data changes.

**Acceptance Scenarios**:

1. **Given** confirmation modal is open, **When** user clicks "Cancel" or dismisses modal, **Then** modal closes and no data changes occur.
2. **Given** user has existing inventory data, **When** they open and cancel the modal, **Then** their inventory remains unchanged.

---

### Edge Cases

- What happens if user has no existing data? → Demo data still inserts normally.
- What happens if demo data insertion fails mid-way? → Transaction rollback ensures all-or-nothing behavior.
- What happens if user clicks Start Demo while already having demo data? → Previous demo data is wiped and fresh demo data inserted (idempotent operation).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display "Start Demo" button on /app page accessible at any time.
- **FR-002**: System MUST show confirmation modal when Start Demo button clicked with clear warning about data deletion.
- **FR-003**: Modal MUST contain "Confirm" and "Cancel" actions.
- **FR-004**: On confirmation, system MUST delete all user data (using existing resetUserData logic): cooking_log, recipe_ingredients, user_recipes, user_inventory, unrecognized_items.
- **FR-005**: After reset, system MUST insert demo inventory with 21 ingredients (9 available + 12 pantry staples).
- **FR-006**: After reset, system MUST insert 6 demo recipes with their ingredient associations.
- **FR-007**: All data operations MUST be atomic (transaction-wrapped).
- **FR-008**: System MUST revalidate cached paths (/app, /app/recipes, /app/inventory) after demo data insertion.
- **FR-009**: System MUST provide visual feedback (loading state) during the reset/insert operation.

### Demo Data Specification

#### Demo Inventory - Available Ingredients (isPantryStaple: false)

| Ingredient Name | Quantity Level | Notes  |
|-----------------|----------------|--------|
| bread           | 3              | High   |
| butter          | 3              | High   |
| egg             | 3              | High   |
| eggs            | 3              | High   |
| garlic          | 1              | Low    |
| milk            | 3              | High   |
| onions          | 2              | Medium |
| peanut butter   | 3              | High   |
| spaghetti       | 2              | Medium |

#### Demo Inventory - Pantry Staples (isPantryStaple: true)

| Ingredient Name | Quantity Level |
|-----------------|----------------|
| baking powder   | 3              |
| beans           | 3              |
| black pepper    | 3              |
| flour           | 3              |
| honey           | 3              |
| noodles         | 3              |
| olive oil       | 3              |
| pasta           | 3              |
| rice            | 3              |
| salt            | 3              |
| soy sauce       | 3              |
| sugar           | 3              |

#### Demo Recipes

| Recipe Name            | Description                                                                  | Ingredients (type)                                                                                      |
|------------------------|------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| Scrambled Eggs         | Simple and fluffy eggs cooked in a pan, perfect for breakfast.               | egg (anchor), milk (anchor), butter (anchor), salt (optional), black pepper (optional)                  |
| Pasta Carbonara        | Classic Italian pasta dish with creamy egg sauce, bacon, and parmesan.       | pasta (anchor), egg (anchor), bacon (anchor), parmesan (anchor), salt (optional), black pepper (optional) |
| Egg Fried Rice         | Delicious and savory fried rice with fluffy egg, vegetables, and soy sauce.  | rice (anchor), egg (anchor), soy sauce (anchor), vegetable (anchor), salt (optional)                    |
| Mushroom Omelette      | Fluffy omelette filled with savory and earthy sauteed mushroom.              | egg (anchor), mushroom (anchor), butter (optional), salt (optional), black pepper (optional)            |
| Spaghetti Aglio e Olio | Simple yet flavorful spaghetti with garlic, olive oil, chili flakes.         | spaghetti (anchor), garlic (anchor), olive oil (anchor), salt (optional), black pepper (optional)       |
| Caesar Salad           | Classic salad with romaine lettuce, croutons, parmesan, and Caesar dressing. | romaine lettuce (anchor), crouton (anchor), parmesan (anchor), salt (optional), black pepper (optional) |

### Key Entities

- **User Inventory**: Links user to ingredients with quantity level (0-3) and pantry staple flag.
- **User Recipes**: User-owned recipes with name and description.
- **Recipe Ingredients**: Links recipes to ingredients with ingredient type (anchor/optional/assumed).
- **Ingredients**: Master ingredient table (5931 entries) - demo data references by ingredient name lookup.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Demo data insertion completes in under 3 seconds.
- **SC-002**: After demo insertion, /app page shows at least 2 "Ready To Cook" recipes (Scrambled Eggs, Spaghetti Aglio e Olio).
- **SC-003**: After demo insertion, /app page shows at least 3 "Almost Available" recipes.
- **SC-004**: User can start demo mode and explore all app sections (inventory, recipes, cook tracking) within 1 minute of clicking Start Demo.
- **SC-005**: Modal interaction (open, cancel, confirm) responds in under 200ms.
- **SC-006**: 100% of demo data is correctly inserted when confirmed (all 21 inventory items, all 6 recipes with their ingredient links).

## Assumptions

- Ingredients table already contains entries matching demo ingredient names (egg, milk, butter, etc.).
- Ingredient name lookup is case-insensitive or demo data uses exact names from ingredients table.
- User is authenticated when accessing /app page.
- Existing resetUserData action pattern will be extended rather than duplicated.
