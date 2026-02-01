# Tasks: Homepage Messaging Revamp

**Input**: Design documents from `/specs/022-homepage-revamp/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Manual testing only per MVP constitution. No automated tests required for copy-only change.

**Organization**: Tasks grouped by user story (P1-P3) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Target file**: `apps/nextjs/src/app/page.tsx` (single-file modification)
- **Test scenarios**: `specs/022-homepage-revamp/quickstart.md`

---

## Phase 1: Setup (Preparation)

**Purpose**: Validate environment and understand current state

- [ ] T001 Verify Next.js dev server runs successfully: `cd apps/nextjs && pnpm dev`
- [ ] T002 Verify TypeScript compilation passes: `cd apps/nextjs && pnpm tsc --noEmit`
- [ ] T003 [P] Create backup branch of current homepage for comparison: `git branch 022-homepage-backup`
- [ ] T004 [P] Review research.md findings on messaging hierarchy and content strategy

**Checkpoint**: Development environment ready, baseline established

---

## Phase 2: Foundational (No Blocking Prerequisites)

**Purpose**: N/A - This feature has no foundational infrastructure requirements

**Reason**: Single-file copy change, no shared infrastructure, no blocking dependencies

**Checkpoint**: Proceed directly to User Story 1

---

## Phase 3: User Story 1 - First-Time Visitor Immediately Understands Core Value (Priority: P1) 🎯 MVP

**Goal**: Visitor understands core value proposition ("shows what I can cook with what I have") within 3-5 seconds of landing on homepage

**Independent Test**: Show homepage to 10 new users, ask "What does this app do?" - 8+ should articulate "shows what I can cook with what I have" without mentioning voice/AI first

### Implementation for User Story 1

- [ ] T005 [US1] Update hero section subheadline to "See what you can cook tonight — instantly. No browsing, no guessing, no mental math." in apps/nextjs/src/app/page.tsx (line ~50)
- [ ] T006 [US1] Update problem section headline to "The problem isn't cooking — it's deciding what to cook" in apps/nextjs/src/app/page.tsx (line ~71)
- [ ] T007 [US1] Update problem section body with emotional decision fatigue narrative in apps/nextjs/src/app/page.tsx (lines ~74-84): Paragraph 1: "You come home tired and hungry. You open the fridge, stare at the shelves, and draw a blank. You *know* you have food in there. You *know* how to cook. But figuring out what you can actually make with what you have? That's exhausting. So you order takeout — again." Paragraph 2: "That decision fatigue is the real enemy. Not the cooking itself."
- [ ] T008 [US1] Remove "Sound familiar?" button/callout from problem section in apps/nextjs/src/app/page.tsx (lines ~79-82)
- [ ] T009 [US1] Verify hero headline "From 'What's in my fridge?' to 'What's for dinner?'" remains unchanged in apps/nextjs/src/app/page.tsx (line ~47-48)

**Manual Testing** (from quickstart.md):
- [ ] T010 [US1] Load homepage on mobile (375px) and desktop (1440px), verify subheadline visible above fold
- [ ] T011 [US1] Verify no voice-first messaging in hero section (value proposition comes first)
- [ ] T012 [US1] Verify problem section emotional narrative renders correctly on mobile (no wall of text)
- [ ] T013 [US1] User test (optional): Show to 3 colleagues for 5 seconds, ask "What does this app do?"

**Checkpoint**: P1 messaging complete - visitor should immediately grasp core value

---

## Phase 4: User Story 2 - Visitor Understands Target Audience Match (Priority: P2)

**Goal**: Visitor self-identifies whether app is for them (experienced cooks vs recipe-seekers)

**Independent Test**: Survey 20 visitors after reading "This isn't a recipe app" section - 90%+ experienced cooks say "this is for me", 70%+ recipe-seekers say "this isn't what I need"

### Implementation for User Story 2

- [ ] T014 [US2] Add new section "This isn't a recipe app" between "How It Works" and final CTA in apps/nextjs/src/app/page.tsx (after line ~156, before line ~159): Use same section structure pattern (border-4/6/8, gradient background, py-12/28, relative overflow-hidden)
- [ ] T015 [US2] Add section headline "You know your recipes. We track what's possible." in new section: Use Text component with "text-3xl md:text-6xl font-black uppercase text-center mb-4 md:mb-6 md:transform md:-rotate-1" classes
- [ ] T016 [US2] Add section body with two paragraphs in new section: Paragraph 1: "You don't need step-by-step instructions for the carbonara you've made a hundred times. You don't need precise measurements — you know what 'some garlic' means." Paragraph 2: "What you need is a quick answer to one question: *Can I make it tonight with what I have?* That's all we do. You're the chef. We're just the inventory clerk."
- [ ] T017 [US2] Style new section with gradient background (choose from: pink-to-yellow, cyan-to-blue, or orange gradient to maintain variety) and decorative shapes in apps/nextjs/src/app/page.tsx
- [ ] T018 [US2] Update "How It Works" Card 2 copy to "Tell us the recipes you've already mastered — the ones you could cook in your sleep. 'I can make carbonara, stir-fry, shakshuka...' You know the steps. We just need to know what's in your repertoire." in apps/nextjs/src/app/page.tsx (lines ~138-140)

**Manual Testing** (from quickstart.md):
- [ ] T019 [US2] Verify new section exists and renders correctly between "How It Works" and final CTA
- [ ] T020 [US2] Verify headline "You know your recipes. We track what's possible." uses correct styling
- [ ] T021 [US2] Verify section body includes both paragraphs with correct copy
- [ ] T022 [US2] Verify mobile layout (375px) - no overflow, readable paragraphs, section follows design patterns
- [ ] T023 [US2] User test (optional): Show to 2 experienced cooks + 2 recipe-seekers, ask "Is this for you?"

**Checkpoint**: P2 messaging complete - target audience self-qualification working

---

## Phase 5: User Story 3 - Visitor Understands Voice is a Feature, Not the Product (Priority: P3)

**Goal**: Visitor understands voice is convenience feature (hands full, brain tired) not primary selling point

**Independent Test**: Show homepage to 15 users, ask "What's the main feature?" - 12+ answer "shows what I can cook" rather than "voice assistant"

### Implementation for User Story 3

- [ ] T024 [US3] Update "How It Works" headline to "Three steps. Zero typing." in apps/nextjs/src/app/page.tsx (line ~94-95)
- [ ] T025 [US3] Update "How It Works" subheadline to "Voice-powered because your hands are full and your brain is tired." in apps/nextjs/src/app/page.tsx (line ~97-98)
- [ ] T026 [US3] Update Card 1 headline to "Say what you have" in apps/nextjs/src/app/page.tsx (line ~123-125)
- [ ] T027 [US3] Update Card 1 body to "Just got back from the store? Tap the mic: 'I got chicken, eggs, pasta, and some tomatoes.' Done. Your inventory is updated before you've put the bags away. No typing, no scanning barcodes." in apps/nextjs/src/app/page.tsx (lines ~126-128)
- [ ] T028 [US3] Update Card 2 headline to "Add your dishes" in apps/nextjs/src/app/page.tsx (line ~135-137) (already done in T018, verify only)
- [ ] T029 [US3] Update Card 3 headline to "See what's cookable" in apps/nextjs/src/app/page.tsx (line ~147-149)
- [ ] T030 [US3] Update Card 3 body to "Open the app → see which of your dishes you can make right now with what's in your kitchen. Pick one and start cooking. The thinking is done." in apps/nextjs/src/app/page.tsx (lines ~150-152)

**Manual Testing** (from quickstart.md):
- [ ] T031 [US3] Verify "How It Works" headline reads "Three steps. Zero typing."
- [ ] T032 [US3] Verify "How It Works" subheadline reads "Voice-powered because your hands are full and your brain is tired."
- [ ] T033 [US3] Verify all 3 cards updated with correct headlines and body copy
- [ ] T034 [US3] Verify voice framed as convenience (hands full, no typing) not primary feature in all cards
- [ ] T035 [US3] User test (optional): Show to 5 users, ask "What's the main feature?" - expect "shows what I can cook"

**Checkpoint**: P3 messaging complete - voice positioned as method not product

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, removals, and final validation across all user stories

### Content Removals
- [ ] T036 Remove demo video placeholder section (black box with "Demo Video Coming Soon") from apps/nextjs/src/app/page.tsx (lines ~101-116)
- [ ] T037 Remove header logo subtitle "(French: 'Home Chef')" from apps/nextjs/src/app/page.tsx (lines ~20-22)
- [ ] T038 Verify removing video placeholder didn't break layout (check section spacing, no empty gaps)

### Final CTA Updates
- [ ] T039 Update final CTA headline to "Cook more. Order less." in apps/nextjs/src/app/page.tsx (line ~162-163)
- [ ] T040 Update final CTA subheadline to "Every meal you cook instead of ordering is a win. We're here to remove the one barrier that makes takeout feel easier: the thinking." in apps/nextjs/src/app/page.tsx (line ~165-166)
- [ ] T041 Update final CTA button text to "Get Started — It Takes 2 Minutes" in apps/nextjs/src/app/page.tsx (line ~169)

### Visual Preservation Validation
- [ ] T042 [P] Verify all gradients preserved (header, hero, problem, how-it-works, new section, final CTA) across all breakpoints
- [ ] T043 [P] Verify all borders preserved (border-4/6/8, border-black) in apps/nextjs/src/app/page.tsx
- [ ] T044 [P] Verify all shadows preserved (shadow-[Npx_Npx_0px_0px_rgba(0,0,0,1)]) in apps/nextjs/src/app/page.tsx
- [ ] T045 [P] Verify all rotations still desktop-only (md:rotate-2, md:-rotate-1, etc.) in apps/nextjs/src/app/page.tsx
- [ ] T046 [P] Verify responsive typography scaling (text-3xl md:text-6xl patterns) in apps/nextjs/src/app/page.tsx
- [ ] T047 Verify header Login/Go to App buttons unchanged in apps/nextjs/src/app/page.tsx (lines ~26-31)
- [ ] T048 Verify footer unchanged in apps/nextjs/src/app/page.tsx (lines ~176-183)

### Responsive Testing
- [ ] T049 Test mobile (375px iPhone SE): All sections readable, no horizontal scroll, buttons tappable (44x44px)
- [ ] T050 Test tablet (768px iPad): Layout transitions correctly, borders/shadows increase, rotations still hidden
- [ ] T051 Test desktop (1440px): Full design with rotations, largest typography, all styling preserved

### Performance Validation
- [ ] T052 Run Lighthouse mobile audit (Slow 3G throttling): Verify First Contentful Paint <1.8s, Largest Contentful Paint <2.5s
- [ ] T053 Verify no new assets added (images, fonts, scripts) - text-only change
- [ ] T054 Verify DOM size reduced by ~10-15 nodes (video placeholder removal)

### Final Validation
- [ ] T055 Run TypeScript compilation: `cd apps/nextjs && pnpm tsc --noEmit` (expect exit code 0)
- [ ] T056 Run build: `cd apps/nextjs && pnpm build` (expect success)
- [ ] T057 Run linting (optional): `cd apps/nextjs && pnpm lint` (warnings OK per constitution)
- [ ] T058 Execute all manual test scenarios from quickstart.md across all user stories (P1-P3)
- [ ] T059 Take before/after screenshots for visual regression comparison (mobile, tablet, desktop)
- [ ] T060 Review quickstart.md success criteria checklist for completeness

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A - no foundational work required
- **User Stories (Phase 3-5)**: Can all proceed independently, no cross-story dependencies
  - **P1 (US1)**: Hero + Problem section updates - can start immediately after setup
  - **P2 (US2)**: New section + Card 2 update - can start immediately after setup (independent of US1)
  - **P3 (US3)**: "How It Works" section updates - can start immediately after setup (independent of US1/US2)
- **Polish (Phase 6)**: Best done after all user stories complete, but removals (T036-T037) and CTA updates (T039-T041) can be done in parallel with user stories

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - completely independent
- **User Story 2 (P2)**: No dependencies - completely independent (Card 2 update in same section as US3 but different content)
- **User Story 3 (P3)**: No dependencies - completely independent

**All user stories are independently implementable and testable** - true parallel execution possible

### Within Each User Story

- **US1**: T005-T009 can be done in any order (different sections), T010-T013 testing after implementation
- **US2**: T014-T018 sequential (section creation first, then content), T019-T023 testing after
- **US3**: T024-T030 can be done in any order (different cards/headlines), T031-T035 testing after

### Parallel Opportunities

- **Setup Phase**: T003 and T004 can run in parallel
- **All User Stories**: US1, US2, US3 can all be implemented in parallel (no dependencies)
- **Polish Phase**: T036-T041 can run in parallel with visual validation tasks (T042-T048)
- **Responsive Testing**: T049, T050, T051 can run in parallel
- **Final Validation**: T055-T057 can run in parallel

---

## Parallel Example: All User Stories

```bash
# Since all user stories are independent, launch them in parallel:

# Developer A (or Claude session 1):
Task: "Update hero + problem sections (US1: T005-T009)"

# Developer B (or Claude session 2):
Task: "Add new 'This isn't a recipe app' section (US2: T014-T018)"

# Developer C (or Claude session 3):
Task: "Update 'How It Works' section (US3: T024-T030)"

# All three can work simultaneously without conflicts (different sections of same file)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Skip Phase 2 (no foundational work)
3. Complete Phase 3: User Story 1 (T005-T013)
4. **STOP and VALIDATE**: Test US1 independently (quickstart.md P1 scenarios)
5. Optional: Deploy/demo with just US1 messaging changes

**Why US1 is MVP**: It addresses the most critical conversion issue - visitors bouncing because they don't understand core value within 3-5 seconds. US1 alone delivers measurable impact (SC-001, SC-002).

### Incremental Delivery (Recommended)

1. Complete Setup (T001-T004) → Environment ready
2. Add User Story 1 (T005-T013) → Test independently → **Deploy/Demo** (MVP with P1 messaging!)
3. Add User Story 2 (T014-T023) → Test independently → **Deploy/Demo** (Now with target audience clarification)
4. Add User Story 3 (T024-T035) → Test independently → **Deploy/Demo** (Complete messaging hierarchy)
5. Add Polish (T036-T060) → Full validation → **Final Deploy**

Each increment adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers (or parallel Claude sessions):

1. Complete Setup together (T001-T004)
2. Once Setup done, split work:
   - **Session A**: User Story 1 (T005-T013) - Hero + Problem sections
   - **Session B**: User Story 2 (T014-T023) - New section
   - **Session C**: User Story 3 (T024-T035) - How It Works section
3. All sessions work on apps/nextjs/src/app/page.tsx simultaneously but editing different line ranges (minimal merge conflicts)
4. Merge in priority order: US1 → US2 → US3
5. Complete Polish together (T036-T060)

---

## Notes

### Task Execution Guidelines

- **[P] tasks**: Different sections of file, no dependencies, can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability and independent testing
- **File path**: All tasks modify `apps/nextjs/src/app/page.tsx` (single-file change)
- **Line numbers**: Approximate guides from current version, may shift as content updates
- **Commit strategy**: Commit after each user story phase (T013, T023, T035) for easy rollback

### Testing Approach (Per Constitution)

- **Manual testing sufficient** for MVP copy-only change
- **No automated tests required** (test infrastructure exists but not needed)
- **User testing optional** but valuable for validation (10-20 user surveys)
- **Focus on acceptance scenarios** from spec.md (P1-P3)

### Visual Design Constraints

- **Preserve all styling**: Gradients, borders, shadows, rotations, typography
- **Mobile-first**: Rotations only on md+ breakpoints to prevent overflow
- **Responsive typography**: Use existing patterns (text-3xl md:text-6xl)
- **Section structure**: Follow existing pattern for new section (border, gradient, padding, decorative shapes)

### Performance Constraints

- **<2s load time**: Target from SC-006, verify with Lighthouse
- **No new assets**: Text-only change maintains or improves performance
- **DOM reduction**: Removing video placeholder reduces complexity

### Rollback Plan

- **Git revert**: Single commit per user story enables granular rollback
- **No database migrations**: No schema changes to coordinate
- **No API changes**: Static content only, no backend coordination needed

### Success Criteria Mapping

- **SC-001** (80% comprehension): Validated by US1 testing (T010-T013)
- **SC-002** (20% bounce reduction): Analytics post-deploy, all stories contribute
- **SC-003** (90% target match): Validated by US2 testing (T019-T023)
- **SC-004** (15% CTR increase): Analytics post-deploy, CTA updates in Polish (T039-T041)
- **SC-005** (30% engagement increase): Analytics post-deploy, US1 problem section narrative
- **SC-006** (<2s load time): Validated by performance testing (T052-T054)
