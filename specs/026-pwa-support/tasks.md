# Tasks: PWA Support

**Input**: Design documents from `/specs/026-pwa-support/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Not requested - manual browser testing only

**Organization**: All user stories (Install, Fullscreen, Splashscreen) are achieved by the same manifest configuration, so tasks are organized by file rather than story.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify icons are in place

- [x] T001 Verify icon files exist in apps/nextjs/public/icons/ (icon-192x192.png, icon-512x512.png, apple-touch-icon.png, favicon.ico)

---

## Phase 2: Implementation

**Purpose**: Create manifest and update metadata - achieves all 3 user stories

### Web App Manifest (US1 + US2 + US3)

- [x] T002 Create web app manifest in apps/nextjs/src/app/manifest.ts with name, icons, display:standalone, theme_color, background_color

### Layout Metadata (US1 + US2 + US3)

- [x] T003 [P] Update metadata in apps/nextjs/src/app/layout.tsx adding appleWebApp config and icons

**Checkpoint**: All PWA configuration complete

---

## Phase 3: Verification

**Purpose**: Validate PWA works on target platforms

- [x] T004 Run local dev server and verify manifest loads at /manifest.webmanifest
- [ ] T005 [P] Run Chrome Lighthouse PWA audit and verify installability passes
- [ ] T006 [P] Test install on Android Chrome - verify icon, name, fullscreen, splashscreen
- [ ] T007 [P] Test install on iOS Safari - verify icon, name, fullscreen

**Checkpoint**: All success criteria validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify icons exist
- **Implementation (Phase 2)**: Depends on Setup - create config files
- **Verification (Phase 3)**: Depends on Implementation - test on devices

### Parallel Opportunities

- T003 can run in parallel with T002 (different files)
- T005, T006, T007 can run in parallel (different test targets)

---

## Parallel Example

```bash
# Implementation tasks (different files):
Task: "Create web app manifest in apps/nextjs/src/app/manifest.ts"
Task: "Update metadata in apps/nextjs/src/app/layout.tsx"

# Verification tasks (different platforms):
Task: "Run Chrome Lighthouse PWA audit"
Task: "Test install on Android Chrome"
Task: "Test install on iOS Safari"
```

---

## Implementation Strategy

### MVP (All Stories at Once)

This feature is simple enough that all user stories are achieved together:

1. Complete T001 (verify icons)
2. Complete T002 + T003 (manifest + metadata)
3. Complete T004-T007 (verification)
4. **Done** - all 3 user stories working

### User Story Mapping

| Task | US1 (Install) | US2 (Fullscreen) | US3 (Splash) |
|------|---------------|------------------|--------------|
| T002 manifest.ts | ✅ icons, name | ✅ display:standalone | ✅ background_color |
| T003 layout.tsx | ✅ appleWebApp | ✅ appleWebApp | - |

---

## Notes

- Total tasks: 7
- Parallel opportunities: 5 tasks can run in parallel in groups
- No tests needed - manual browser verification
- Icons already prepared - just verify existence
- Single implementation delivers all 3 user stories
