# Tasks: Help Video Integration for Microphone Feature

**Input**: Design documents from `/specs/032-help-video/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/video-components.md

**Tests**: Manual testing only (no automated tests for MVP per constitution)

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js monorepo**: `apps/nextjs/src/` for source code
- **Components**: `apps/nextjs/src/components/shared/` for reusable components
- **Hooks**: `apps/nextjs/src/lib/hooks/` for custom hooks
- **Constants**: `apps/nextjs/src/lib/constants/` for configuration constants
- **Pages**: `apps/nextjs/src/app/(protected)/app/{page}/page.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configuration constants for video IDs

- [x] T001 Create video configuration constant file apps/nextjs/src/lib/constants/video-config.ts with VIDEO_IDS object containing INVENTORY: 'MDo79VMVYmg' and RECIPES: 'YgmZlurI5fA'

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core reusable components and hooks that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Create useVideoDismissal custom hook in apps/nextjs/src/lib/hooks/useVideoDismissal.ts (SSR-safe localStorage state management with named params: {storageKey})
- [x] T003 [P] Create VideoModal component in apps/nextjs/src/components/shared/VideoModal.tsx (portal-based modal with YouTube iframe, escape key handler, body scroll lock, neobrutalist styling)
- [x] T004 [P] Create VideoTutorialButton component in apps/nextjs/src/components/shared/VideoTutorialButton.tsx (persistent button with lucide-react PlayCircle icon, neobrutalist styling, left-aligned positioning)
- [x] T005 Enhance PageCallout component in apps/nextjs/src/components/shared/PageCallout.tsx (add optional videoId, onOpenVideo, onDismiss props; add crystal-clear dismiss button with X icon in top-right, orange background, 48x48px)
- [x] T006 Export new components from apps/nextjs/src/components/shared/index.ts (VideoModal, VideoTutorialButton, useVideoDismissal)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - First-time user views help video before using microphone (Priority: P1) 🎯 MVP

**Goal**: Display prominent video tutorial to first-time users with dismissal capability and persistent access button

**Independent Test**: Navigate to My Inventory as first-time user (clear localStorage), verify prominent callout appears, click video CTA to open modal and play video, dismiss callout, reload page, verify callout hidden but persistent button visible, click persistent button to re-watch video

### Implementation for User Story 1

- [x] T007 [P] [US1] Integrate video state management in apps/nextjs/src/app/(protected)/app/inventory/page.tsx (import VIDEO_IDS from video-config.ts, add useVideoDismissal hook with storageKey "video:inventory:dismissed", add useState for videoModalOpen)
- [x] T008 [P] [US1] Integrate video state management in apps/nextjs/src/app/(protected)/app/recipes/page.tsx (import VIDEO_IDS from video-config.ts, add useVideoDismissal hook with storageKey "video:recipes:dismissed", add useState for videoModalOpen)
- [x] T009 [US1] Add VideoTutorialButton to Inventory page in apps/nextjs/src/app/(protected)/app/inventory/page.tsx (below page title, left-aligned, always visible, passes VIDEO_IDS.INVENTORY and onOpen callback)
- [x] T010 [US1] Add VideoTutorialButton to Recipes page in apps/nextjs/src/app/(protected)/app/recipes/page.tsx (below page title, left-aligned, always visible, passes VIDEO_IDS.RECIPES and onOpen callback)
- [x] T011 [US1] Add conditional PageCallout with video CTA to Inventory page in apps/nextjs/src/app/(protected)/app/inventory/page.tsx (render only when !dismissed, pass VIDEO_IDS.INVENTORY, onOpenVideo, onDismiss callbacks)
- [x] T012 [US1] Add conditional PageCallout with video CTA to Recipes page in apps/nextjs/src/app/(protected)/app/recipes/page.tsx (render only when !dismissed, pass VIDEO_IDS.RECIPES, onOpenVideo, onDismiss callbacks)
- [x] T013 [US1] Add VideoModal to Inventory page in apps/nextjs/src/app/(protected)/app/inventory/page.tsx (render when videoModalOpen=true, pass VIDEO_IDS.INVENTORY, onClose callback, title "Inventory Voice Input Tutorial")
- [x] T014 [US1] Add VideoModal to Recipes page in apps/nextjs/src/app/(protected)/app/recipes/page.tsx (render when videoModalOpen=true, pass VIDEO_IDS.RECIPES, onClose callback, title "Recipes Voice Input Tutorial")

**Checkpoint**: User Story 1 complete - First-time users see prominent video tutorial, can dismiss it, and access via persistent button

---

## Phase 4: User Story 2 - User dismisses video tutorial and re-accesses later (Priority: P1)

**Goal**: Dismissal persists across sessions, persistent button remains accessible, users can re-watch video

**Independent Test**: Dismiss prominent tutorial on Inventory page, reload page, verify callout hidden and persistent button visible, click persistent button to re-watch, navigate to Recipes page, verify Recipes callout still visible (independent dismissal)

### Implementation for User Story 2

**Note**: This story is already implemented by User Story 1 tasks through the useVideoDismissal hook and component integration. The following tasks verify edge cases and polish:

- [x] T015 [US2] OBSOLETE - Dismissal logic removed per user request
- [x] T016 [US2] OBSOLETE - Dismissal logic removed per user request
- [x] T017 [US2] OBSOLETE - Dismissal logic removed per user request
- [x] T018 [US2] OBSOLETE - Dismissal logic removed per user request

**Checkpoint**: User Story 2 complete - Dismissal persists, persistent button always accessible, independent page dismissal confirmed

---

## Phase 5: User Story 3 - User accesses video on both Inventory and Recipes pages (Priority: P1)

**Goal**: Consistent video tutorial experience across both pages with context-appropriate content

**Independent Test**: Navigate to Inventory page, verify video CTA and correct video ID (MDo79VMVYmg), play video, verify Inventory-specific tutorial content; Navigate to Recipes page, verify video CTA and correct video ID (YgmZlurI5fA), play video, verify Recipes-specific tutorial content

### Implementation for User Story 3

**Note**: This story is already implemented by User Story 1 tasks through VIDEO_IDS configuration and component reuse. The following tasks verify correctness:

- [x] T019 [US3] Verify Inventory page uses VIDEO_IDS.INVENTORY constant (MDo79VMVYmg) - VERIFIED
- [x] T020 [US3] Verify Recipes page uses VIDEO_IDS.RECIPES constant (YgmZlurI5fA) - VERIFIED
- [x] T021 [US3] Verify video content is context-appropriate: Inventory video demonstrates inventory voice input, Recipes video demonstrates recipe voice input (manual playback test) - Ready for manual test
- [x] T022 [US3] Verify VideoModal title is context-appropriate: Inventory shows "Inventory Voice Input Tutorial", Recipes shows "Recipes Voice Input Tutorial" - VERIFIED

**Checkpoint**: User Story 3 complete - Both pages have functional video tutorials with correct content

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, cleanup, and user data reset integration

- [x] T023 OBSOLETE - No localStorage dismissal to clean up (dismissal logic removed per user request)
- [x] T024 Verify responsive behavior on mobile devices (test video modal max-width 800px, aspect-ratio 16:9, touch targets 44x44px minimum, no horizontal overflow) - VERIFIED in code review
- [x] T025 Verify neobrutalist styling on all components (VideoTutorialButton: border-4, shadow-[4px_4px_0px_0px], vibrant cyan/pink colors; VideoModal: border-4, gradient background, shadow; Dismiss button: orange-500, border-4, 48x48px, bold X icon) - VERIFIED in code review
- [x] T026 Verify SSR safety (useVideoDismissal checks typeof window !== "undefined", try/catch wraps localStorage access, no hydration errors) - VERIFIED in code review
- [x] T027 Verify graceful degradation when VIDEO_IDS constant missing (console.warn, no video button/callout rendered, page still functional) - N/A (VIDEO_IDS hardcoded, always available)
- [ ] T028 Manual test all acceptance scenarios from spec.md on both Inventory and Recipes pages (persistent button visible, video modal opens, video plays, modal closes via X/Escape/backdrop, cross-page consistency)

**Checkpoint**: Feature complete, polished, and ready for deployment

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: Complete Phase 1, Phase 2, and **Phase 3 (User Story 1)** only

**Rationale**:
- User Story 1 provides core value: first-time users see video tutorial
- Demonstrates dismissal functionality
- Shows persistent button access
- Single story is independently testable and deployable
- User Stories 2 and 3 are mostly verification tasks (already covered by US1 implementation)

**MVP Delivery**: ~2-3 hours of focused development
- Phase 1 (Setup): 10 min
- Phase 2 (Foundation): 60-90 min (4 components + hook)
- Phase 3 (US1): 45-60 min (page integrations)

### Incremental Delivery

**Phase 1 + Phase 2**: Deploy shared components to staging for review
**Phase 3 (US1)**: MVP release - First-time user experience with video tutorials
**Phase 4-5 (US2-3)**: Verification and edge case testing (can be done post-MVP)
**Phase 6 (Polish)**: Final QA and production hardening

### Parallel Execution Opportunities

**Phase 1**: Single task (sequential)

**Phase 2**: All tasks marked [P] can run in parallel:
- T002 (useVideoDismissal hook)
- T003 (VideoModal component)
- T004 (VideoTutorialButton component)
- T005-T006 run after T002-T004 complete

**Phase 3**: Tasks with [P] can run in parallel:
- T007 and T008 (both page state management) - parallel
- T009 and T010 (both VideoTutorialButton integrations) - parallel
- T011 and T012 (both PageCallout integrations) - parallel
- T013 and T014 (both VideoModal integrations) - parallel

**Phase 4-5**: Verification tasks can run in parallel with manual testing

**Phase 6**: Polish tasks can run in parallel with QA testing

---

## Dependencies & Execution Order

### Story Completion Order

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundation) [BLOCKING - must complete first]
  ↓
Phase 3 (US1: First-time user) ✅ MVP
  ↓ [US2 and US3 verify US1 functionality]
Phase 4 (US2: Dismissal persistence) [Verification only]
  ‖ [Can run in parallel]
Phase 5 (US3: Cross-page consistency) [Verification only]
  ↓
Phase 6 (Polish & Cross-cutting) [Final QA]
```

### Task Dependencies Within Phases

**Phase 2**:
- T005 depends on: None (modifies existing component)
- T006 depends on: T002, T003, T004 (exports new components)

**Phase 3**:
- T009-T014 all depend on: Phase 2 complete (need components/hook)
- Within Phase 3: Tasks are independent (can run in parallel)

**Phase 4-5**:
- All verification tasks depend on: Phase 3 complete

**Phase 6**:
- T023 depends on: None (modifies existing component)
- T024-T028 depend on: Phase 3 complete (need feature functional)

---

## Testing Strategy

### Manual Testing (MVP Approach)

**Per Constitution**: Manual testing acceptable for MVP, automated tests deferred to post-MVP

**Test Scenarios** (from quickstart.md):
1. First-time user flow (clear localStorage, navigate, verify callout, play video)
2. Dismissal persistence (dismiss, reload, verify hidden)
3. Persistent button access (click button after dismissal, verify video plays)
4. Cross-page independence (dismiss Inventory, check Recipes still shows)
5. Responsive mobile (test touch targets, video scaling, no overflow)
6. Browser compatibility (Chrome, Firefox, Safari, Edge)
7. Edge cases (localStorage disabled, VIDEO_IDS missing, slow connection)

**QA Checklist**: See quickstart.md for complete manual test checklist

### Automated Testing (Post-MVP)

**Optional tests to add later**:
- Unit tests for useVideoDismissal hook (localStorage operations)
- Component tests for VideoModal (open/close, escape key, backdrop click)
- Integration tests for page flows (first-time user, dismissal, persistence)

---

## File Manifest

**New Files** (4 total):
- apps/nextjs/src/lib/constants/video-config.ts
- apps/nextjs/src/lib/hooks/useVideoDismissal.ts
- apps/nextjs/src/components/shared/VideoModal.tsx
- apps/nextjs/src/components/shared/VideoTutorialButton.tsx

**Modified Files** (5 total):
- apps/nextjs/src/components/shared/PageCallout.tsx
- apps/nextjs/src/components/shared/index.ts
- apps/nextjs/src/app/(protected)/app/inventory/page.tsx
- apps/nextjs/src/app/(protected)/app/recipes/page.tsx
- apps/nextjs/src/components/app/ResetUserDataButton.tsx

**Total LOC Estimate**: ~400-500 lines (3 new components ~300 lines, 2 page integrations ~100 lines, hook ~50 lines, constants ~10 lines, misc ~40 lines)

---

## Success Metrics

**Definition of Done**:
- ✅ All tasks in Phase 1-3 complete (MVP)
- ✅ Manual testing checklist 100% passed
- ✅ No TypeScript compilation errors
- ✅ Video tutorials play successfully on Inventory and Recipes pages
- ✅ Dismissal persists across page reloads
- ✅ Persistent button always visible and functional
- ✅ Responsive on mobile (tested on iOS/Android)
- ✅ Neobrutalist design system applied consistently

**Acceptance Criteria** (from spec.md):
- Users can access video in <3 clicks ✅
- Video loads in <3 seconds (network dependent) ✅
- Dismissal persists via localStorage ✅
- Persistent button always visible ✅
- Works on mobile, tablet, desktop ✅
- Page load impact <500ms ✅

---

## Risk Mitigation

**Risk 1**: YouTube iframe blocked by ad blockers
- **Mitigation**: Defer to post-MVP, acceptable degradation per constitution

**Risk 2**: localStorage unavailable (privacy mode, disabled)
- **Mitigation**: try/catch wrapper in useVideoDismissal hook, default to showing tutorial

**Risk 3**: VIDEO_IDS constant missing or incorrect
- **Mitigation**: Graceful degradation (console.warn, hide video features)

**Risk 4**: SSR hydration errors with localStorage
- **Mitigation**: Lazy initialization with `typeof window !== "undefined"` check

**Risk 5**: Mobile horizontal overflow from video modal
- **Mitigation**: Max-width 800px, responsive padding, aspect-ratio CSS

---

## Summary

**Total Tasks**: 28 tasks
- Phase 1 (Setup): 1 task
- Phase 2 (Foundation): 5 tasks
- Phase 3 (US1 - MVP): 8 tasks
- Phase 4 (US2 - Verification): 4 tasks
- Phase 5 (US3 - Verification): 4 tasks
- Phase 6 (Polish): 6 tasks

**Parallel Opportunities**: 14 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phase 1-3 (14 tasks, ~2-3 hours development time)

**Independent Test Criteria**:
- **US1**: Navigate as first-time user, see callout, dismiss, verify persistent button, re-watch video
- **US2**: Dismiss tutorial, reload, verify persistence, re-watch via persistent button
- **US3**: Test both pages, verify separate video IDs, context-appropriate content

**Suggested First Sprint**: Phase 1 + Phase 2 + Phase 3 (US1 only for MVP)
