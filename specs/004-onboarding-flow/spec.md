# Feature Specification: Voice-Enabled Kitchen Onboarding

**Feature ID**: 004-onboarding-flow
**Created**: 2026-01-22
**Status**: Draft

## Overview

HomeCuistot onboarding guides new users through a 3-step single-page flow to configure their kitchen profile. Users declare cooking skills, inventory (fridge + pantry), then refine selections via voice input. The flow prepares users for AI-powered meal recommendations based on available ingredients.

## Clarifications

### Session 2026-01-22

- Q: How should the kitchen profile data model store the three categories (cooking skills, fridge, pantry)? → A: UI maintains dishes, fridge ingredients, and pantry ingredients arrays separately. In step 3, fridge + pantry merge into single ingredients array. Dishes remain separate.
- Q: When should "Complete Setup" button be enabled in step 3? → A: Only enabled after user makes at least one change via voice/text in step 3
- Q: What happens if NLP service returns unparseable/error response (not network timeout)? → A: Show generic error "Couldn't understand. Try again." (no audio storage)
- Q: What visual feedback should display during voice/text NLP processing (5-15s)? → A: Inline spinner + "Processing..." text (non-blocking, mic button disabled during processing)
- Q: What format should NLP service return for parsed voice/text input? → A: JSON with structured arrays: `{add: {dishes: [], ingredients: []}, remove: {dishes: [], ingredients: []}}`

## User Scenarios & Testing

### Primary Flow: Complete Onboarding

**Actor**: New user landing on HomeCuistot for the first time

**Steps**:

1. User sees welcome screen with microphone permission notice
2. User taps "Get Started" to begin onboarding
3. User selects easy-to-cook dishes from suggested list (e.g., "Scrambled Eggs", "Pasta")
4. User selects fridge ingredients from common items
5. User selects pantry staples from suggested list
6. User taps "Continue" to advance to step 3
7. User reviews combined ingredient list on step 3
8. User taps microphone button and speaks: "Add eggs, remove tomatoes, I can also cook grilled cheese"
9. System processes voice, updates lists in real-time
10. User taps "Complete Setup" and profile is saved

**Expected Outcome**: User kitchen profile created with cooking skills + ingredients ready for meal planning

### Alternative Flow: Empty Kitchen Setup

**Actor**: User who skipped all selections in step 2

**Steps**:

1. Complete steps 1-2 without selecting any items
2. Arrive at step 3 with empty ingredient list
3. See placeholder: "Your kitchen is empty. Hold the mic and tell me what you have."
4. Use voice input to populate entire kitchen from scratch
5. Complete onboarding with voice-generated data

**Expected Outcome**: User can onboard with voice-only input if preferred

### Alternative Flow: Voice/Text Correction

**Actor**: User who realizes they made mistakes in step 2

**Steps**:

1. Progress to step 3 and review selections
2. Notice missing/incorrect ingredients
3. Use voice input to add or remove items: "Add eggs, remove tomatoes"
4. If voice fails, use text input fallback to make corrections
5. Review updated list and complete onboarding

**Expected Outcome**: Users can correct selections in step 3 using voice or text input

### Alternative Flow: Text Fallback After Voice Failures

**Actor**: User experiencing repeated voice recognition issues

**Steps**:

1. Complete steps 1-2 and arrive at step 3
2. Tap microphone button and speak
3. System fails to process voice input, shows retry message
4. User retries with microphone, fails again (second consecutive failure)
5. System shows message: "Still having trouble. Would you like to type instead?"
6. Text input field appears below microphone button with a meaningful placeholder text example
7. User types: "add eggs, remove tomatoes"
8. System processes text, updates list successfully
9. User completes onboarding with profile saved

**Expected Outcome**: Users can always complete onboarding even with persistent voice issues via text fallback

### Edge Cases

1. **Microphone Permission Denied**: User blocks microphone access
   - Hide microphone button
   - Show text input field with message: "Microphone access denied. Type what you want to add or remove."
   - Process text input same as voice (natural language parsing)

2. **First Voice Recognition Failure**: System cannot parse voice input OR NLP service returns unparseable response
   - Show error: "Couldn't understand. Please try again."
   - No audio storage/logging for privacy
   - Keep existing selections unchanged
   - Allow immediate retry

3. **Second Consecutive Voice Failure**: System fails again after retry
   - Show message: "Still having trouble. Would you like to type instead?"
   - Display text input field as fallback
   - Reset failure count after successful voice input

4. **Network Failure During Voice Processing**:
   - Show loading state with timeout (15 seconds)
   - On timeout, show error: "Connection issue. Try again."
   - Count as failure toward consecutive failure limit

5. **Duplicate Voice Entries**: User says "add tomatoes" when tomatoes already selected
   - System detects duplicate, shows no change
   - Show toast: "Tomatoes already in your kitchen"

## Functional Requirements

### FR1: Welcome Screen (Step 1)

1.1. Display welcome message: "Welcome to HomeCuistot! Let's set up your kitchen profile."
1.2. Show microphone permission banner: "This app uses voice input. Please allow microphone access when prompted."
1.3. Provide primary CTA button: "Get Started"
1.4. Provide secondary link: "Skip Setup" (navigates to main app with empty profile)
1.5. Show progress indicator: Step 1 of 3
1.6. On "Get Started" tap, transition to step 2 with slide animation

### FR2: Ingredient & Skill Selection (Step 2)

2.1. Display progress indicator: Step 2 of 3
2.2. Section 1 - Cooking Skills:

- Question: "What dishes can you cook?"
- Display 10-15 easy-to-cook dishes as badge buttons (e.g., "Scrambled Eggs", "Pasta", "Grilled Cheese", "Salad", "Rice Bowl")
- Allow multi-select, optional pre-selection of 2-3 items
- Selected badges show active state (visual distinction)

  2.3. Section 2 - Fridge Inventory:

- Question: "What's in your fridge?"
- Display 15-20 common fridge items as badge buttons (e.g., "Eggs", "Milk", "Tomatoes", "Cheese")
- Allow multi-select
- Selected badges show active state

  2.4. Section 3 - Pantry Staples:

- Question: "What's in your pantry?"
- Display 15-20 pantry items as badge buttons (e.g., "Pasta", "Rice", "Flour", "Sugar", "Salt", "Olive Oil")
- Allow multi-select
- Selected badges show active state

  2.5. Bottom Actions:

- Secondary CTA: "Clear All" - deselects all badges across all sections
- Primary CTA: "Continue" - advances to step 3
- "Continue" enabled regardless of selection count (allows empty state)

  2.6. On "Continue" tap, transition to step 3 with slide animation

### FR3: Voice/Text Refinement (Step 3)

3.1. Display progress indicator: Step 3 of 3
3.2. Display section: "Available Ingredients"

- Merge fridge + pantry arrays from step 2 into single ingredients array
- Show merged ingredients + dishes as read-only badges
- If empty, show placeholder: "Your kitchen is empty. Hold the mic and tell me what you have."

  3.3. Voice Input (Primary Method):

- Display large microphone icon button
- Label: "Tap to add or remove items by voice"
- On tap, request microphone permission if not granted
- Show recording state (visual + text: "Listening...")
- Auto-stop recording after 10 seconds of speech or 30 seconds total

  3.4. Voice Processing:

- Send audio to backend for natural language processing
- NLP service returns JSON: `{add: {dishes: [], ingredients: []}, remove: {dishes: [], ingredients: []}}`
- Apply operations: add items to dishes/ingredients arrays, remove matching items
- Update "Available Ingredients" list in real-time
- Show inline spinner + "Processing..." text below mic button (non-blocking UI)
- Disable mic button during processing to prevent duplicate submissions
- Timeout: 15 seconds max

  3.5. Error Handling - Microphone Permission Denied:

- Hide microphone button
- Show text input field
- Display message: "Microphone access denied. Type what you want to add or remove."
- Process text input with same natural language parsing

  3.6. Error Handling - Voice Recognition Failures:

- **First failure**: Show error "Couldn't understand. Please try again."
- Keep existing selections unchanged
- Allow immediate retry with microphone button
- **Second consecutive failure**: Show message "Still having trouble. Would you like to type instead?"
- Display text input field below microphone button
- User can choose to retry voice or use text input
- Reset failure count after successful voice input

  3.7. Text Input (Fallback Method):

- Text field with placeholder: "Type ingredients to add or remove (e.g., 'add eggs, remove tomatoes')"
- Submit button: "Update List"
- Process text with natural language parsing (same JSON response format as voice)
- Apply operations using same logic as voice processing
- Show inline spinner + "Processing..." text next to submit button (non-blocking UI)
- Disable submit button during processing to prevent duplicate submissions
- Timeout: 15 seconds max

  3.8. Completion CTA:

- Primary button: "Complete Setup"
- Disabled by default, enabled only after user makes ≥1 change via voice/text in step 3
- On tap, save profile and navigate to main app

### FR4: Navigation & Progress

4.1. Progress indicator visible on all steps (1/3, 2/3, 3/3)
4.2. No back navigation - users move forward only through steps
4.3. All transitions use slide animation (left to right)
4.4. No route changes - entire flow on single page route
4.5. Step 3 allows corrections via voice/text input instead of backward navigation

## Success Criteria

1. **Onboarding Completion Rate**: ≥80% of users who start reach step 3
2. **Voice Feature Adoption**: ≥50% of users attempt voice input in step 3
3. **Time to Complete**: Average onboarding time ≤3 minutes
4. **Error Recovery**: ≥90% of voice input errors successfully recover on retry
5. **Data Quality**: ≥5 items (dishes + ingredients) collected per user on average
6. **Navigation Clarity**: ≤5% of users refresh page during onboarding (indicates confusion)

## Key Entities

### User Kitchen Profile

- Dishes (array of dish names, separate throughout flow)
- Ingredients (array of ingredient names, merged from fridge + pantry in step 3)
- Created timestamp
- Last updated timestamp

**UI State (Steps 1-2)**:
- Dishes array (cooking skills)
- Fridge ingredients array
- Pantry ingredients array

**UI State (Step 3)**:
- Dishes array (unchanged)
- Ingredients array (fridge + pantry merged)

### Suggested Items (Static Data)

- Easy-to-cook dish catalog (10-15 simple dishes like scrambled eggs, pasta, grilled cheese)
- Fridge item catalog (15-20 common items)
- Pantry item catalog (15-20 common items)

### Input Record

- Input type (voice or text)
- Text string (for text input only; audio not stored)
- Processing timestamp
- Parsed response: `{add: {dishes: [], ingredients: []}, remove: {dishes: [], ingredients: []}}`
- Success/failure status
- Consecutive failure count

**Privacy**: Audio blobs not stored/logged for failed voice attempts

## Assumptions & Dependencies

### Assumptions

1. Users access onboarding on mobile or desktop with microphone capability
2. Voice recognition system can parse natural language for ingredient/dish extraction with ≥85% accuracy
3. Voice input supports English language initially
4. Network latency for voice processing ≤5 seconds p95
5. Pre-selected items in step 2 based on regional dietary patterns (configurable)
6. Users complete onboarding in single session (no save/resume mid-flow)

### Dependencies

1. **Natural Language Processing Service**: Backend integration for voice-to-text and text parsing
   - Response format: `{add: {dishes: string[], ingredients: string[]}, remove: {dishes: string[], ingredients: string[]}}`
   - Supports both audio blob (voice) and text string input
   - Timeout: 15 seconds max
   - No audio storage for failed attempts (privacy)
2. **Authentication System**: User authentication required before onboarding access
3. **Microphone Access**: Browser capability to capture audio input (with text fallback)
4. **UI Components**: Interactive selection elements, progress tracking, smooth transitions, text input fields, inline loading spinners
5. **User Data Storage**: Persistent storage for kitchen profile information
6. **Failure Tracking**: Client-side tracking of consecutive voice recognition failures

### Constraints

1. Single-page implementation (no route changes during steps 1-3)
2. Mobile-first responsive design required
3. Forward-only navigation (no back buttons between steps)
4. Text input fallback required for voice failures or denied microphone access
5. Onboarding must be skippable (provide "Skip Setup" option on step 1)

## Out of Scope

1. Multi-language input support (English only MVP)
2. Editing kitchen profile after onboarding (addressed in separate feature)
3. Dietary restrictions/allergies configuration (separate onboarding step)
4. Integration with recipe database during onboarding (post-onboarding feature)
5. Social features (sharing kitchen setups)
6. Barcode scanning for ingredient entry
7. Image recognition for ingredient detection
8. Manual ingredient entry via free-form text (only natural language add/remove commands supported)

## Notes

- Microphone permission banner on step 1 is critical for user expectations
- Empty state placeholder text must be actionable and encouraging
- Voice/text input errors should not block progress - text fallback always available
- Progress indicator builds confidence and sets expectations for quick completion
- "Clear All" in step 2 prevents frustration from tedious de-selection
- Forward-only navigation keeps flow simple; corrections made in step 3 via voice/text
- Text input fallback ensures accessibility for users without microphone or voice issues
- Consecutive failure tracking (max 2) prevents user frustration with repeated voice failures
