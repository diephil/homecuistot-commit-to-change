# Quick Start: Help Video Feature

**Branch**: `032-help-video` | **Date**: 2026-02-08
**Purpose**: Developer and QA guide for help video integration

## Prerequisites

- Node.js 18+ installed
- pnpm installed
- Repository cloned
- Access to YouTube video IDs

## Setup Guide

### 1. Environment Configuration

Add video IDs to your environment file:

```bash
# Navigate to Next.js app
cd apps/nextjs

# Copy environment template (if needed)
cp .env.local-template .env.local

# Add these lines to .env.local:
NEXT_PUBLIC_HELP_VIDEO_INVENTORY=MDo79VMVYmg
NEXT_PUBLIC_HELP_VIDEO_RECIPES=YgmZlurI5fA
```

**Video URLs**:
- Inventory: https://youtu.be/MDo79VMVYmg
- Recipes: https://youtu.be/YgmZlurI5fA

### 2. Install Dependencies

```bash
# From repo root
pnpm install

# Or from apps/nextjs
cd apps/nextjs && pnpm install
```

### 3. Start Development Server

```bash
# From repo root
make dev

# Or from apps/nextjs
cd apps/nextjs && pnpm dev
```

Navigate to: http://localhost:3000

## Feature Testing

### Test Scenario 1: First-Time User

**Steps**:
1. Clear browser data (localStorage)
   - Chrome: DevTools → Application → Storage → Clear site data
   - Firefox: DevTools → Storage → Local Storage → Right-click → Delete All
2. Navigate to http://localhost:3000/app/inventory
3. **Expected**:
   - ✅ Page title "My Inventory" visible
   - ✅ Persistent "Watch Tutorial" button below title (left side)
   - ✅ Prominent pink PageCallout with video CTA
   - ✅ Orange "Dismiss" button in top-right of callout

### Test Scenario 2: Video Playback

**Steps**:
1. Click "Watch Tutorial" on persistent button OR click video CTA in callout
2. **Expected**:
   - ✅ Modal opens with dark backdrop
   - ✅ YouTube video embedded (16:9 aspect ratio)
   - ✅ Video max width ~800px (doesn't take full tab width)
   - ✅ Video plays with YouTube controls (play, pause, volume, fullscreen)
3. Close modal by:
   - Clicking backdrop
   - Pressing Escape key
   - Clicking X button
4. **Expected**:
   - ✅ Modal closes smoothly
   - ✅ Page scroll restored

### Test Scenario 3: Dismiss Persistence

**Steps**:
1. On Inventory page, click orange "Dismiss" button
2. **Expected**:
   - ✅ Prominent callout disappears immediately
   - ✅ Persistent button still visible
3. Reload page (Cmd/Ctrl + R)
4. **Expected**:
   - ✅ Prominent callout stays hidden
   - ✅ Persistent button still visible
5. Check localStorage:
   ```javascript
   // Browser console
   localStorage.getItem("video:inventory:dismissed")
   // Should return: "true"
   ```

### Test Scenario 4: Cross-Page Independence

**Steps**:
1. On Inventory page, dismiss video callout
2. Navigate to http://localhost:3000/app/recipes
3. **Expected**:
   - ✅ Recipes page shows prominent callout (not dismissed yet)
   - ✅ Different video content (Recipes tutorial)
4. Dismiss on Recipes page
5. Navigate back to Inventory
6. **Expected**:
   - ✅ Both pages now show only persistent button

### Test Scenario 5: Responsive Mobile

**Steps**:
1. Open DevTools → Toggle device toolbar (mobile view)
2. Select iPhone 12 Pro or similar
3. Navigate to Inventory page
4. **Expected**:
   - ✅ Persistent button has 44x44px min touch target
   - ✅ Callout text readable, dismiss button easy to tap
5. Open video modal
6. **Expected**:
   - ✅ Video scales to screen width with padding
   - ✅ No horizontal overflow
   - ✅ Modal fills screen appropriately
   - ✅ YouTube controls touch-friendly

## Manual Testing Checklist

### Functional Tests

- [ ] **Persistent button always visible** (before and after dismissal)
- [ ] **Prominent callout shows on first visit**
- [ ] **Dismiss button hides callout**
- [ ] **Dismissal persists across page reloads**
- [ ] **Video modal opens from both CTAs** (button and callout)
- [ ] **Modal closes via backdrop click**
- [ ] **Modal closes via Escape key**
- [ ] **Modal closes via X button**
- [ ] **YouTube video plays with controls**
- [ ] **Video doesn't take full tab width** (max 800px)
- [ ] **Inventory and Recipes have separate dismissal states**

### Visual Tests (Neobrutalism)

- [ ] **Persistent button**: Thick border, box shadow, vibrant color
- [ ] **Dismiss button**: Orange, large (48x48px), bold X icon
- [ ] **Modal**: Border-4, box shadow, gradient background
- [ ] **Hover states**: Shadow shifts, translate movement
- [ ] **Typography**: Uppercase, font-black for headings

### Responsive Tests

- [ ] **Desktop** (1920x1080): Full layout, all shadows visible
- [ ] **Tablet** (768x1024): Scaled appropriately, touch targets adequate
- [ ] **Mobile** (375x667): No overflow, 44x44px min touch targets, readable text

### Browser Tests

- [ ] **Chrome** (latest): All features work
- [ ] **Firefox** (latest): All features work
- [ ] **Safari** (latest): All features work
- [ ] **Edge** (latest): All features work
- [ ] **iOS Safari**: Touch targets, video playback
- [ ] **Android Chrome**: Touch targets, video playback

## Edge Case Testing

### localStorage Disabled

**Steps**:
1. Disable localStorage (browser incognito mode)
2. Navigate to Inventory
3. **Expected**:
   - ✅ Callout shows (defaults to not dismissed)
   - ✅ Video button works
   - ✅ Dismiss button works
   - ⚠️ Dismissal doesn't persist (acceptable)

### Environment Variable Missing

**Steps**:
1. Remove `NEXT_PUBLIC_HELP_VIDEO_INVENTORY` from `.env.local`
2. Restart dev server
3. Navigate to Inventory
4. **Expected**:
   - ✅ No persistent button (graceful degradation)
   - ✅ No prominent callout
   - ✅ Page renders normally without video features

### YouTube Blocked

**Steps**:
1. Enable ad blocker that blocks YouTube embeds
2. Open video modal
3. **Expected**:
   - ⚠️ Modal opens but video doesn't load (defer to post-MVP)
   - ⚠️ Could show fallback message (defer to post-MVP)

### Slow Connection

**Steps**:
1. Chrome DevTools → Network → Throttling → Slow 3G
2. Open video modal
3. **Expected**:
   - ⚠️ Modal opens, video takes time to load (acceptable)
   - ⚠️ Loading spinner from YouTube iframe (defer if needed)

## Debugging Tips

### Video Not Showing

**Check**:
1. Environment variable set correctly:
   ```bash
   echo $NEXT_PUBLIC_HELP_VIDEO_INVENTORY
   ```
2. Dev server restarted after adding env vars
3. Browser console for errors

### Dismissal Not Persisting

**Check**:
1. localStorage in browser console:
   ```javascript
   localStorage.getItem("video:inventory:dismissed")
   ```
2. localStorage not blocked (check browser settings)
3. Correct storage key used (`"video:inventory:dismissed"` vs `"video:recipes:dismissed"`)

### Modal Not Closing

**Check**:
1. Backdrop click handler attached
2. Escape key listener registered
3. `onClose` prop passed correctly

### Video iframe Not Loading

**Check**:
1. YouTube not blocked (try in different browser)
2. Video ID correct (11 characters, alphanumeric)
3. Network tab for iframe request

## Development Commands

```bash
# Start development server
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build production
pnpm build

# Run tests (if written)
pnpm test
```

## localStorage Operations

### View Dismissal State

```javascript
// Browser console
localStorage.getItem("video:inventory:dismissed")
localStorage.getItem("video:recipes:dismissed")
```

### Reset Dismissal (for testing)

```javascript
// Browser console
localStorage.removeItem("video:inventory:dismissed")
localStorage.removeItem("video:recipes:dismissed")
// Reload page to see callout again
```

### Clear All localStorage

```javascript
// Browser console
localStorage.clear()
// Or: DevTools → Application → Storage → Clear site data
```

## Performance Benchmarks

### Expected Performance

- **Page load impact**: <500ms additional
- **Button render**: Instant (<16ms)
- **Modal open**: <100ms (smooth animation)
- **Video load**: 1-3s (network dependent)
- **localStorage read**: <2ms (negligible)

### Measuring Performance

```javascript
// Browser console
performance.mark('start');
// Perform action (e.g., open modal)
performance.mark('end');
performance.measure('action', 'start', 'end');
console.log(performance.getEntriesByName('action'));
```

## Known Issues & Workarounds

### Issue: localStorage in Private/Incognito Mode

**Behavior**: Dismissal doesn't persist across sessions
**Workaround**: This is expected behavior, acceptable for MVP
**Fix**: None needed (by design)

### Issue: YouTube iframe in Some Corporate Networks

**Behavior**: Video doesn't load due to firewall
**Workaround**: Users can view video directly on YouTube
**Fix**: Post-MVP - Show fallback link

## Next Steps

After testing:

1. **Fix any bugs found**
2. **Run `/speckit.tasks`** to generate implementation tasks
3. **Execute implementation**
4. **Final testing before deployment**

## Support

- **Feature Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Component Contracts**: [contracts/video-components.md](./contracts/video-components.md)
- **Data Model**: [data-model.md](./data-model.md)

## QA Sign-Off Checklist

- [ ] All functional tests passed
- [ ] All visual tests passed
- [ ] All responsive tests passed
- [ ] All browser tests passed
- [ ] Edge cases handled gracefully
- [ ] Performance meets benchmarks
- [ ] Ready for production deployment

**Tester**: _________________
**Date**: _________________
**Notes**: _________________
