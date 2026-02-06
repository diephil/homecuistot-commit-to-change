# Tasks: Landing Page Revamp

**Input**: Design documents from `/specs/029-landing-page-revamp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested. Manual visual testing per MVP phase constitution.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create directory structure for the new landing component domain

- [ ] T001 Create `src/components/landing/` directory in `apps/nextjs/`

---

## Phase 2: Foundational (Reusable Component)

**Purpose**: Build the LandingRecipeCard component FIRST (per user directive: create reusable components before using them)

- [ ] T002 Create `LandingRecipeCard` component in `apps/nextjs/src/components/landing/LandingRecipeCard.tsx` with props interface `{ name, description, ingredients: Array<{ name, type: 'anchor' | 'optional', available: boolean }>, status: 'cookable' | 'almost' | 'missing' }`. Implement: status-based background gradient (cookable=green-200/300, almost=yellow-200/300, missing=gray-100/200), status badge at top-right (cookable="Ready tonight" green, almost="Missing N" yellow, missing="Missing N" gray) using `Badge` from `@/components/shared`, recipe name (`text-xl font-black truncate`), description (`text-sm font-bold text-black/70 line-clamp-2`), ingredient list as flex-wrap of `Badge` components (available=`bg-white/50` outline, missing=`bg-red-200 text-red-800`), anchor star indicator (amber for anchor, gray for optional). Neo-brutal card frame: `border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`. No interactivity. Static read-only presentation.

**Checkpoint**: LandingRecipeCard component ready to be consumed by page.tsx

---

## Phase 3: User Story 1 - First-Time Visitor Understands Product Value (Priority: P1)

**Goal**: Rewrite hero, reframe, anti-positioning, and final CTA sections with new positioning copy. Visitor immediately understands HomeCuistot is NOT a recipe app.

**Independent Test**: Load homepage, verify hero eyebrow "Not a recipe app.", headline, subheadline, and all CTAs link to `/login`. Verify anti-positioning two-column comparison renders correctly with mobile-first HomeCuistot column order.

### Implementation for User Story 1

- [ ] T003 [US1] Rewrite Section 1 (Hero) in `apps/nextjs/src/app/page.tsx`: Replace eyebrow with "Not a recipe app." (yellow chip, `inline-block bg-yellow-300 border-2 border-black px-4 md:px-6 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:rotate-2`), headline with "Your kitchen already knows what&rsquo;s for dinner" via `<Text as="h2">`, subheadline with "You have 15 go-to dishes and a fridge full of ingredients. HomeCuistot connects the two.", CTA with "Start with your recipes &rarr;" linking to `/login`
- [ ] T004 [US1] Rewrite Section 2 (Reframe) in `apps/nextjs/src/app/page.tsx`: Replace "problem" section. Headline: "You know those 10&ndash;15 dinners you rotate through?" Body: "The ones you could make in your sleep? HomeCuistot is the only app that starts there &mdash; with your dishes, not someone else&rsquo;s. Tell it what you cook, keep your kitchen updated, and it shows you which of your meals are ready tonight." Same white card with neo-brutal styling.
- [ ] T005 [US1] Add Section 3 (Anti-Positioning) in `apps/nextjs/src/app/page.tsx`: NEW section after Reframe. Background `bg-gradient-to-br from-cyan-300 via-blue-300 to-cyan-300`. Title "What makes this different". Two-column grid (`grid-cols-1 md:grid-cols-2`). Left column "Recipe Apps" (gray-100, gray-400 text, line-through items). Right column "HomeCuistot" (green-200/300, positive items). HomeCuistot column uses `order-first` for mobile-first display. Knockout line below: "Your dishes. Your inventory. Suggestions from strangers, never."
- [ ] T006 [US1] Rewrite Section 7 (Final CTA) in `apps/nextjs/src/app/page.tsx`: Headline "Your dishes. Your kitchen. Always knowing what&rsquo;s for dinner." Body "Every meal you cook instead of ordering is a win. We just remove the thinking." CTA "Start with your recipes &rarr;" linking to `/login`

**Checkpoint**: Sections 1, 2, 3, 7 complete. Core positioning message delivered. All CTAs link to `/login`.

---

## Phase 4: User Story 4 - Visitor Understands How It Works (Priority: P2)

**Goal**: Update How It Works section with new copy emphasizing dishes-first, voice-powered flow.

**Independent Test**: Verify section title "Three steps. Your voice. That's it." and three cards with updated step copy.

### Implementation for User Story 4

- [ ] T007 [US4] Rewrite Section 4 (How It Works) in `apps/nextjs/src/app/page.tsx`: Background `bg-gradient-to-br from-orange-300 via-orange-400 to-orange-300`. Title "Three steps. Your voice. That&rsquo;s it." Subtitle "Your hands are full and your brain is tired. Just talk." Card 1 (pink): "Tell us what you cook" / "I make carbonara, stir-fry, shakshuka... Add the dishes you already know by voice." Card 2 (yellow): "Keep your kitchen current" / "I just bought eggs, parmesan and bananas. Update your inventory by voice after shopping." Card 3 (cyan): "See what&rsquo;s ready tonight" / "Open the app &mdash; HomeCuistot shows you which of your dishes you can cook right now." Keep existing card visual pattern (numbered blocks, accent colors, hard shadows, hover rotation).

**Checkpoint**: How It Works section updated with new copy. Visual pattern preserved.

---

## Phase 5: User Story 2 - Visitor Sees Product Demo Cards (Priority: P2)

**Goal**: Add product demo section showing 3 LandingRecipeCards with different availability states.

**Independent Test**: Verify 3 recipe cards render with correct mock data, green/yellow/gray backgrounds, status badges, and ingredient availability indicators.

### Implementation for User Story 2

- [ ] T008 [US2] Add `LANDING_RECIPES` mock data constant at top of `apps/nextjs/src/app/page.tsx`: 3 recipe objects — Pasta Carbonara (cookable, 6 ingredients, 0 missing), Chicken Stir-Fry (almost, 6 ingredients, 1 missing: Bell pepper), Shakshuka (missing, 6 ingredients, 3 missing: Tomato, Onion, Cumin). Use exact data from final-spec.md.
- [ ] T009 [US2] Add Section 5 (Product Demo) in `apps/nextjs/src/app/page.tsx`: NEW section after How It Works. Background `bg-gradient-to-br from-pink-200 via-yellow-100 to-cyan-200` with `border-b-4 md:border-b-8 border-black`. Title "Your recipes. Your ingredients. Instant answers." Subtitle "This is what HomeCuistot looks like when you open it." 3-column card grid (`grid-cols-1 md:grid-cols-3 gap-6 md:gap-10`). Import and render `LandingRecipeCard` for each item in `LANDING_RECIPES`.

**Checkpoint**: Product demo section renders 3 cards with distinct status states.

---

## Phase 6: User Story 3 - Visitor Encounters Sarah Story Teaser (Priority: P3)

**Goal**: Add Sarah story teaser section with 3-line narrative and curiosity CTA.

**Independent Test**: Verify 3 narrative lines render and "See Sarah's story" CTA links to `/login`.

### Implementation for User Story 3

- [ ] T010 [US3] Add Section 6 (Sarah Story Teaser) in `apps/nextjs/src/app/page.tsx`: NEW section after Product Demo. Background `bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100` with `border-b-4 md:border-b-8 border-black`. Centered card with thick border and hard shadow. Line 1: "5:47pm. Office." (`text-lg md:text-2xl font-black`). Line 2: "Sarah&rsquo;s hungry. She doesn&rsquo;t feel like scrolling through Uber Eats again." (`text-base md:text-xl font-bold text-black/80`). Line 3: "She opens HomeCuistot instead." (`text-base md:text-xl font-bold text-black/80`). CTA: "See Sarah&rsquo;s story &rarr;" linking to `/login` with `Button bg-yellow-400 hover:bg-yellow-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` + press animation. Smaller than hero CTA.

**Checkpoint**: Sarah teaser section renders narrative + CTA.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and build check

- [ ] T011 Verify all 7 sections render in correct order in `apps/nextjs/src/app/page.tsx`: Hero, Reframe, Anti-Positioning, How It Works, Product Demo, Sarah Story Teaser, Final CTA
- [ ] T012 Run `pnpm build` from `apps/nextjs/` to verify TypeScript compilation and build success
- [ ] T013 Visual responsive check: verify page at 320px, 375px, 768px, 1024px, 1440px viewports per `apps/nextjs/specs/029-landing-page-revamp/quickstart.md`
- [ ] T014 Verify anti-positioning HomeCuistot column renders first on mobile (< 768px) via browser dev tools
- [ ] T015 Verify all CTA buttons (`Start with your recipes`, `See Sarah's story`) navigate to `/login`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — creates LandingRecipeCard component
- **Phase 3 (US1)**: Can start after Phase 1 — does not depend on LandingRecipeCard
- **Phase 4 (US4)**: Can start after Phase 1 — independent copy update
- **Phase 5 (US2)**: Depends on Phase 2 — uses LandingRecipeCard component
- **Phase 6 (US3)**: Can start after Phase 1 — independent section addition
- **Phase 7 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Independent — core copy and positioning sections
- **US4 (P2)**: Independent — how-it-works copy update
- **US2 (P2)**: Depends on Phase 2 (LandingRecipeCard component)
- **US3 (P3)**: Independent — Sarah teaser section

### Within page.tsx

All US1/US2/US3/US4 tasks modify the same file (`page.tsx`), so they MUST run sequentially within that file. Recommended order: T003 → T004 → T005 → T007 → T008 → T009 → T010 → T006 (sections in page order, final CTA last).

### Parallel Opportunities

- T002 (LandingRecipeCard) can run in parallel with T003-T005 (US1 copy sections) since they are different files
- T011-T015 (polish) can run in parallel with each other

---

## Parallel Example

```bash
# Phase 2 + Phase 3 start (different files):
Task: "Create LandingRecipeCard in src/components/landing/LandingRecipeCard.tsx"  # T002
Task: "Rewrite Hero section in src/app/page.tsx"                                  # T003

# Polish phase (all independent checks):
Task: "Verify section order"           # T011
Task: "Run pnpm build"                 # T012
Task: "Visual responsive check"        # T013
Task: "Verify mobile column order"     # T014
Task: "Verify CTA navigation"          # T015
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create directory)
2. Complete Phase 3: US1 (hero, reframe, anti-positioning, final CTA)
3. **STOP and VALIDATE**: Page renders with correct positioning, all CTAs work
4. Deploy/demo if ready — core value proposition is delivered

### Incremental Delivery

1. Phase 1 + Phase 2 (Setup + LandingRecipeCard) → Component ready
2. Phase 3: US1 → Core positioning delivered
3. Phase 4: US4 → How-it-works updated
4. Phase 5: US2 → Product demo cards added
5. Phase 6: US3 → Sarah teaser added
6. Phase 7: Polish → Build verified, responsive validated

### Recommended Single-Developer Order

Since all page.tsx edits are sequential, optimal order is:

1. T001 (setup directory)
2. T002 (create LandingRecipeCard — separate file)
3. T003-T006 (US1 — hero, reframe, anti-positioning, final CTA)
4. T007 (US4 — how it works)
5. T008-T009 (US2 — mock data + product demo)
6. T010 (US3 — Sarah teaser)
7. T011-T015 (polish)

---

## Notes

- All page.tsx tasks reference `apps/nextjs/src/app/page.tsx` (absolute from monorepo root)
- LandingRecipeCard at `apps/nextjs/src/components/landing/LandingRecipeCard.tsx`
- Copy text uses HTML entities (`&rsquo;`, `&mdash;`, `&ndash;`, `&rarr;`) per existing page.tsx conventions
- No `Footer` import needed if already present in layout — verify during T003
- Commit after each phase checkpoint for safe rollback points
