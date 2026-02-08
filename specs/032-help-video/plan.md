# Implementation Plan: Help Video Integration for Microphone Feature

**Branch**: `032-help-video` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/032-help-video/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/`.

## Summary

Add embedded YouTube tutorial videos to My Inventory and My Recipes pages to help users understand microphone voice input. Videos display prominently for first-time users with crystal-clear dismissal, then remain accessible via a persistent video button. Implementation uses existing localStorage patterns, environment variable configuration, and responsive YouTube iframe embed that works on mobile and desktop without taking full width.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16
**Primary Dependencies**: React, Next.js App Router, Tailwind CSS v4, lucide-react (icons)
**Storage**: Browser localStorage (dismissal state), Environment variables (video IDs)
**Testing**: Vitest (manual testing acceptable for MVP)
**Target Platform**: Web (Chrome, Firefox, Safari, Edge), Mobile browsers (iOS Safari, Android Chrome)
**Project Type**: Web application (Next.js monorepo)
**Performance Goals**: Video loads <3s, Page load impact <500ms, Responsive on mobile/tablet/desktop
**Constraints**: Must not take full tab width, Mobile-first responsive, SSR-safe localStorage access
**Scale/Scope**: 2 pages (Inventory, Recipes), 2 videos, 3-4 new components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: MVP-First Development
- **Compliance**: Feature completeness prioritized (video embed, dismissal, persistent access)
- **Manual validation**: Acceptable for video playback testing
- **Happy path focus**: Defer complex error scenarios (blocked embeds, privacy mode)

### ✅ Principle II: Pragmatic Type Safety
- **TypeScript strict**: No `any` needed for this feature
- **Type safety at boundaries**: Environment variables (string), localStorage (string), props (typed)
- **Internal types**: Component props fully typed

### ✅ Principle III: Essential Validation Only
- **MUST validate**: Environment variable presence (video IDs)
- **SHOULD validate**: localStorage access (try/catch wrapped)
- **CAN SKIP**: Video embed iframe rendering (YouTube handles this)

### ✅ Principle IV: Test-Ready Infrastructure
- **Manual testing**: Video playback, dismissal persistence, responsive behavior
- **Optional tests**: localStorage state management (defer to post-MVP)

### ✅ Principle V: Type Derivation Over Duplication
- **No complex types**: Simple props (string video IDs, boolean dismissed states)
- **Primitives acceptable**: `videoId: string`, `dismissed: boolean`

### ✅ Principle VI: Named Parameters for Clarity
- **Compliance**: Use named params for any functions with 3+ args or 2+ same-type args
- **Example**: `openVideo({ videoId, source })` not `openVideo(videoId, source)`

### ✅ Principle VII: Vibrant Neobrutalism Design System
- **Video modal**: Border-4 border-black, box shadow, vibrant background
- **Persistent button**: Pink/cyan button with thick border, shadow hover states, video icon (lucide-react Play)
- **Prominent callout**: Enhanced PageCallout with dismiss X button (crystal clear)
- **Mobile-first**: No rotations on mobile, responsive iframe sizing, smaller borders/shadows
- **Dismiss UI**: Large X button, contrasting color, uppercase "Dismiss" text, unmistakable

**✅ NO VIOLATIONS - All principles aligned**

## Project Structure

### Documentation (this feature)

```text
specs/032-help-video/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   └── video-components.md  # Component interface contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (Next.js monorepo structure)

```text
apps/nextjs/
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── PageCallout.tsx          # [MODIFY] Add video CTA variant
│   │   │   ├── VideoTutorialButton.tsx  # [NEW] Persistent button with icon
│   │   │   ├── VideoModal.tsx           # [NEW] Modal with embedded YouTube iframe
│   │   │   └── index.ts                 # [MODIFY] Export new components
│   │   ├── inventory/
│   │   │   └── [existing components]    # [NO CHANGES]
│   │   └── recipes/
│   │       └── [existing components]    # [NO CHANGES]
│   ├── app/
│   │   └── (protected)/app/
│   │       ├── inventory/
│   │       │   └── page.tsx             # [MODIFY] Add video state + components
│   │       └── recipes/
│   │           └── page.tsx             # [MODIFY] Add video state + components
│   └── lib/
│       └── hooks/
│           └── useVideoDismissal.ts     # [NEW] Custom hook for dismissal state
├── .env.local                            # [MODIFY] Add video ID env vars
└── .env.local-template                   # [MODIFY] Document video env vars

apps/nextjs/src/components/app/
└── ResetUserDataButton.tsx               # [MODIFY] Add video dismissal cleanup
```

**Structure Decision**: Next.js App Router with shared components pattern. New video components in `components/shared/` for reusability across Inventory and Recipes pages. Custom hook encapsulates localStorage pattern. No new pages, only modifications to existing Inventory and Recipes pages.

## Complexity Tracking

**NO VIOLATIONS** - Feature aligns with all constitution principles. No complexity tracking required.

## Phase 0: Outline & Research

### Research Tasks

#### R1: YouTube Embed Best Practices
**Question**: What are the best practices for responsive YouTube iframe embeds that don't take full width?

**Focus Areas**:
- Responsive iframe sizing techniques (aspect-ratio, max-width constraints)
- YouTube embed parameters (controls, modestbranding, rel=0)
- Privacy-enhanced mode (`youtube-nocookie.com` vs standard)
- Lazy loading strategies (native loading="lazy" vs Intersection Observer)
- Mobile-specific considerations (touch controls, data usage warnings)

**Expected Output**: Recommended iframe implementation pattern with responsive CSS

#### R2: Modal/Dialog Component Patterns in React 19
**Question**: What is the recommended pattern for modal dialogs in React 19 with Next.js 16?

**Focus Areas**:
- Native `<dialog>` element vs portal-based modals
- Focus trapping and keyboard accessibility (Esc to close)
- Body scroll locking during modal display
- SSR-safe modal rendering
- Existing modal patterns in codebase (check HelpModal, ProposalConfirmationModal)

**Expected Output**: Modal implementation approach matching existing codebase patterns

#### R3: localStorage React Hook Patterns (SSR-safe)
**Question**: Already answered in spec - reference existing pattern from `inventory/page.tsx`

**Findings** (from spec):
- Lazy initialization: `useState(() => { ... })`
- SSR check: `typeof window === "undefined"`
- Error handling: `try/catch` wrapper
- String storage: `localStorage.setItem("key", String(value))`
- Keys: `"video:inventory:dismissed"`, `"video:recipes:dismissed"`

**No research needed** - pattern documented in spec Implementation Reference section

#### R4: lucide-react Icon Usage
**Question**: Which icon should represent "video tutorial" button and how to use lucide-react?

**Focus Areas**:
- Best icon: `Play`, `Video`, `PlayCircle`, or `Youtube`?
- Icon sizing and positioning with text
- Mobile touch target sizing (44x44px minimum)
- Color and contrast for visibility

**Expected Output**: Icon selection and usage example

#### R5: Dismiss Button UI Patterns
**Question**: What makes a dismiss/close button "crystal clear" and obvious?

**Focus Areas**:
- Visual indicators: Large X icon, contrasting color, prominent position
- Text labels: "Dismiss", "Close", "Got it" - which is clearest?
- Button sizing: Larger buttons more obvious (48x48px desktop, 44x44px mobile)
- Placement: Top-right corner (standard) vs inline with content
- Color contrast: Red/orange for "close" action vs neutral

**Expected Output**: Dismiss button design spec for prominent callout

### Research Consolidation

**Output File**: `specs/032-help-video/research.md`

**Format**:
```markdown
# Research Findings: Help Video Integration

## R1: YouTube Embed Best Practices
**Decision**: Use responsive iframe with aspect-ratio CSS and max-width constraint
**Rationale**: [findings]
**Alternatives considered**: [other approaches]

## R2: Modal/Dialog Component Patterns
**Decision**: Follow existing HelpModal pattern (portal-based with useState)
**Rationale**: [consistency with codebase]
**Alternatives considered**: [native dialog element]

[... continue for all research tasks]
```

## Phase 1: Design & Contracts

### Data Model

**Output File**: `specs/032-help-video/data-model.md`

#### Entities

**VideoTutorialState** (localStorage):
```typescript
// Keys (not objects, just boolean strings)
"video:inventory:dismissed": "true" | "false"
"video:recipes:dismissed": "true" | "false"
```

**VideoConfiguration** (environment variables):
```typescript
NEXT_PUBLIC_HELP_VIDEO_INVENTORY="MDo79VMVYmg"
NEXT_PUBLIC_HELP_VIDEO_RECIPES="YgmZlurI5fA"
```

**Component State**:
```typescript
// Per-page state
{
  videoDismissed: boolean;      // From localStorage
  videoModalOpen: boolean;      // Modal display state
  videoId: string;              // From env var
}
```

#### State Transitions

```
[First Visit] → videoDismissed=false → Show prominent callout + persistent button
                ↓ User clicks dismiss
[Dismissed] → videoDismissed=true → Hide prominent callout, show persistent button only
              ↓ User clicks persistent button
[Video Playing] → videoModalOpen=true → Show modal with YouTube iframe
                  ↓ User closes modal
[Back to Page] → videoModalOpen=false → Return to previous state (dismissed or not)
```

### Component Contracts

**Output File**: `specs/032-help-video/contracts/video-components.md`

#### VideoTutorialButton
```typescript
interface VideoTutorialButtonProps {
  videoId: string;
  pageContext: "inventory" | "recipes";
  onOpen: () => void;
  className?: string;
}

// Behavior:
// - Always visible (never hidden by dismissal)
// - Positioned below page title on left side
// - Icon: lucide-react Play icon
// - Text: "Watch Tutorial" or "How to Use Voice Input"
// - Neobrutalist styling: border-4, shadow, vibrant color
// - Mobile: 44x44px min touch target
```

#### VideoModal
```typescript
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
}

// Behavior:
// - Portal-based modal (follows HelpModal pattern)
// - YouTube iframe embed (responsive, max-width constraint)
// - Close on Esc key, close on backdrop click
// - Body scroll lock when open
// - iframe: 16:9 aspect ratio, max 800px width
// - Neobrutalist modal: border-4, shadow, vibrant background
```

#### PageCalloutWithVideo (Enhanced PageCallout)
```typescript
interface PageCalloutWithVideoProps extends PageCalloutProps {
  videoId: string;
  onOpenVideo: () => void;
  onDismiss: () => void;
  showDismiss: boolean;  // Only show for prominent version
}

// Behavior:
// - Extends existing PageCallout component
// - Video CTA button inline with description
// - Dismiss button: Large X, top-right, crystal clear
//   - 48x48px button, bold X icon, contrasting color (red/orange)
//   - Text label: "Dismiss Tutorial"
// - Conditional rendering based on dismissal state
```

#### useVideoDismissal Hook
```typescript
function useVideoDismissal(params: {
  storageKey: "video:inventory:dismissed" | "video:recipes:dismissed";
}): {
  dismissed: boolean;
  dismiss: () => void;
  reset: () => void;  // For debugging/testing
}

// Behavior:
// - Encapsulates localStorage pattern from spec
// - SSR-safe: typeof window check
// - Error handling: try/catch wrapper
// - String storage: "true" | "false"
// - Side effect: useEffect for persistence
```

### Integration Points

**Inventory Page** (`app/(protected)/app/inventory/page.tsx`):
- Add `useVideoDismissal({ storageKey: "video:inventory:dismissed" })`
- Add `useState` for video modal open/close
- Conditionally render `PageCalloutWithVideo` (if not dismissed) or minimal version (if dismissed)
- Always render `VideoTutorialButton` below page title
- Render `VideoModal` with `videoId` from env var

**Recipes Page** (`app/(protected)/app/recipes/page.tsx`):
- Same pattern as Inventory page
- Different storage key: `"video:recipes:dismissed"`
- Different video ID from env var

**ResetUserDataButton** (`components/app/ResetUserDataButton.tsx`):
- Add localStorage cleanup:
  ```typescript
  localStorage.removeItem('video:inventory:dismissed')
  localStorage.removeItem('video:recipes:dismissed')
  ```

### API Contracts

**No API changes required** - This is purely frontend feature with client-side state management.

### Quickstart Guide

**Output File**: `specs/032-help-video/quickstart.md`

```markdown
# Quick Start: Help Video Feature

## For Developers

### 1. Setup Environment Variables
Add to `apps/nextjs/.env.local`:
```bash
NEXT_PUBLIC_HELP_VIDEO_INVENTORY=MDo79VMVYmg
NEXT_PUBLIC_HELP_VIDEO_RECIPES=YgmZlurI5fA
```

### 2. Test Video Functionality
```bash
cd apps/nextjs
pnpm dev
```

Navigate to:
- http://localhost:3000/app/inventory (should see prominent video callout)
- Click "Watch Tutorial" → Video modal opens
- Click Dismiss → Prominent callout hidden
- Reload page → Persistent button still visible
- Click persistent button → Video modal opens again

### 3. Test Dismissal State
```javascript
// Browser console
localStorage.getItem("video:inventory:dismissed")  // Should return "true" after dismiss
localStorage.removeItem("video:inventory:dismissed")  // Reset to test again
```

### 4. Test Responsive Behavior
- Desktop: Video modal max 800px width, neobrutalist shadows
- Tablet: Video scales down, touch-friendly controls
- Mobile: Video scales to screen width with padding, no horizontal overflow

## For QA

### Test Scenarios
1. **First-time user**: Prominent callout visible
2. **Dismiss**: Click dismiss, verify callout hidden, persistent button remains
3. **Persistent button**: Click, video plays in modal
4. **Page reload**: Dismissal persists across sessions
5. **Cross-page**: Dismiss on Inventory, navigate to Recipes (should show callout on Recipes)
6. **Clear data**: Browser settings → Clear browsing data → Callout reappears
7. **Mobile**: Test touch targets (44x44px), video responsive, no overflow
8. **Video playback**: YouTube controls work (play, pause, volume, fullscreen)

### Edge Cases
- localStorage blocked: Video should still work, dismiss just won't persist
- Env var missing: Graceful degradation (hide video button)
- YouTube blocked: Show fallback message
- Slow connection: Spinner while loading
```

## Agent Context Update

After Phase 1 design completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

**Technologies to add to agent context**:
- YouTube iframe embed API
- lucide-react icons library
- React portal-based modals
- localStorage React hooks (SSR-safe)

## Next Steps

1. **Complete Phase 0 Research** → Generate `research.md`
2. **Complete Phase 1 Design** → Generate `data-model.md`, `contracts/`, `quickstart.md`
3. **Update Agent Context** → Run update script
4. **Run /speckit.tasks** → Generate implementation tasks
5. **Execute tasks** → Implement feature

## Design Decisions

### Video Button Placement
**Decision**: Left side below page title (not below help button)
**Rationale**: User specified "on the left side with a video icon, right below the title section (for example, below my inventory or below my recipes)"
**Layout**:
```
[Page Title - My Inventory]
[Video Tutorial Button 🎬]  ← Always visible, left-aligned
[PageCallout section]
[Voice Input]
```

### Video Modal Width
**Decision**: Max 800px width, responsive with aspect-ratio 16:9
**Rationale**: User specified "should not take the entire width of the tab", mobile-first responsive
**Implementation**:
```css
max-width: 800px;
aspect-ratio: 16 / 9;
width: 100%;
padding: 1rem;
```

### Dismiss Button Clarity
**Decision**: Large X button (48x48px), contrasting orange/red color, bold "Dismiss Tutorial" text
**Rationale**: User specified "dismiss button should be crystal clear... really obvious"
**Visual**:
- Top-right of prominent callout
- Bold X icon (lucide-react X)
- Orange-500 background, black border
- Text label: "Dismiss Tutorial"
- Hover state: Darker orange with shadow shift

### Persistent Button Always Visible
**Decision**: Render persistent button regardless of dismissal state
**Rationale**: FR-003 "System MUST provide a persistent button that is ALWAYS visible"
**Behavior**:
- First-time users: See both prominent callout AND persistent button
- After dismissal: Only persistent button visible
- Both trigger same video modal

## Constitution Re-Check (Post-Design)

### ✅ All principles still compliant
- Named parameters used in hook: `useVideoDismissal({ storageKey })`
- Neobrutalism design: Bold borders, shadows, vibrant colors, uppercase text
- Mobile-first: Responsive sizing, adequate touch targets, no rotations on mobile
- SSR-safe: localStorage checks, error handling
- Type safety: All props typed, no `any` usage

**✅ APPROVED FOR IMPLEMENTATION**
