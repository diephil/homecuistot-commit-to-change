# Feature Specification: Recipe Management

**Feature Branch**: `013-recipe-management`
**Created**: 2026-01-27
**Status**: Draft
**Input**: User description: "Recipe list view on /app with neo-brutalism design, recipe management page with CRUD operations, voice input for recipe creation via LLM extraction, ingredient optional marking, database validation for ingredients with unrecognized items handling"

## Clarifications

### Session 2026-01-27

- Q: Where should recipe edit interface appear? → A: Inline/modal on `/recipes` page (card expands or modal opens)
- Q: Can user have multiple recipes with same title? → A: Yes, duplicate titles allowed (no uniqueness constraint)
- Q: What actions for unrecognized ingredients? → A: Same as onboarding: remove, rename/correct, or keep as custom text
- Q: How should recipe deletion be confirmed? → A: Inline confirmation (button transforms to "Confirm delete?" with confirm/cancel)
- Q: What should user see while LLM processes voice input? → A: Skeleton placeholders in form fields + "Extracting recipe..." text

### Session 2026-01-27 - UI/UX Refinements

- **Input Mode Toggle**: Record button appears alone with "Do you prefer typing?" link below. Clicking switches to text input mode (replaces button in-place). Text mode shows input + Extract button with "Switch to voice recording" link. Users can freely toggle between modes.
- **Non-Editable Title/Description**: Display-only fields (not editable inputs). Use gray background (bg-gray-100), thick left border (4px) instead of full border, no shadow, italic placeholders ("No title yet").
- **Neo-Brutalism Design**: 4px modal border, 2px section borders, bold uppercase labels, shadow effects, thick button borders, proper spacing.
- **Mark Optional Toggle**: Badge itself is clickable (no separate link). Hover lift effect, smooth transitions.
- **Ingredient Deletion**: Cross (×) button on right. Subtle gray that turns red on hover. Quick removal from list.
- **Delete Recipe Button**: Subtle red text link (not large button). Light gray divider. Cleaner confirmation with simple question + smaller "Yes, Delete" button.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Recipe Summary on App Dashboard (Priority: P1)

As a user landing on `/app`, I see my **top 10 most recent** saved recipes displaying title and description only. The items are **not clickable** and the design makes this obvious (no hover states, no cursor pointer, no underlines). To manage recipes, I navigate to the Recipes page via a visible link.

**Why this priority**: Core navigation entry point; users must see their recipes to engage with the feature.

**Independent Test**: Can be tested by navigating to `/app`, verifying top 10 recipes display with title + description, confirming items are not interactive.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I navigate to `/app`, **Then** I see at most 10 recipes showing title and description only
2. **Given** I have more than 10 recipes, **When** I view `/app`, **Then** only the 10 most recent appear
3. **Given** I am on `/app`, **When** I try to click a recipe item, **Then** nothing happens (no interaction)
4. **Given** I am on `/app`, **When** I have no recipes, **Then** I see an empty state message
5. **Given** I am on `/app`, **When** I click the navigation to recipes, **Then** I am taken to the recipe management page

---

### User Story 2 - Manage Recipes on Recipe List Page (Priority: P1)

As a user on `/recipes`, the **single place** to manage all my recipes, I see all my recipes displayed with title and description. Each recipe card is **clearly clickable** (hover states, cursor pointer, visual affordances). I can click any recipe to edit it or use "Add recipe" to create new.

**Why this priority**: Core CRUD functionality; users need to manage their recipes.

**Independent Test**: Can be tested by navigating to `/recipes`, verifying clickable appearance (hover effects), clicking a recipe to edit, clicking "Add recipe" to create new.

**Acceptance Scenarios**:

1. **Given** I am on `/recipes`, **When** I view the page, **Then** I see all my recipes with title and description
2. **Given** I am on `/recipes`, **When** I hover over a recipe, **Then** visual feedback indicates it's clickable
3. **Given** I am on `/recipes`, **When** I click "Add recipe", **Then** a blank recipe card opens with empty inputs
4. **Given** I am on `/recipes`, **When** I click an existing recipe, **Then** a modal/expanded card opens inline with current data populated for editing

---

### User Story 3 - Edit Recipe Details with Ingredient Management (Priority: P1)

As a user editing a recipe, I see the title and description as **non-editable displays** and a list of ingredients. Each ingredient has a **clickable badge** to toggle optional/required status and a **delete button (×)** to remove it from the list. I can save my changes. In edit mode, I see a **subtle red text link** at the bottom to delete the recipe (not a large button).

**Why this priority**: Core recipe editing functionality with ingredient optional marking and removal.

**Independent Test**: Can be tested by opening a recipe, clicking badges to toggle optional status, clicking × to remove ingredients, clicking delete link.

**Acceptance Scenarios**:

1. **Given** I opened an existing recipe, **When** I view the card, **Then** I see title/description as non-editable displays, ingredients with clickable badges and × buttons, and a subtle delete link at bottom
2. **Given** I am adding a new recipe, **When** I view the card, **Then** I do NOT see a delete link
3. **Given** I click an ingredient's Required/Optional badge, **When** I click it, **Then** the status toggles with a hover lift animation
4. **Given** I click an ingredient's × button, **When** I click it, **Then** the ingredient is immediately removed from the list
5. **Given** I toggled an ingredient as optional, **When** I save, **Then** the optional status persists
6. **Given** I click the delete recipe link, **When** I confirm in the dialog, **Then** the recipe is removed from my list
7. **Given** the delete confirmation appears, **When** I view it, **Then** I see a simple question with a smaller "Yes, Delete" button (not a large red button)

---

### User Story 4 - Voice or Text Input for Recipe Creation (Priority: P2)

As a user creating a recipe, I start in **voice mode** with a Record button and a "Do you prefer typing?" link. Clicking the link switches to **text mode** (text input + Extract button) in-place. I can switch back anytime via "Switch to voice recording" link. The system calls an LLM to extract title, description, and ingredients. Title and description are **non-editable** (display-only) and can only be populated via voice/text extraction. The LLM suggests which ingredients should be optional.

**Why this priority**: Enhances UX with flexible input but requires P1 base functionality first.

**Independent Test**: Can be tested by toggling between voice/text modes, submitting input, verifying extracted fields appear as non-editable displays.

**Acceptance Scenarios**:

1. **Given** I am creating a recipe, **When** I view the Quick Add section, **Then** I see the Record button alone with "Do you prefer typing?" link below
2. **Given** I click "Do you prefer typing?", **When** the mode switches, **Then** the Record button is replaced in-place with text input + Extract button
3. **Given** I am in text mode, **When** I click "Switch to voice recording", **Then** the interface switches back to voice mode with the Record button
4. **Given** I am in voice mode, **When** I click Record and speak, **Then** the system records my input (max 1 minute)
5. **Given** I am in text mode, **When** I type and press Enter or click Extract, **Then** the system processes my text
6. **Given** my input is processed, **When** the LLM processes it, **Then** skeleton placeholders appear with "Extracting recipe..." text until fields populate
7. **Given** the LLM extracts data, **When** results appear, **Then** title and description are shown as non-editable displays (gray background, left border, not inputs)
8. **Given** the LLM extracts ingredients, **When** results appear, **Then** some ingredients are pre-marked as optional based on LLM suggestion
9. **Given** the LLM suggested optional ingredients, **When** I review, **Then** I can click the badge to toggle optional status
10. **Given** I described a dish without mentioning ingredients, **When** the LLM processes it, **Then** it infers a minimal ingredient list needed for the recipe

---

### User Story 5 - Ingredient Database Validation (Priority: P2)

Before saving a recipe, the system validates all detected ingredients against the database. Unrecognized ingredients are placed in an "unrecognized items" section (matching onboarding behavior) for user review.

**Why this priority**: Data integrity feature; depends on ingredient extraction working first.

**Independent Test**: Can be tested by adding a recipe with a made-up ingredient and verifying it appears in unrecognized items.

**Acceptance Scenarios**:

1. **Given** I am saving a recipe, **When** all ingredients exist in DB, **Then** the recipe saves successfully
2. **Given** I am saving a recipe, **When** some ingredients are not in DB, **Then** those are shown as "unrecognized items"
3. **Given** unrecognized items are shown, **When** I review them, **Then** I can remove, rename/correct to match DB, or keep as custom text (same as onboarding)

---

### Edge Cases

- What happens when user speaks but audio is unclear or empty?
  - System shows error message and prompts to retry
- What happens when user describes a dish without mentioning ingredients?
  - LLM infers minimal ingredient list needed to achieve the recipe
- What happens when LLM extraction returns no ingredients (even after inference)?
  - System shows warning that no ingredients detected, allows manual entry
- What happens when LLM returns more than 20 ingredients?
  - System caps at 20 and informs user to remove some
- What happens when recipe has 0 ingredients?
  - System prevents saving; at least 1 ingredient required
- What happens when user deletes all ingredients from an existing recipe?
  - System prevents saving with validation message
- What happens when voice recording exceeds 1 minute?
  - Recording stops automatically at 1 minute limit
- What happens when user toggles between voice and text modes?
  - Interface replaces in-place; any in-progress input is lost (user must re-submit)
- What happens when user clicks × to delete an ingredient?
  - Ingredient is immediately removed from UI; change takes effect on save
- What happens when user tries to edit title/description directly?
  - Nothing; fields are display-only, can only be changed via voice/text extraction
- What happens if user accidentally clicks delete recipe link?
  - Confirmation dialog appears; recipe is not deleted until user confirms

## UI/UX Design Patterns *(mandatory)*

### Recipe Form Modal

**Layout**:
- Modal: 4px border, max-width 2xl, max-height 90vh with scroll
- Header: 3xl bold title, thick (2px) bottom border, close button (×)
- Content: 8px padding, 6-unit vertical spacing

**Quick Add Section** (Add mode only):
- Secondary background with 2px black border, shadow-md, rounded
- Bold uppercase "Quick Add" label
- Input mode toggle (voice ↔ text) replaces content in-place

**Voice Input Mode**:
- Large Record button (lg size) with microphone emoji
- "Do you prefer typing?" link below (underline hover)
- Recording shows red stop button + timer

**Text Input Mode**:
- Text input: 2px black border, shadow-sm, font-medium, Enter key submits
- Extract button next to input
- "Switch to voice recording" link below

**Title & Description Display**:
- Gray background (bg-gray-100), 4px left border accent
- Title: Large bold text when filled, italic placeholder when empty
- Description: Regular text, min-height 80px
- No input-like styling (no shadow, no full border)

**Ingredients List**:
- White background, 2px black border, shadow-sm per item
- Ingredient name: base size, font-medium
- Required/Optional badge: Clickable, 2px border, hover lift effect
- Delete button (×): Subtle gray, red on hover, right-aligned
- 2-unit vertical spacing between items

**Action Buttons**:
- Primary actions: lg size, thick borders, neo-brutalism shadows
- Create/Update + Cancel: side-by-side, 3-unit gap
- Delete: Subtle red text link at bottom, light gray divider

**Loading States**:
- Skeleton boxes: 2px black border, shadow-md, gray-200 background
- "Extracting recipe..." text: bold uppercase, centered

### Neo-Brutalism Visual Language

**Borders**: 2px standard, 4px emphasis (modal, left accents)
**Typography**: Bold uppercase labels, tracking-wide
**Shadows**: md for cards, sm for inputs
**Spacing**: 5-6 units between sections
**Buttons**: Hover translate-y, active press effects
**Colors**: Black borders, primary fills, gray accents

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display top 10 most recent recipes (title + description) on `/app` page
- **FR-001a**: Recipe items on `/app` MUST NOT be clickable (no hover states, no cursor pointer)
- **FR-002**: System MUST provide navigation from `/app` to `/recipes` page
- **FR-003**: System MUST display all user recipes (title + description) on `/recipes` page
- **FR-003a**: Recipe items on `/recipes` MUST be visually clickable (hover states, cursor pointer)
- **FR-004**: System MUST open inline modal/expanded card on `/recipes` when clicking a recipe (no page navigation)
- **FR-005**: System MUST provide "Add recipe" button that opens blank recipe card
- **FR-006**: Recipe card MUST show title, description, and ingredient list
- **FR-007**: Each ingredient MUST have a checkbox to mark as optional
- **FR-008**: Edit mode MUST include a delete button; add mode MUST NOT
- **FR-009**: System MUST support microphone input for voice-based recipe description (max 1 minute)
- **FR-009a**: System MUST support text input as fallback for recipe description
- **FR-010**: System MUST call LLM ("Recipe editor" prompt) to extract title, description, and 1-20 ingredients
- **FR-010a**: System MUST show skeleton placeholders + "Extracting recipe..." during LLM processing
- **FR-010b**: LLM MUST infer minimal ingredient list when user mentions no ingredients
- **FR-011**: LLM MUST suggest which ingredients should be optional based on recipe context
- **FR-012**: User MUST be able to adjust optional status after LLM suggestion
- **FR-013**: System MUST validate ingredients against database before saving
- **FR-014**: Unrecognized ingredients MUST be placed in "unrecognized items" section with options: remove, rename/correct, or keep as custom text
- **FR-015**: System MUST require at least 1 ingredient to save a recipe
- **FR-016**: System MUST cap ingredients at maximum of 20
- **FR-017**: System MUST support in-place toggle between voice and text input modes
- **FR-017a**: Voice mode MUST show Record button with "Do you prefer typing?" link
- **FR-017b**: Text mode MUST show text input + Extract button with "Switch to voice recording" link
- **FR-018**: Title and description MUST be non-editable display fields (populated only via voice/text extraction)
- **FR-018a**: Title/description MUST use gray background, left border accent, italic placeholders (not input styling)
- **FR-019**: Ingredient optional/required badge MUST be directly clickable to toggle status
- **FR-019a**: Badge MUST show hover lift effect for visual feedback
- **FR-020**: Each ingredient MUST have a delete button (×) for quick removal from list
- **FR-020a**: Delete button MUST be subtle (gray) and turn red on hover
- **FR-021**: Recipe delete action MUST be subtle (text link, not large button)
- **FR-021a**: Delete confirmation MUST use light gray divider and smaller confirmation button
- **FR-022**: Recipe form MUST follow neo-brutalism design: 4px modal border, 2px borders, bold uppercase labels, shadows

### Key Entities

- **Recipe**: User-owned recipe with title (non-unique, duplicates allowed), description, and linked ingredients. Belongs to one user. Identified by UUID.
- **RecipeIngredient**: Junction entity linking recipe to ingredient with `isOptional` boolean flag.
- **Ingredient**: Existing ingredient from database (5931 items in taxonomy).
- **UnrecognizedItem**: Ingredient not found in database, requiring user resolution (follows onboarding pattern).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new recipe via voice input in under 60 seconds
- **SC-002**: Users can view their top 10 recipes (title + description) on `/app` within 2 seconds of page load
- **SC-003**: 90% of voice-described recipes have correctly extracted title and at least 3 ingredients
- **SC-004**: Users can toggle ingredient optional status with 1 click (clickable badge)
- **SC-005**: All unrecognized ingredients are surfaced to user before save completes
- **SC-006**: Recipe delete confirmation prevents accidental data loss
- **SC-007**: Users can switch between voice and text input modes seamlessly (in-place toggle)
- **SC-008**: Users can remove unwanted ingredients with 1 click (× button)
- **SC-009**: Title and description fields are clearly non-editable (no confusion with input fields)
- **SC-010**: Neo-brutalism design is consistent (thick borders, bold labels, shadows, proper spacing)

## Assumptions

- Neo-brutalism design tokens/components already exist in the codebase (RetroUI)
- Neo-brutalism visual patterns defined: 2-4px borders, bold uppercase labels, shadows, hover effects
- Microphone/audio input follows existing patterns from onboarding
- LLM prompt structure follows existing @google/genai (Gemini) patterns
- "Unrecognized items" handling reuses onboarding component/logic
- User authentication already exists (Supabase Auth)
- Title and description are purely display fields (not editable inputs) populated only via LLM extraction

## LLM Prompts

### Recipe Editor Prompt

**Name**: `recipe-editor`
**Tags**: `recipe-management`, `voice`, `extraction`, `llm`
**Input Type**: `audio` (voice) or `text`
**Domain**: `recipe-management`
**Model**: `gemini-2.5-flash`

**Description**: Extracts recipe details (title, description, ingredients with optional flags) from user voice/text input when creating or editing a recipe.

**Template**:
```
You are a kitchen assistant helping users create and edit recipes.

Extract from the user's input:
- title: Recipe name (max 100 chars)
- description: Brief description (max 200 chars, 1-2 sentences)
- ingredients: Array of 1-20 ingredient objects with:
  - name: Ingredient name (common name, lowercase, singular)
  - isOptional: Boolean - true for garnishes, toppings, or "optional" mentions

Guidelines:
- Use common ingredient names (e.g., "egg" not "eggs", "tomato" not "tomatoes")
- Mark as optional: garnishes, "if you want", "optionally", decorative toppings
- Mark as required: core/anchor ingredients, proteins, base vegetables
- If no title detected, infer from main ingredients
- If description unclear, generate appetizing 1-sentence summary
- If user mentions NO ingredients, infer a MINIMAL ingredient list needed to achieve the recipe (only essential items)

Return structured JSON matching the schema.
```

**Output Schema**:
```typescript
{
  title: string;           // max 100 chars
  description: string;     // max 200 chars
  ingredients: Array<{
    name: string;          // lowercase, singular
    isOptional: boolean;   // true for optional items
  }>;                      // 1-20 items
}
```
