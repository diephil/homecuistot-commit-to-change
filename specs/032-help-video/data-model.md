# Data Model: Help Video Integration

**Branch**: `032-help-video` | **Date**: 2026-02-08
**Purpose**: Data structures and state management for video tutorial feature

## Overview

This feature uses **client-side only** data storage (no database changes). State is managed through:
1. Browser `localStorage` for dismissal persistence
2. Environment variables for video configuration
3. React component state for UI interactions

## Entity Definitions

### 1. Video Dismissal State (localStorage)

**Storage Keys**:
```typescript
"video:inventory:dismissed": "true" | "false"
"video:recipes:dismissed": "true" | "false"
```

**Characteristics**:
- **Type**: String (localStorage only stores strings)
- **Values**: `"true"` (dismissed) or `"false"` (not dismissed or missing)
- **Scope**: Per-browser, per-device (not synced across devices)
- **Lifetime**: Persistent until user clears browser data
- **Default**: Missing key = `false` (not dismissed, show prominent callout)

**Access Pattern**:
```typescript
// Read
const dismissed = localStorage.getItem("video:inventory:dismissed") === "true";

// Write
localStorage.setItem("video:inventory:dismissed", "true");

// Reset (for testing/debugging)
localStorage.removeItem("video:inventory:dismissed");
```

**Business Rules**:
- Each page (Inventory, Recipes) tracks dismissal independently
- Dismissal is permanent until user clears browser data
- Missing localStorage access defaults to `false` (show callout)

### 2. Video Configuration (Environment Variables)

**Variables**:
```bash
NEXT_PUBLIC_HELP_VIDEO_INVENTORY="MDo79VMVYmg"
NEXT_PUBLIC_HELP_VIDEO_RECIPES="YgmZlurI5fA"
```

**Characteristics**:
- **Type**: String (YouTube video ID, 11 characters)
- **Scope**: Build-time configuration, same across all clients
- **Lifetime**: Static until redeployment
- **Validation**: Required at build time (app should gracefully handle missing)

**Access Pattern**:
```typescript
const videoId = process.env.NEXT_PUBLIC_HELP_VIDEO_INVENTORY;
if (!videoId) {
  console.error("Missing video configuration");
  return null; // Don't render video button
}
```

**Business Rules**:
- Must start with `NEXT_PUBLIC_` for client-side access
- Video IDs must be valid YouTube video IDs
- If missing, gracefully degrade (hide video features)

### 3. Component State (React useState)

#### Page-Level State

```typescript
interface VideoPageState {
  videoDismissed: boolean;      // From localStorage via hook
  videoModalOpen: boolean;      // Modal display state
  videoId: string | undefined;  // From env var
}
```

**State Transitions**:
```
[Initial Mount]
  ↓
videoDismissed ← localStorage.getItem("video:{page}:dismissed") === "true"
videoModalOpen ← false
videoId ← process.env.NEXT_PUBLIC_HELP_VIDEO_{PAGE}
  ↓
[Render Decision]
  ↓
if (!videoDismissed) → Show prominent callout + persistent button
if (videoDismissed) → Show persistent button only
  ↓
[User Interaction: Click Video CTA]
  ↓
videoModalOpen ← true
  ↓
[Modal Displayed]
  ↓
[User Closes Modal or Presses Esc]
  ↓
videoModalOpen ← false
  ↓
[User Clicks Dismiss on Prominent Callout]
  ↓
videoDismissed ← true
localStorage.setItem("video:{page}:dismissed", "true")
  ↓
[Re-render]
  ↓
if (videoDismissed) → Hide prominent callout, keep persistent button
```

#### Hook State (useVideoDismissal)

```typescript
interface VideoDismissalHookState {
  dismissed: boolean;
  dismiss: () => void;
  reset: () => void;
}
```

**Internal Logic**:
```typescript
function useVideoDismissal(params: { storageKey: string }) {
  // Initialize from localStorage (SSR-safe)
  const [dismissed, setDismissed] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      return localStorage.getItem(params.storageKey) === "true";
    } catch { return false; }
  });

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(params.storageKey, String(dismissed));
    } catch {}
  }, [dismissed, params.storageKey]);

  return {
    dismissed,
    dismiss: () => setDismissed(true),
    reset: () => setDismissed(false),  // For testing
  };
}
```

## State Relationships

### Data Flow Diagram

```
┌─────────────────────┐
│ Environment Var     │ NEXT_PUBLIC_HELP_VIDEO_INVENTORY
│ (Build Time)        │ NEXT_PUBLIC_HELP_VIDEO_RECIPES
└──────┬──────────────┘
       │ Read at runtime
       ↓
┌─────────────────────┐
│ Page Component      │ Inventory page.tsx
│ (Runtime)           │ Recipes page.tsx
└──────┬──────────────┘
       │ Uses
       ↓
┌─────────────────────┐
│ useVideoDismissal   │ Custom hook
│ Hook                │ storageKey param
└──────┬──────────────┘
       │ Reads/Writes
       ↓
┌─────────────────────┐
│ localStorage        │ Browser storage
│ (Persistent)        │ video:{page}:dismissed
└─────────────────────┘
```

### Component Hierarchy

```
[Page Component] (inventory/page.tsx or recipes/page.tsx)
  ├─ useVideoDismissal() → { dismissed, dismiss }
  ├─ useState(videoModalOpen) → boolean
  │
  ├─ VideoTutorialButton (Always visible)
  │   └─ onClick → setVideoModalOpen(true)
  │
  ├─ if (!dismissed):
  │   └─ PageCalloutWithVideo (Prominent callout)
  │       ├─ onClick video CTA → setVideoModalOpen(true)
  │       └─ onClick dismiss → dismiss()
  │
  └─ VideoModal (Conditional render)
      └─ if (videoModalOpen) → Show YouTube iframe
```

## Validation Rules

### Environment Variables
- **Required**: Must be present at build time
- **Format**: 11-character YouTube video ID (alphanumeric, hyphens, underscores)
- **Validation**: Graceful degradation if missing (hide video features)

### localStorage Keys
- **Format**: `"video:{page}:dismissed"` where `{page}` is "inventory" or "recipes"
- **Values**: Only `"true"` or `"false"` strings
- **Error Handling**: Catch localStorage access errors, default to `false`

### Component Props
- **videoId**: Must be non-empty string if provided
- **storageKey**: Must match pattern `"video:{page}:dismissed"`
- **onClose/onOpen**: Must be valid function references

## Edge Cases & Error Handling

### localStorage Unavailable
- **Cause**: Privacy mode, browser settings, storage quota exceeded
- **Handling**: `try/catch` wrapper, default to `dismissed=false`
- **Impact**: Video tutorial shows on every visit, dismiss doesn't persist
- **User Experience**: Acceptable degradation (MVP principle)

### Environment Variable Missing
- **Cause**: `.env.local` not configured, typo in variable name
- **Handling**: Check for `undefined`, don't render video button
- **Impact**: No video tutorial available on that page
- **User Experience**: Graceful degradation (no error shown)

### YouTube iframe Blocked
- **Cause**: Ad blocker, corporate firewall, YouTube down
- **Handling**: Browser handles this (iframe won't load)
- **Impact**: Empty modal or broken iframe
- **User Experience**: Defer to post-MVP (show fallback message)

### Multiple Tabs Open
- **Cause**: User opens Inventory page in two tabs
- **Handling**: Each tab independently reads/writes localStorage
- **Impact**: Dismissal in one tab reflects in other tab on reload
- **User Experience**: Expected behavior (localStorage is shared)

## Performance Considerations

### localStorage Access
- **Frequency**: Once per page load (read), once per dismiss (write)
- **Performance**: ~1-2ms per operation (negligible)
- **Optimization**: Not needed for MVP

### Environment Variable Access
- **Frequency**: Once per page load
- **Performance**: Instant (resolved at build time)
- **Optimization**: Not needed

### YouTube iframe Load
- **Frequency**: Only when modal opens
- **Performance**: 1-3 seconds (network dependent)
- **Optimization**: Use `loading="lazy"` attribute (implemented in research)

## Migration & Cleanup

### Adding New Video Pages
1. Add new environment variable: `NEXT_PUBLIC_HELP_VIDEO_{PAGE}=videoId`
2. Add new localStorage key: `"video:{page}:dismissed"`
3. Update `ResetUserDataButton.tsx` to clear new key

### Removing Feature
1. Remove environment variables from `.env.local`
2. Remove localStorage keys (or leave for future use)
3. Remove components and hook

### Data Cleanup (ResetUserDataButton)
```typescript
// Add to ResetUserDataButton.tsx cleanup:
localStorage.removeItem('video:inventory:dismissed')
localStorage.removeItem('video:recipes:dismissed')
```

## Testing Strategy

### Unit Testing (Optional for MVP)
```typescript
// Test useVideoDismissal hook
describe('useVideoDismissal', () => {
  it('initializes from localStorage');
  it('persists dismiss action to localStorage');
  it('handles localStorage errors gracefully');
});
```

### Manual Testing (Required)
1. Fresh browser (no localStorage) → Callout visible
2. Click dismiss → Callout hidden, button visible
3. Reload page → Callout still hidden
4. Clear browser data → Callout reappears
5. Open in incognito → Callout visible (no localStorage)
6. Test on mobile → Touch targets adequate

## Summary

**Data Storage**:
- localStorage: 2 keys (dismissal state)
- Environment variables: 2 keys (video IDs)
- React state: 2 booleans per page (dismissed, modalOpen)

**No Database Changes Required**: Purely client-side feature

**State Persistence**: localStorage provides cross-session persistence

**Error Resilience**: Graceful degradation if localStorage unavailable
