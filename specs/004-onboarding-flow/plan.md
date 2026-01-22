# Implementation Plan: Voice-Enabled Kitchen Onboarding

**Branch**: `004-onboarding-flow` | **Date**: 2026-01-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-onboarding-flow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement 3-step voice-enabled onboarding flow for kitchen profile setup. Users select dishes/ingredients via badge UI (step 2), then refine selections using hold-to-speak voice input or text fallback (step 3). Integrates Google Gemini API for natural language processing of voice/text to extract structured add/remove operations. Supports microphone permission handling, consecutive failure recovery with text fallback, and real-time UI updates.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode), React 19, Next.js 16
**Primary Dependencies**: `@ai-sdk/google` (Gemini), Vercel AI SDK, RetroUI components, Tailwind CSS v4, `lucide-react` icons
**Storage**: Client-side state (React hooks) during onboarding flow only
**Testing**: Vitest configured (`pnpm test`), manual testing for MVP voice workflows
**Target Platform**: Web (mobile-first responsive), requires browser MediaRecorder API
**Project Type**: Web application (Next.js monorepo)
**Performance Goals**: Voice NLP processing <5s p95, UI transitions smooth 60fps
**Constraints**:
- Single-page implementation (no route changes during steps 1-3)
- Mobile-first responsive design required
- Forward-only navigation (no back buttons between steps)
- Text input fallback required for voice failures or denied microphone access
- Onboarding must be skippable (provide "Skip Setup" option on step 1)
**Scale/Scope**: 3 steps, ~15 UI components, 1 API route for NLP processing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ MVP-First Development
- **Status**: COMPLIANT
- **Evidence**: Focus on working voice feature with manual testing, defer comprehensive test coverage

### ✅ Pragmatic Type Safety
- **Status**: COMPLIANT
- **Evidence**: Use TypeScript strict mode, type safety at API boundary (Gemini NLP response), allow pragmatic `any` for MediaRecorder if needed

### ✅ Essential Validation Only
- **Status**: COMPLIANT
- **Evidence**: Validate voice/text NLP response format, user input at API boundary, skip validation for internal UI state

### ✅ Test-Ready Infrastructure
- **Status**: COMPLIANT
- **Evidence**: Vitest configured, manual testing for voice workflows during MVP, expand tests post-MVP

### ✅ Type Derivation Over Duplication
- **Status**: COMPLIANT
- **Evidence**: Derive types from Gemini NLP response schema using Zod inference or `z.infer`

### ✅ Named Parameters for Clarity
- **Status**: COMPLIANT
- **Evidence**: Use named params for `processVoiceInput({audioBase64, currentContext})`, `handleVoiceUpdate({add, remove})`

### ✅ Vibrant Neobrutalism Design System
- **Status**: COMPLIANT
- **Evidence**:
  - Thick black borders (4px mobile, 6-8px desktop) on badges, buttons, containers
  - Thick box shadows with solid offset (no blur)
  - Vibrant color palette: pink-400, yellow-300, cyan-300, orange-400 gradients
  - Playful asymmetry with rotations (desktop only, `md:rotate-2`)
  - Font-black headings, uppercase titles
  - Mobile-first responsive (`border-4 md:border-6`, remove rotations on mobile)
  - Shadow-based hover states with translate movement
  - Follow landing page patterns from `page.tsx`

### 🟢 No Constitution Violations
All principles compliant, no complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-onboarding-flow/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── onboarding/
│   │   │       └── process-voice/
│   │   │           └── route.ts          # NLP API endpoint (Gemini integration)
│   │   └── (protected)/
│   │       └── onboarding/
│   │           └── page.tsx              # Main onboarding UI (3 steps)
│   ├── components/
│   │   ├── retroui/                      # Existing: Button, Badge, Text
│   │   └── PageContainer.tsx             # Existing: Page wrapper
│   ├── hooks/
│   │   └── useVoiceInput.ts              # Reusable voice capture hook
│   ├── lib/
│   │   └── gemini.ts                     # Gemini API service (reusable)
│   └── types/
│       └── onboarding.ts                 # Type definitions (OnboardingState, VoiceUpdate)
└── tests/
    └── onboarding/                       # Manual testing initially
        └── voice-input.test.ts           # Future: voice input unit tests
```

**Structure Decision**: Next.js web application structure (Option 2 variant). Frontend components in `apps/nextjs/src/app/(protected)/onboarding/`, API route for voice processing in `apps/nextjs/src/app/api/onboarding/process-voice/`. Reusable voice input hook in `src/hooks/useVoiceInput.ts` for future page usage. Gemini service in `src/lib/gemini.ts` for reusability across voice features.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations.

---

## Phase 0: Outline & Research

### Research Tasks

1. **Gemini API Integration**
   - Task: Research Google Gemini API usage with Vercel AI SDK (`@ai-sdk/google`)
   - Task: Identify best Gemini model for audio-to-JSON extraction (target: gemini-2.0-flash-exp or gemini-1.5-flash)
   - Task: Find audio format support (WebM, MP3, WAV) and base64 encoding requirements
   - Task: Determine response schema configuration for structured JSON output

2. **MediaRecorder API Best Practices**
   - Task: Research browser MediaRecorder API for voice capture
   - Task: Identify optimal audio format for Gemini (WebM/Opus preferred)
   - Task: Find microphone permission patterns and error handling
   - Task: Determine auto-stop recording strategies (silence detection vs. time limits)

3. **Voice Input UX Patterns**
   - Task: Research hold-to-speak vs. tap-to-toggle patterns
   - Task: Find best practices for visual feedback during recording
   - Task: Identify text fallback UI patterns for accessibility
   - Task: Determine consecutive failure recovery strategies

4. **Responsive Design Patterns**
   - Task: Research mobile-first touch target sizes (minimum 44x44px)
   - Task: Find patterns for preventing horizontal overflow with rotated elements
   - Task: Identify responsive shadow/border scaling strategies

### Research Output

**Output**: `research.md` with decisions and rationales for:
- Gemini model choice (gemini-2.0-flash-exp vs gemini-1.5-flash)
- Audio format and encoding strategy
- Voice input UX pattern (hold-to-speak selected, rationale documented)
- Text fallback activation logic (after 2 consecutive failures)
- Responsive design breakpoints for mobile/desktop

---

## Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

### Data Model

**File**: `data-model.md`

#### Entities

**OnboardingState** (UI state):
```typescript
{
  currentStep: 1 | 2 | 3
  dishes: string[]          // Cooking skills
  fridge: string[]          // Fridge ingredients (step 2 only)
  pantry: string[]          // Pantry ingredients (step 2 only)
  ingredients: string[]     // Merged fridge + pantry (step 3 only)
  hasVoiceChanges: boolean  // Enable "Complete Setup" button
  voiceFailureCount: number // Track consecutive failures (reset on success)
}
```

**VoiceUpdate** (NLP response):
```typescript
{
  add: {
    dishes: string[]
    ingredients: string[]
  }
  remove: {
    dishes: string[]
    ingredients: string[]
  }
}
```

**SuggestedItems** (static data):
```typescript
{
  dishes: Array<{ id: string, name: string }>       // 10-15 items
  fridgeItems: Array<{ id: string, name: string }>  // 15-20 items
  pantryItems: Array<{ id: string, name: string }>  // 15-20 items
}
```

#### State Transitions

1. **Step 1 → Step 2**: Button click, no validation
2. **Step 2 → Step 3**: Button click, merge fridge + pantry → ingredients array
3. **Step 3 → Complete**: Button click (enabled only after voice/text change), navigate to suggestions

#### Validation Rules

- **Voice/Text Input**: Parse NLP JSON response, validate structure matches `VoiceUpdate` schema
- **Duplicate Detection**: Case-insensitive comparison, show toast if duplicate
- **Empty State**: Allow empty selections, show placeholder in step 3

### API Contracts

**Directory**: `contracts/`

#### POST `/api/onboarding/process-voice`

**Request**:
```typescript
{
  audioBase64?: string  // Base64 encoded audio (WebM format)
  text?: string         // Alternative: text input for fallback
  currentContext: {
    dishes: string[]
    ingredients: string[]
  }
}
```

**Response** (200 OK):
```typescript
{
  add: {
    dishes: string[]
    ingredients: string[]
  }
  remove: {
    dishes: string[]
    ingredients: string[]
  }
}
```

**Response** (400 Bad Request):
```typescript
{
  error: "Invalid input format"
}
```

**Response** (500 Internal Server Error):
```typescript
{
  error: "NLP processing failed"
}
```

**Timeout**: 15 seconds max

**OpenAPI Spec**: Generate in `contracts/process-voice.openapi.yaml`

### Agent Context Update

**Run**: `.specify/scripts/bash/update-agent-context.sh claude`

**New Technology Additions**:
- `@ai-sdk/google` - Google Gemini integration
- MediaRecorder API - Browser voice capture
- Gemini model: `gemini-2.0-flash-exp` (or selected model from research)

### Quickstart Guide

**File**: `quickstart.md`

**Content**:
1. Prerequisites: Node.js 18+, GOOGLE_GENERATIVE_AI_API_KEY in `.env.local`
2. Install dependencies: `pnpm install`
3. Run dev server: `pnpm dev`
4. Navigate to `/onboarding` route
5. Test voice input: Hold mic button, speak "add eggs, remove tomatoes"
6. Test text fallback: Deny microphone permission, use text input
7. Complete onboarding, verify profile saved

**Output**: `data-model.md`, `contracts/`, `quickstart.md`, updated CLAUDE.md

---

## Phase 2: Implementation Planning

**Status**: Command ends after Phase 1. Run `/speckit.tasks` to generate `tasks.md` with implementation steps.

---

## Constitution Re-Check (Post-Design)

### ✅ All Gates Still Compliant

- **Type Derivation**: `VoiceUpdate` type derived from Zod schema via `z.infer`
- **Named Parameters**: `processVoiceInput({audioBase64, currentContext})`
- **Neobrutalism Design**: Badge buttons with `border-4 md:border-6`, `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`, vibrant gradients
- **MVP-First**: Manual testing, defer comprehensive test coverage
- **Essential Validation**: API boundary validation only, no internal validation

### 🟢 No New Violations Introduced

Design phase complete, ready for Phase 2 task generation via `/speckit.tasks`.
