# Research Findings: Help Video Integration

**Branch**: `032-help-video` | **Date**: 2026-02-08
**Purpose**: Research findings for implementing YouTube video tutorial embeds with dismissal state

## R1: YouTube Embed Best Practices

**Decision**: Use responsive iframe with aspect-ratio CSS, max-width constraint, and YouTube standard embed URL

**Rationale**:
- **Responsive sizing**: CSS `aspect-ratio: 16 / 9` maintains video proportions across devices
- **Max-width constraint**: `max-width: 800px` prevents full-tab width per user requirement
- **Standard embed URL**: `https://www.youtube.com/embed/{VIDEO_ID}` provides reliable playback
- **Privacy option available**: Can switch to `youtube-nocookie.com` if needed (defer to post-MVP)
- **Native lazy loading**: `loading="lazy"` attribute defers iframe load until visible

**Alternatives considered**:
- ❌ **YouTube Player API (JS)**: Overkill for simple embed, adds unnecessary complexity
- ❌ **Custom video player**: Not needed, YouTube embed provides all controls
- ❌ **Intersection Observer lazy load**: Native `loading="lazy"` simpler and sufficient

**Implementation Pattern**:
```tsx
<div className="relative w-full max-w-[800px]" style={{ aspectRatio: '16 / 9' }}>
  <iframe
    src={`https://www.youtube.com/embed/${videoId}`}
    title="Tutorial Video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    loading="lazy"
    className="absolute inset-0 w-full h-full border-4 border-black"
  />
</div>
```

**Key parameters omitted**:
- `?si=...` tracking parameter: Not needed, can be omitted
- `rel=0`: Deprecated, no longer effective in preventing related videos
- `modestbranding=1`: Deprecated, YouTube branding acceptable

## R2: Modal/Dialog Component Patterns in React 19

**Decision**: Follow existing codebase pattern - portal-based modal with `useState` and conditional rendering

**Rationale**:
- **Consistency**: Matches existing `HelpModal.tsx` and `ProposalConfirmationModal.tsx` patterns
- **SSR-safe**: Portal rendering with `createPortal` works with Next.js 16 SSR
- **Team familiarity**: Developers already understand this pattern
- **Proven working**: Pattern successfully used across multiple modals

**Alternatives considered**:
- ❌ **Native `<dialog>` element**: Modern but inconsistent with codebase, requires refactor of existing modals
- ❌ **Third-party library** (Radix, Headless UI): Adds dependency, codebase uses custom modals

**Existing pattern analysis** (from HelpModal.tsx):
```tsx
// State management
const [isOpen, setIsOpen] = useState(false);

// Portal rendering
{isOpen && createPortal(
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    {/* Modal content */}
    <div className="relative z-10 bg-white border-4 border-black">
      {/* Content */}
    </div>
  </div>,
  document.body
)}
```

**Required features**:
- ✅ Escape key handling: Add `useEffect` with keyboard listener
- ✅ Backdrop click to close: `onClick` on backdrop div
- ✅ Body scroll lock: Add `document.body.style.overflow = 'hidden'` on mount
- ✅ Focus trap: Optional for MVP, defer if time-constrained

## R3: localStorage React Hook Patterns (SSR-safe)

**Decision**: Use existing pattern from `inventory/page.tsx` (lines 34-63)

**Rationale**:
- **Already proven**: Pattern successfully used for multiple state values
- **SSR-safe**: `typeof window === "undefined"` check prevents server-side errors
- **Error-resilient**: `try/catch` handles privacy mode and localStorage blocking
- **Consistent**: Matches team conventions

**Pattern documented in spec** - No additional research needed

**Implementation** (encapsulated in custom hook):
```typescript
function useVideoDismissal(params: { storageKey: string }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      return localStorage.getItem(params.storageKey) === "true";
    } catch { return false; }
  });

  useEffect(() => {
    try {
      localStorage.setItem(params.storageKey, String(dismissed));
    } catch {}
  }, [dismissed, params.storageKey]);

  return {
    dismissed,
    dismiss: () => setDismissed(true),
    reset: () => setDismissed(false),
  };
}
```

## R4: lucide-react Icon Usage

**Decision**: Use `PlayCircle` icon for video tutorial button

**Rationale**:
- **Clear intent**: Circle with play triangle universally recognized as "play video"
- **Better than alternatives**:
  - `Play` alone: Too generic, could mean audio
  - `Video`: Looks like camera, implies recording not watching
  - `Youtube`: Brand-specific, might confuse users if we switch platforms
- **Size**: Use `size={24}` (desktop) and `size={20}` (mobile) for adequate visibility
- **Color**: Matches button background color, high contrast with border

**Implementation**:
```tsx
import { PlayCircle } from 'lucide-react';

<button className="...">
  <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
  <span>Watch Tutorial</span>
</button>
```

**Accessibility**:
- Icon is decorative (text label provides meaning)
- No `aria-label` needed on icon itself
- Button has clear text label

## R5: Dismiss Button UI Patterns

**Decision**: Large X button (48x48px) in top-right corner with contrasting orange color and "Dismiss" text label

**Rationale**:
- **Top-right placement**: Standard close button position, users expect it
- **Large size**: 48x48px desktop (44x44px mobile) ensures discoverability and touch-friendliness
- **Contrasting color**: Orange-500 background stands out against pink/cyan callout colors
- **Text label**: "Dismiss" clearer than just X icon, reduces ambiguity
- **Bold styling**: Thick border, uppercase text matches neobrutalist design

**Alternatives considered**:
- ❌ **Bottom-right "Got it" button**: Requires scrolling, less discoverable
- ❌ **Inline text link**: Not prominent enough, fails "crystal clear" requirement
- ❌ **Auto-dismiss after X seconds**: Removes user control, violates autonomy principle

**Visual hierarchy**:
1. **Primary**: Prominent callout with video CTA (pink background)
2. **Secondary**: Dismiss button (orange, top-right, bold)
3. **Tertiary**: Persistent video button (left side, below title)

**Implementation**:
```tsx
<button
  onClick={onDismiss}
  className="absolute top-4 right-4 bg-orange-500 border-4 border-black
    px-4 py-2 font-black uppercase text-sm
    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
    hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
    hover:translate-x-[2px] hover:translate-y-[2px]
    transition-all flex items-center gap-2"
  aria-label="Dismiss video tutorial"
>
  <X className="w-5 h-5" />
  <span className="hidden sm:inline">Dismiss</span>
</button>
```

**User feedback considered**:
- "dismiss button should be crystal clear" → Orange color, large size, bold text
- "really obvious" → Top-right standard position, high contrast

## Research Conclusion

**All unknowns resolved**:
- ✅ YouTube embed pattern: Responsive iframe with aspect-ratio CSS
- ✅ Modal pattern: Portal-based following existing HelpModal
- ✅ localStorage pattern: Documented in spec, proven working
- ✅ Icon choice: PlayCircle for video button, X for dismiss
- ✅ Dismiss UI: Top-right, 48x48px, orange, bold text

**Ready for Phase 1 design and implementation**

**No blocking issues identified**
