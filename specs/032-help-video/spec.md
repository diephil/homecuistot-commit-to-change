# Feature Specification: Help Video Integration for Microphone Feature

**Feature Branch**: `032-help-video`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "In the My Recipes and Inventory tab, I want to add a help/demo video that users can access anytime and that attracts their attention so they understand how to use the microphone before trying it.

I'll upload videos (probably to YouTube) that should be embedded in the website. When a user clicks a video, it should open embedded on the site so they can watch directly how to use the microphone.I think I want to replace the 'Tell us what's in your fridge and pantry' CTA or the banner with the video by the 'Show video' option or a call to action that explains they'll be seeing a video explaining how to use it.

It should be the same for the My Recipe tab."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User accesses help video anytime (Priority: P1)

A user arrives at the My Inventory or My Recipes page and sees a persistent "Watch Tutorial" button below the page title. They can click this button at any time to watch the video and understand how the microphone feature works. The video opens in a modal and plays embedded directly on the page.

**Why this priority**: This is the core value proposition - reducing confusion and increasing successful use of the microphone feature through always-available video guidance. Without this, users may be confused about how to use the voice input feature.

**Independent Test**: Can be fully tested by navigating to My Inventory or My Recipes page, verifying the "Watch Tutorial" button appears below the title, clicking it to open the video modal, and confirming the video plays embedded.

**Acceptance Scenarios**:

1. **Given** a user visits My Inventory page, **When** the page loads, **Then** they see a persistent "Watch Tutorial" button below the page title
2. **Given** a user clicks the "Watch Tutorial" button, **When** the video modal opens, **Then** the video plays embedded directly on the page without navigating away
3. **Given** a user is watching the embedded video, **When** the video is playing, **Then** they can pause, play, adjust volume, and see standard video player controls
4. **Given** a user closes the video modal, **When** they return to the page, **Then** the "Watch Tutorial" button is still visible and accessible
5. **Given** a user navigates between pages or reloads, **When** they return, **Then** the "Watch Tutorial" button remains always visible

---

### User Story 2 - Video modal closes properly (Priority: P1)

A user opens the video tutorial modal and can close it using multiple methods (X button, Escape key, backdrop click). After closing, they can re-open it at any time using the persistent button.

**Why this priority**: Essential for good user experience - users need intuitive ways to close the modal and confidence they can access it again when needed.

**Independent Test**: Can be fully tested by opening the video modal and verifying all close methods work (X button, Escape, backdrop), then confirming the button remains accessible to re-open.

**Acceptance Scenarios**:

1. **Given** a user opens the video modal, **When** they click the X button, **Then** the modal closes and they return to the page
2. **Given** a user opens the video modal, **When** they press the Escape key, **Then** the modal closes
3. **Given** a user opens the video modal, **When** they click outside the modal (backdrop), **Then** the modal closes
4. **Given** a user closes the video modal, **When** they click the "Watch Tutorial" button again, **Then** the modal opens and video plays normally

---

### User Story 3 - User accesses video on both Inventory and Recipes pages (Priority: P1)

A user navigates between My Inventory and My Recipes pages and sees the persistent "Watch Tutorial" button on both pages. Each page offers context-appropriate video guidance for using the microphone feature in that specific context (Inventory video on Inventory page, Recipes video on Recipes page).

**Why this priority**: Ensures feature consistency across both main pages where voice input is available, providing a unified user experience and reducing confusion.

**Independent Test**: Can be fully tested by navigating to both pages and verifying the "Watch Tutorial" button appears on each page with the correct video.

**Acceptance Scenarios**:

1. **Given** a user is on the My Inventory page, **When** they click "Watch Tutorial", **Then** they see the Inventory-specific video tutorial
2. **Given** a user is on the My Recipes page, **When** they click "Watch Tutorial", **Then** they see the Recipes-specific video tutorial
3. **Given** a user navigates between pages, **When** they view each page, **Then** the "Watch Tutorial" button is consistently positioned below the page title on both pages

---

### Edge Cases

- What happens when the YouTube video link becomes unavailable or deleted?
  - System should handle video load errors gracefully with fallback message
  - Consider showing alternative help text if video fails to load

- How does the video player behave on mobile devices?
  - Should adapt to mobile screen sizes
  - Should respect mobile data preferences (warn before auto-playing on cellular)
  - Video controls should be touch-friendly

- What happens when a user has their browser set to block embedded content?
  - Should detect blocking and show alternative text instructions
  - Provide fallback link to open video in new tab

- What if multiple video URLs need to be configured (different videos for Inventory vs Recipes)?
  - System should support separate video URLs per page context
  - Configuration should be easily updatable without code changes

- How does the video interface affect page load performance?
  - Embedded video should load asynchronously to avoid blocking page render
  - Consider lazy-loading the video iframe until user clicks to play

- What happens if a user's browser blocks modals or popups?
  - System should gracefully handle cases where modal rendering fails
  - Ensure the application doesn't break if modal cannot be displayed

- Should dismissal persist across user accounts on the same device?
  - Yes, localStorage is device/browser-specific, not user-account-specific
  - If a different user logs in on the same browser, they'll see the dismissed state
  - This is acceptable given localStorage limitations

- How do we handle server-side rendering with localStorage checks?
  - Must check for browser environment (`typeof window !== "undefined"`) before accessing localStorage
  - Follow existing codebase pattern for SSR-safe localStorage access

- Should the persistent button be visible even when the prominent PageCallout is shown?
  - Yes, both can coexist for first-time users
  - Both access the same video player/modal
  - Provides flexibility in how users access the tutorial
  - Persistent button ensures tutorial is never "lost" after dismissal

- Where should the persistent button be positioned?
  - Should be easily discoverable but not intrusive
  - Possible locations: near the microphone input, in the page header next to help (?), or as part of a collapsed/minimal PageCallout
  - Should maintain consistent position regardless of dismissal state

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a prominent video tutorial CTA in the PageCallout section on My Inventory page for first-time users (no dismissal recorded)
- **FR-002**: System MUST display a prominent video tutorial CTA in the PageCallout section on My Recipes page for first-time users (no dismissal recorded)
- **FR-003**: System MUST provide a persistent "Watch tutorial" button/link that is ALWAYS visible on both pages, regardless of dismissal state
- **FR-004**: System MUST embed YouTube videos (or similar video platform) directly within the website interface without requiring external navigation
- **FR-005**: Users MUST be able to open the video player by clicking either the prominent PageCallout CTA or the persistent button
- **FR-006**: System MUST display standard video player controls (play, pause, volume, fullscreen)
- **FR-007**: Users MUST be able to dismiss the prominent PageCallout video tutorial
- **FR-008**: System MUST persist user dismissal preference in browser local storage using the existing pattern (e.g., `"video:inventory:dismissed"`, `"video:recipes:dismissed"`)
- **FR-009**: System MUST hide the prominent PageCallout for users who have dismissed it, while keeping the persistent button visible
- **FR-010**: System MUST allow users to re-watch the video at any time by clicking the persistent button, even after dismissal
- **FR-011**: System MUST support configurable video URLs that can be updated without code deployment
- **FR-012**: System MUST handle video load failures gracefully with appropriate error messaging
- **FR-013**: System MUST provide responsive video player layout that works on mobile, tablet, and desktop devices
- **FR-014**: System MUST support separate video URLs and dismissal states for Inventory and Recipes contexts
- **FR-015**: System MUST handle server-side rendering safely by checking for browser environment before accessing local storage

### Key Entities

- **Video Configuration**: Contains video platform URL (YouTube), video ID, page context (inventory/recipes), display settings
- **Video Player Component**: Embeddable component that handles video iframe rendering, controls, error states, and responsive layout (modal or inline)
- **Dismissal State**: Browser localStorage values tracking whether user has dismissed the prominent tutorial for each page context (keys: `"video:inventory:dismissed"`, `"video:recipes:dismissed"`)
- **Prominent PageCallout**: Modified or replaced PageCallout component that displays video CTA to first-time users, with dismissal capability. Hidden after dismissal.
- **Persistent Video Button**: Always-visible button/link that allows users to access the video tutorial at any time, regardless of dismissal state. Never hidden.
- **Video Tutorial Display Logic**: Component state management that:
  - Checks dismissal status on mount
  - Conditionally renders prominent PageCallout based on dismissal state
  - Always renders persistent button regardless of dismissal state
  - Opens same video player from either entry point

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access and watch the help video in under 3 clicks from arriving at My Inventory or My Recipes page
- **SC-002**: Video player loads and begins playback within 3 seconds on standard broadband connections
- **SC-003**: First-time voice input success rate increases by 25% after video feature implementation (measured by successful transcription without errors on first attempt)
- **SC-004**: Support tickets related to "how to use microphone" decrease by 40% after video feature deployment
- **SC-005**: Video CTA click-through rate reaches at least 30% among first-time users within the first session
- **SC-006**: Video player works correctly on mobile devices (iOS/Android), tablets, and desktop browsers (Chrome, Firefox, Safari, Edge)
- **SC-007**: Page load time increases by no more than 500ms with embedded video component present

## Assumptions

- **Video Platform**: YouTube will be used as the primary video hosting platform due to its reliability, embed support, and widespread compatibility
- **Video Content**: Product team will create and upload separate tutorial videos for Inventory and Recipes features showing microphone usage
- **Configuration Method**: Video URLs will be stored in environment variables or database configuration table for easy updates
- **User Behavior**: Users will benefit more from video demonstration than text-only instructions for understanding voice input mechanics
- **Technical Constraints**: Modern browsers with HTML5 video support and iframe embedding capabilities are assumed
- **Accessibility**: YouTube's built-in accessibility features (captions, keyboard controls) will satisfy basic accessibility requirements
- **Mobile Data**: Users on mobile devices accept the data usage implications of streaming video content
- **localStorage Pattern**: Implementation will follow the existing codebase pattern for localStorage state management (as seen in `inventory/page.tsx` with keys like `"inventory:showEmptyOnly"` and `"inventory:groupByCategory"`)
- **SSR Safety**: Implementation will include browser environment checks (`typeof window !== "undefined"`) before accessing localStorage, following existing patterns
- **Dismissal Scope**: Video tutorial dismissal is per-page (Inventory and Recipes track separately), not global across the application

## Dependencies

- **External Dependency**: YouTube video hosting service availability and embed API stability
- **Content Dependency**:
  - ✅ My Recipes tutorial video provided (`YgmZlurI5fA`)
  - ✅ My Inventory tutorial video provided (`MDo79VMVYmg`)
  - All content ready for implementation
- **UI Component**: May require modifications to existing PageCallout component or creation of new video modal/player component
- **Configuration System**: Requires mechanism to store and retrieve video URLs (environment variables recommended: `NEXT_PUBLIC_HELP_VIDEO_RECIPES`, `NEXT_PUBLIC_HELP_VIDEO_INVENTORY`)

## Out of Scope

- **Video Creation**: Recording, editing, and producing the actual tutorial video content is not part of this implementation
- **Video Analytics**: Detailed tracking of video watch time, completion rates, or user engagement metrics beyond basic click-through
- **Multi-language Support**: Translated or dubbed versions of tutorial videos for different languages
- **Custom Video Player**: Building a custom video player instead of using YouTube's embed functionality
- **Video Transcripts**: Providing text transcripts or captions beyond what YouTube automatically provides
- **Video Versioning**: Managing multiple versions of tutorial videos or A/B testing different video content
- **Offline Video Access**: Downloading or caching videos for offline viewing

## Video Configuration

### Provided Video URLs

**My Recipes Tutorial**:
- YouTube URL: `https://youtu.be/YgmZlurI5fA`
- Video ID: `YgmZlurI5fA`
- Embed URL: `https://www.youtube.com/embed/YgmZlurI5fA`

**My Inventory Tutorial**:
- YouTube URL: `https://youtu.be/MDo79VMVYmg`
- Video ID: `MDo79VMVYmg`
- Embed URL: `https://www.youtube.com/embed/MDo79VMVYmg`

### YouTube Embed Code Reference

**My Recipes Tutorial**:
```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/YgmZlurI5fA?si=wldRZbd5oh0d9IVY"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen>
</iframe>
```

**My Inventory Tutorial**:
```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/MDo79VMVYmg?si=4b2ZnTsdEn4x6c7f"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen>
</iframe>
```

**Key embed parameters**:
- Base embed URL format: `https://www.youtube.com/embed/{VIDEO_ID}`
- Optional query parameter: `?si=wldRZbd5oh0d9IVY` (YouTube tracking, can be omitted)
- Recommended attributes: `allowfullscreen`, `frameborder="0"`
- Privacy-enhanced mode option: `https://www.youtube-nocookie.com/embed/{VIDEO_ID}` (alternative domain for better privacy)

### Environment Variable Configuration

**Recommended approach**:
```bash
# apps/nextjs/.env.local
NEXT_PUBLIC_HELP_VIDEO_RECIPES=YgmZlurI5fA
NEXT_PUBLIC_HELP_VIDEO_INVENTORY=MDo79VMVYmg
```

**Usage in components**:
```typescript
const recipesVideoId = process.env.NEXT_PUBLIC_HELP_VIDEO_RECIPES;
const embedUrl = `https://www.youtube.com/embed/${recipesVideoId}`;
```

## Implementation Reference

### Existing localStorage Pattern to Follow

The codebase has an established pattern for managing localStorage state in React components. The implementation MUST follow this pattern:

**Reference file**: `apps/nextjs/src/app/(protected)/app/inventory/page.tsx` (lines 34-63)

**Key naming convention**:
- Use namespace prefixes: `"video:inventory:dismissed"`, `"video:recipes:dismissed"`
- Similar to existing patterns: `"inventory:showEmptyOnly"`, `"homecuistot:story-completed"`

**React pattern**:
```typescript
// State initialization with SSR safety and error handling
const [videoDismissed, setVideoDismissed] = useState(() => {
  try {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("video:inventory:dismissed") === "true";
  } catch { return false; }
});

// Persist state changes
useEffect(() => {
  try {
    localStorage.setItem("video:inventory:dismissed", String(videoDismissed));
  } catch {}
}, [videoDismissed]);
```

**Important details**:
- Use lazy initialization `useState(() => { ... })` to prevent SSR issues
- Always check `typeof window === "undefined"` before accessing localStorage
- Wrap in try/catch to handle localStorage access errors (privacy mode, disabled storage)
- Store boolean values as strings: `"true"` or `"false"`
- Use `String()` when setting values to ensure consistent string storage

**Dismissal keys**:
- Inventory page: `"video:inventory:dismissed"`
- Recipes page: `"video:recipes:dismissed"`

**Reset mechanism**:
When implementing the "Reset User Data" feature, add these keys to the cleanup in `ResetUserDataButton.tsx`:
```typescript
localStorage.removeItem('video:inventory:dismissed')
localStorage.removeItem('video:recipes:dismissed')
```
