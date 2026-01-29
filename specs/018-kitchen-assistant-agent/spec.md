# Feature Specification: Kitchen Assistant Agent

**Feature Branch**: `018-kitchen-assistant-agent`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "Implement AI kitchen assistant using Vercel AI SDK Single Agent with Tools (Design 1 from ai-agent-design.md)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conversational Recipe Creation (Priority: P1)

Users can create new recipes through natural conversation with the kitchen assistant. They describe what they want to cook, and the assistant extracts the recipe name, description, and ingredients, creating a new recipe in their cookbook.

**Why this priority**: Recipe creation is the core value proposition - users need to easily add recipes to their collection before any other kitchen management features become useful.

**Independent Test**: Can be fully tested by having a user say "I want to add a recipe for pasta carbonara with eggs, bacon, parmesan, and pasta" and verifying the recipe is created with the correct ingredients.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they say "Create a recipe for chicken stir fry with chicken, broccoli, soy sauce, and garlic", **Then** a new recipe is created with name "Chicken Stir Fry" and the 4 specified ingredients linked
2. **Given** a user is creating a recipe, **When** they provide a description like "a quick weeknight dinner", **Then** the recipe includes this description
3. **Given** a user mentions an ingredient not in the database, **When** the recipe is created, **Then** the system logs the unknown ingredient for future addition and informs the user

---

### User Story 2 - Inventory Management via Conversation (Priority: P1)

Users can update their ingredient inventory through natural conversation. They can add items after shopping, update quantities, and mark items as empty.

**Why this priority**: Inventory tracking is equally critical as recipe creation - knowing what ingredients are available enables the "what can I cook" feature.

**Independent Test**: Can be tested by user saying "I just bought tomatoes, onions, and garlic" and verifying all three appear in inventory at full stock.

**Acceptance Scenarios**:

1. **Given** a user has returned from shopping, **When** they say "I bought milk, eggs, and bread", **Then** all three items are added to inventory at full quantity level (3)
2. **Given** an ingredient exists in inventory, **When** user says "I'm almost out of butter", **Then** butter's quantity level is updated to 1 (low)
3. **Given** an ingredient exists in inventory, **When** user says "I used up all the rice", **Then** rice's quantity level is updated to 0 (empty)

---

### User Story 3 - Mark Recipe as Cooked (Priority: P2)

Users can tell the assistant they cooked a specific recipe. The system logs the cooking event and optionally deducts ingredients from inventory.

**Why this priority**: Cooking tracking completes the meal planning cycle and enables usage insights, but requires recipes and inventory to be populated first.

**Independent Test**: Can be tested by user saying "I just made the pasta carbonara" and verifying a cooking log entry is created and relevant ingredients are deducted.

**Acceptance Scenarios**:

1. **Given** user has a recipe "Pasta Carbonara" in their cookbook, **When** they say "I just made pasta carbonara", **Then** a cooking log entry is created with timestamp
2. **Given** user marks a recipe as cooked, **When** the recipe has linked ingredients in inventory, **Then** those ingredient quantities are reduced by one level
3. **Given** user wants to log cooking without deduction, **When** they say "I cooked the salad but don't update my inventory", **Then** only the cooking log is created

---

### User Story 4 - Find Cookable Recipes (Priority: P2)

Users can ask the assistant what they can cook with their current inventory. The system analyzes recipe-ingredient matches and returns suggestions.

**Why this priority**: This is the core "value unlock" of the app - reducing decision fatigue about what to eat. Requires populated recipes and inventory.

**Independent Test**: Can be tested by populating 5 recipes and partial inventory, then asking "What can I make for dinner?" and verifying relevant suggestions appear.

**Acceptance Scenarios**:

1. **Given** user has recipes and inventory, **When** they ask "What can I cook tonight?", **Then** system returns recipes sorted by ingredient match percentage
2. **Given** user asks for suggestions, **When** a recipe has 80%+ ingredient match, **Then** it appears in the suggestions with missing ingredients listed
3. **Given** user specifies a threshold, **When** they say "Show me recipes I can make with what I have", **Then** only 100% match recipes are shown

---

### User Story 5 - Recipe Updates and Deletion (Priority: P3)

Users can modify existing recipes or delete recipes they no longer want through conversation.

**Why this priority**: Recipe maintenance is necessary but less frequent than creation and cooking actions.

**Independent Test**: Can be tested by user saying "Add mushrooms to my pasta recipe" and verifying the ingredient is linked.

**Acceptance Scenarios**:

1. **Given** user has a recipe "Tomato Soup", **When** they say "Add basil to my tomato soup recipe", **Then** basil is added as an ingredient
2. **Given** user wants to delete a recipe, **When** they say "Delete my old salad recipe", **Then** the assistant asks for confirmation before deletion
3. **Given** deletion is confirmed, **When** user confirms "Yes, delete it", **Then** the recipe and its ingredient links are removed

---

### User Story 6 - Pantry Staple Management (Priority: P3)

Users can mark ingredients as pantry staples (items always assumed available like salt, pepper, oil) which affects cookability calculations.

**Why this priority**: Enhances accuracy of cookable recipe suggestions but requires understanding of the inventory system first.

**Independent Test**: Can be tested by marking "salt" as staple and verifying recipes requiring salt show higher match percentages.

**Acceptance Scenarios**:

1. **Given** user wants to mark a staple, **When** they say "Mark olive oil as a pantry staple", **Then** olive oil's pantry staple status is set to true
2. **Given** olive oil is a pantry staple, **When** calculating cookable recipes, **Then** olive oil is considered available regardless of quantity level
3. **Given** user changes their mind, **When** they say "Olive oil is no longer a staple", **Then** the staple status is removed

---

### Edge Cases

- What happens when user references a recipe that doesn't exist? The assistant should search existing recipes and suggest closest matches, or offer to create a new one.
- How does system handle ambiguous ingredient names (e.g., "tomatoes" vs "cherry tomatoes")? The system should use fuzzy matching against the ingredient database and ask for clarification if multiple close matches exist.
- What happens when voice transcription is unclear? The assistant should ask for clarification rather than making assumptions about the intent.
- How does the system handle multi-step requests (e.g., "Create a recipe and then mark it as cooked")? Multi-step requests are processed sequentially, allowing up to 10 tool calls per conversation turn.
- What happens when a database operation fails? The assistant should inform the user of the failure and suggest trying again, without exposing technical error details.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a conversational chat interface for kitchen management tasks
- **FR-002**: System MUST support recipe creation through natural language with name, description, and ingredients extraction
- **FR-003**: System MUST support recipe updates including adding/removing ingredients and modifying descriptions
- **FR-004**: System MUST support recipe deletion with confirmation before destructive actions
- **FR-005**: System MUST allow users to add ingredients to their inventory with quantity levels (0-3)
- **FR-006**: System MUST allow users to update inventory quantities through relative descriptions ("running low", "out of", "just bought")
- **FR-007**: System MUST support marking recipes as cooked with automatic cooking log creation
- **FR-008**: System MUST support optional inventory deduction when recipes are marked as cooked
- **FR-009**: System MUST calculate and return cookable recipes based on inventory match percentage
- **FR-010**: System MUST support toggling pantry staple status on inventory items
- **FR-011**: System MUST validate ingredient names against the existing ingredient database
- **FR-012**: System MUST handle unknown ingredients gracefully by logging them and informing the user
- **FR-013**: System MUST support multi-turn tool usage (up to 10 sequential tool calls per conversation)
- **FR-014**: System MUST authenticate users before allowing any kitchen management operations
- **FR-015**: System MUST log all AI interactions for observability and debugging

### Key Entities

- **Chat Message**: A user or assistant message in the conversation, containing text content and optional tool call results
- **Tool Call**: An action the assistant can take (createRecipe, updateInventory, markAsCooked, etc.) with parameters and results
- **Recipe**: A user's recipe with name, description, and linked ingredients (existing entity)
- **Inventory Item**: An ingredient in user's inventory with quantity level and staple status (existing entity)
- **Cooking Log**: A record of when a user cooked a recipe (existing entity)
- **Conversation Session**: A series of related messages between user and assistant within a single interaction

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a complete recipe (name + 3 ingredients) through conversation in under 30 seconds
- **SC-002**: Users can update inventory for 5 items in a single conversation turn in under 15 seconds
- **SC-003**: 90% of user intents are correctly understood and routed to the appropriate tool on first attempt
- **SC-004**: System responds to user messages within 3 seconds under normal load
- **SC-005**: Users can find cookable recipes matching their inventory in under 10 seconds
- **SC-006**: Destructive actions (delete recipe) always require explicit user confirmation before execution
- **SC-007**: All agent interactions are logged and traceable for debugging and improvement
- **SC-008**: Users report the assistant feels "conversational and helpful" in usability testing (qualitative)

## Assumptions

- Voice input is already transcribed to text before reaching the agent (existing voice input pipeline)
- The ingredient database is populated (5931 ingredients from migration 0003)
- User authentication is handled by existing Supabase Auth infrastructure
- Opik tracing infrastructure is already configured for observability
- The existing database schema (user_recipes, recipe_ingredients, user_inventory, cooking_log, ingredients) remains unchanged
- Users interact with the agent through a chat UI component (implementation detail for planning phase)
