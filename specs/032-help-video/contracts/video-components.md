# Component Contracts: Help Video Integration

**Branch**: `032-help-video` | **Date**: 2026-02-08
**Purpose**: Interface contracts for video tutorial components

## Component Overview

```
Component Hierarchy:
├── VideoTutorialButton (Persistent, always visible)
├── VideoModal (Conditional, when open)
├── PageCalloutWithVideo (Conditional, when not dismissed)
└── useVideoDismissal (Hook, state management)
```

## 1. VideoTutorialButton

**File**: `src/components/shared/VideoTutorialButton.tsx`

**Purpose**: Persistent button that always remains visible for accessing video tutorial

### Interface

```typescript
interface VideoTutorialButtonProps {
  videoId: string;
  pageContext: "inventory" | "recipes";
  onOpen: () => void;
  className?: string;
}

export function VideoTutorialButton(props: VideoTutorialButtonProps): JSX.Element;
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `videoId` | `string` | Yes | YouTube video ID (11 characters) |
| `pageContext` | `"inventory" \| "recipes"` | Yes | Page context for analytics/styling |
| `onOpen` | `() => void` | Yes | Callback when button clicked |
| `className` | `string` | No | Additional Tailwind classes |

### Behavior

**Visibility**: Always visible, regardless of dismissal state

**Positioning**: Left side, below page title
```tsx
<div className="flex items-center justify-between">
  <h1>My Inventory</h1>
  <NeoHelpButton />
</div>
<VideoTutorialButton ... />  {/* Below title, left-aligned */}
```

**Interaction**:
- Click → Calls `onOpen()` to trigger video modal
- No navigation, no page reload
- Accessible via keyboard (Tab + Enter)

**Styling** (Neobrutalist):
```tsx
className="
  inline-flex items-center gap-2
  bg-cyan-400 hover:bg-cyan-500
  border-4 border-black
  px-4 py-2 md:px-6 md:py-3
  font-black uppercase text-sm md:text-base
  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
  hover:translate-x-[2px] hover:translate-y-[2px]
  transition-all
"
```

**Icon**: lucide-react `PlayCircle`
```tsx
<PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
<span>Watch Tutorial</span>
```

**Accessibility**:
- Button element with clear text label
- Icon is decorative (text provides meaning)
- Touch target: 44x44px minimum on mobile

**Example Usage**:
```tsx
<VideoTutorialButton
  videoId={process.env.NEXT_PUBLIC_HELP_VIDEO_INVENTORY!}
  pageContext="inventory"
  onOpen={() => setVideoModalOpen(true)}
/>
```

## 2. VideoModal

**File**: `src/components/shared/VideoModal.tsx`

**Purpose**: Modal dialog that displays embedded YouTube video

### Interface

```typescript
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
}

export function VideoModal(props: VideoModalProps): JSX.Element | null;
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | - | Controls modal visibility |
| `onClose` | `() => void` | Yes | - | Callback when modal closes |
| `videoId` | `string` | Yes | - | YouTube video ID to embed |
| `title` | `string` | No | `"Tutorial Video"` | Accessible title for iframe |

### Behavior

**Rendering**: Portal-based (follows `HelpModal` pattern)
```tsx
{isOpen && createPortal(
  <div className="fixed inset-0 z-50">...</div>,
  document.body
)}
```

**Close Triggers**:
- Click backdrop (dark overlay)
- Press Escape key
- Click close button (X in top-right)

**Body Scroll Lock**:
```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }
}, [isOpen]);
```

**Keyboard Handling**:
```tsx
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  if (isOpen) {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }
}, [isOpen, onClose]);
```

**Video Embed**:
```tsx
<div className="relative w-full max-w-[800px]" style={{ aspectRatio: '16 / 9' }}>
  <iframe
    src={`https://www.youtube.com/embed/${videoId}`}
    title={title}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    loading="lazy"
    className="absolute inset-0 w-full h-full border-4 border-black"
  />
</div>
```

**Styling** (Neobrutalist):
```tsx
// Backdrop
className="absolute inset-0 bg-black/70"

// Modal container
className="
  relative z-10 bg-gradient-to-br from-pink-200 to-cyan-200
  border-4 md:border-6 border-black
  shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
  p-4 md:p-6
  max-w-[90vw] md:max-w-[800px]
  w-full
"
```

**Accessibility**:
- Focus trap within modal (optional for MVP, defer if needed)
- Escape key closes modal
- Close button has `aria-label="Close video"`
- Iframe has descriptive title

**Example Usage**:
```tsx
<VideoModal
  isOpen={videoModalOpen}
  onClose={() => setVideoModalOpen(false)}
  videoId={process.env.NEXT_PUBLIC_HELP_VIDEO_INVENTORY!}
  title="Inventory Voice Input Tutorial"
/>
```

## 3. PageCalloutWithVideo

**File**: Enhance existing `src/components/shared/PageCallout.tsx`

**Purpose**: Prominent video CTA callout for first-time users with dismissal capability

### Interface

**Option A: Extend existing component** (Recommended)
```typescript
interface PageCalloutProps {
  emoji: string;
  title: string;
  description: string;
  bgColor?: 'cyan' | 'pink' | 'yellow' | 'orange';
  // NEW props for video variant:
  videoId?: string;
  onOpenVideo?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
}
```

**Option B: New component** (If existing PageCallout is heavily used)
```typescript
interface PageCalloutWithVideoProps {
  emoji: string;
  title: string;
  description: string;
  bgColor?: 'cyan' | 'pink' | 'yellow' | 'orange';
  videoId: string;
  onOpenVideo: () => void;
  onDismiss: () => void;
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `videoId` | `string` | Yes | YouTube video ID |
| `onOpenVideo` | `() => void` | Yes | Callback when video CTA clicked |
| `onDismiss` | `() => void` | Yes | Callback when dismiss button clicked |
| `showDismiss` | `boolean` | No (A), N/A (B) | Whether to show dismiss button |

### Behavior

**Visibility**: Conditional based on dismissal state
```tsx
{!videoDismissed && (
  <PageCalloutWithVideo ... onDismiss={dismiss} />
)}
```

**Video CTA Button**: Inline with description
```tsx
<div>
  <p>Describe what ingredients you have on hand.</p>
  <button onClick={onOpenVideo} className="underline font-bold">
    Watch how to use the microphone →
  </button>
</div>
```

**Dismiss Button**: Top-right corner, crystal clear
```tsx
<button
  onClick={onDismiss}
  className="
    absolute top-4 right-4
    bg-orange-500 hover:bg-orange-600
    border-4 border-black
    px-3 py-2 md:px-4 md:py-2
    font-black uppercase text-xs md:text-sm
    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
    hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
    hover:translate-x-[2px] hover:translate-y-[2px]
    transition-all
    flex items-center gap-1 md:gap-2
  "
  aria-label="Dismiss video tutorial"
>
  <X className="w-4 h-4 md:w-5 md:h-5" />
  <span className="hidden sm:inline">Dismiss</span>
</button>
```

**Layout Structure**:
```tsx
<div className="relative ...">
  {/* Dismiss button - absolute positioned */}
  <button onClick={onDismiss}>...</button>

  {/* Content */}
  <p className="font-semibold">{emoji} {title}</p>
  <div className="mt-1">
    <p>{description}</p>
    <button onClick={onOpenVideo}>Watch tutorial →</button>
  </div>
</div>
```

**Accessibility**:
- Dismiss button has clear `aria-label`
- Video CTA is a button (not just text link)
- Adequate spacing to avoid accidental clicks

**Example Usage**:
```tsx
<PageCalloutWithVideo
  emoji="🎤"
  title="Tell us what's in your fridge and pantry!"
  description="Describe what ingredients you have on hand."
  bgColor="pink"
  videoId={videoId}
  onOpenVideo={() => setVideoModalOpen(true)}
  onDismiss={dismiss}
/>
```

## 4. useVideoDismissal Hook

**File**: `src/lib/hooks/useVideoDismissal.ts`

**Purpose**: Custom hook for managing video dismissal state with localStorage persistence

### Interface

```typescript
function useVideoDismissal(params: {
  storageKey: "video:inventory:dismissed" | "video:recipes:dismissed";
}): {
  dismissed: boolean;
  dismiss: () => void;
  reset: () => void;
}
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `storageKey` | `"video:inventory:dismissed" \| "video:recipes:dismissed"` | Yes | localStorage key for this page |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `dismissed` | `boolean` | Current dismissal state |
| `dismiss` | `() => void` | Function to dismiss (set to true) |
| `reset` | `() => void` | Function to reset (set to false, for testing) |

### Implementation

```typescript
import { useState, useEffect } from 'react';

export function useVideoDismissal(params: {
  storageKey: string;
}) {
  // Initialize from localStorage (SSR-safe)
  const [dismissed, setDismissed] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      return localStorage.getItem(params.storageKey) === "true";
    } catch {
      return false;
    }
  });

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(params.storageKey, String(dismissed));
    } catch {
      // Silently fail if localStorage unavailable
    }
  }, [dismissed, params.storageKey]);

  return {
    dismissed,
    dismiss: () => setDismissed(true),
    reset: () => setDismissed(false),
  };
}
```

### Behavior

**SSR Safety**:
- Checks `typeof window === "undefined"` before localStorage access
- Returns `false` (not dismissed) during server-side rendering

**Error Handling**:
- Wraps localStorage access in `try/catch`
- Defaults to `false` if localStorage unavailable
- Silently fails on write errors (doesn't crash app)

**State Persistence**:
- Reads from localStorage on mount
- Writes to localStorage on every state change
- Uses `useEffect` for side effect management

**Example Usage**:
```tsx
function InventoryPage() {
  const { dismissed, dismiss } = useVideoDismissal({
    storageKey: "video:inventory:dismissed"
  });

  return (
    <>
      {!dismissed && (
        <PageCalloutWithVideo ... onDismiss={dismiss} />
      )}
      <VideoTutorialButton ... />
    </>
  );
}
```

## Integration Example

**Complete integration in page component**:

```tsx
import { useState } from 'react';
import { VideoTutorialButton } from '@/components/shared/VideoTutorialButton';
import { VideoModal } from '@/components/shared/VideoModal';
import { PageCalloutWithVideo } from '@/components/shared/PageCallout';
import { useVideoDismissal } from '@/lib/hooks/useVideoDismissal';

export default function InventoryPage() {
  // Video state management
  const videoId = process.env.NEXT_PUBLIC_HELP_VIDEO_INVENTORY;
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { dismissed, dismiss } = useVideoDismissal({
    storageKey: "video:inventory:dismissed"
  });

  if (!videoId) {
    console.warn("Video ID not configured");
    // Render page without video features
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Inventory</h1>
            <NeoHelpButton />
          </div>

          {/* Persistent video button - always visible */}
          {videoId && (
            <VideoTutorialButton
              videoId={videoId}
              pageContext="inventory"
              onOpen={() => setVideoModalOpen(true)}
            />
          )}

          {/* Prominent callout - only if not dismissed */}
          {!dismissed && videoId && (
            <PageCalloutWithVideo
              emoji="🎤"
              title="Tell us what's in your fridge and pantry!"
              description="Describe what ingredients you have on hand. Navigate to Cook Now to see what you can make with them."
              bgColor="pink"
              videoId={videoId}
              onOpenVideo={() => setVideoModalOpen(true)}
              onDismiss={dismiss}
            />
          )}
        </div>

        {/* Rest of page content */}
        {/* ... */}
      </div>

      {/* Video modal */}
      {videoId && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          videoId={videoId}
          title="Inventory Voice Input Tutorial"
        />
      )}
    </PageContainer>
  );
}
```

## Testing Contracts

### Unit Tests (Optional for MVP)

```typescript
describe('VideoTutorialButton', () => {
  it('renders with play icon and text');
  it('calls onOpen when clicked');
  it('has adequate touch target (44x44px)');
});

describe('VideoModal', () => {
  it('renders only when isOpen=true');
  it('calls onClose when backdrop clicked');
  it('calls onClose when Escape pressed');
  it('embeds YouTube video with correct ID');
});

describe('useVideoDismissal', () => {
  it('initializes from localStorage');
  it('persists dismiss action to localStorage');
  it('handles localStorage errors gracefully');
  it('returns false during SSR');
});
```

### Manual Test Scenarios

1. **Persistent button always visible**: Verify button appears regardless of dismissal state
2. **Prominent callout conditional**: Verify callout only shows when not dismissed
3. **Dismiss persists**: Dismiss, reload page, verify callout stays hidden
4. **Modal opens from both CTAs**: Click button and callout, both open modal
5. **Escape closes modal**: Press Esc, verify modal closes
6. **localStorage blocked**: Disable localStorage, verify graceful degradation

## Performance Requirements

- **Button render**: <16ms (instant)
- **Modal open**: <100ms (smooth animation)
- **Video load**: 1-3s (network dependent, acceptable)
- **localStorage read/write**: <2ms (negligible)

## Breaking Changes

None - All new components, no modifications to existing component interfaces (except optional PageCallout enhancement).

## Deprecation Notice

None - This is a new feature with no deprecated patterns.
