# Implementation Plan: Homepage Messaging Revamp

**Branch**: `022-homepage-revamp` | **Date**: 2026-02-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/022-homepage-revamp/spec.md`

## Summary

Revamp homepage messaging to emphasize core value proposition (instant recipe matching from fridge contents) over voice features. Update copy across 5 sections, add new "This isn't a recipe app" section to clarify target audience (experienced cooks), remove empty video placeholder and header subtitle. Preserve all existing neo-brutalist visual styling, responsive design, and layout structure.

**Technical Approach**: Single-file JSX/TSX copy replacement in existing Next.js page component. No new components, APIs, or libraries required. Focus on content hierarchy and readability while maintaining vibrant neobrutalist design principles with subtle animations.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode), React 19, Next.js 16 App Router
**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS v4, existing shared components (Button, Text from `@/components/shared`)
**Storage**: N/A (no data persistence)
**Testing**: Manual testing against user scenarios (P1-P3 acceptance criteria)
**Target Platform**: Web (responsive: mobile-first, tablet, desktop)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: <2s load time on 3G mobile connections (SC-006)
**Constraints**: No layout structure changes, preserve all existing Tailwind classes for visual style, maintain responsive breakpoints
**Scale/Scope**: Single page component (`apps/nextjs/src/app/page.tsx`), 5 sections, ~150 lines of JSX

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Critical Safeguards (MUST Pass)

- ✅ **No user data loss**: N/A - no database operations, copy-only change
- ✅ **No auth bypasses**: N/A - no authentication logic modified
- ✅ **No SQL injection**: N/A - no database queries
- ✅ **No exposed secrets**: N/A - no environment variables or secrets involved
- ✅ **TypeScript compilation**: Will verify `tsc` passes after changes
- ✅ **App runs without crashes**: Will verify manual testing of all sections

### Principle Alignment

**VII. Vibrant Neobrutalism Design System**: ✅ **FULLY ALIGNED**
- FR-018 explicitly requires preserving all existing visual styling (gradients, neo-brutalist cards, bold typography, border styles, shadows, rotations)
- User instruction: "use neo brutalism design principles, subtle animations authorized only"
- All Tailwind classes for thick borders (border-4, border-6), thick shadows (shadow-[Npx_Npx...]), vibrant colors (pink-400, yellow-300, cyan-400), bold typography (font-black, uppercase), playful rotations (md:rotate-2, md:-rotate-1) will be preserved
- Mobile-first responsive patterns maintained (md: breakpoints, smaller borders/shadows on mobile)
- Only copy changes within existing styled containers

**I. MVP-First Development**: ✅ **ALIGNED**
- Feature completeness (all 21 FR requirements) > code perfection
- Manual validation for acceptance scenarios (SC-001 through SC-006)
- Focus on happy path (visitor reads sections correctly)

**VI. Named Parameters for Clarity**: ✅ **N/A**
- No new functions created (copy-only change)
- Existing component props unchanged

**V. Type Derivation**: ✅ **N/A**
- No new types or schemas required

**II. Pragmatic Type Safety**: ✅ **ALIGNED**
- Existing TypeScript strict mode maintained
- No type changes required (JSX.Element return type unchanged)

**III. Essential Validation Only**: ✅ **N/A**
- No user inputs or validation logic

**IV. Test-Ready Infrastructure**: ✅ **ALIGNED**
- Manual testing sufficient for MVP (test infrastructure exists but not required for copy changes)

### Gate Results

**Status**: ✅ **ALL GATES PASSED** - No violations, no complexity justification needed. Ready for Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/022-homepage-revamp/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (created by /speckit.specify)
├── research.md          # Phase 0 output (messaging patterns, content hierarchy best practices)
├── data-model.md        # Phase 1 output (N/A - no data model for copy-only change)
├── quickstart.md        # Phase 1 output (testing scenarios from spec)
├── contracts/           # Phase 1 output (N/A - no API contracts)
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality validation (created by /speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── app/
│   │   └── page.tsx           # MODIFIED: Homepage component (primary change target)
│   └── components/
│       └── shared/
│           ├── Button.tsx     # PRESERVED: Existing component, no changes
│           └── Text.tsx       # PRESERVED: Existing component, no changes
└── public/                    # UNCHANGED: No asset changes required
```

**Structure Decision**: Single-file modification in existing Next.js App Router structure. Target file is `apps/nextjs/src/app/page.tsx` which contains the entire homepage as a server component. No new files or components required - all changes are JSX/TSX content updates within existing styled containers using existing shared components (Button, Text).

## Complexity Tracking

> **Not applicable** - No constitution violations. All gates passed, no complexity justification needed.

---

## Phase 0: Research & Discovery

### Research Tasks

1. **Messaging Hierarchy Best Practices**
   - Research effective homepage value proposition structures
   - Analyze conversion funnel messaging patterns (value → problem → solution → CTA)
   - Document optimal content sequence for SaaS landing pages

2. **Neo-Brutalist Content Presentation**
   - Review how vibrant neobrutalist design affects readability
   - Identify optimal text lengths for bold uppercase headings
   - Research subtle animation patterns that enhance without distraction (focus on user instruction: "subtle animations authorized only")

3. **Mobile-First Copy Strategy**
   - Research character count limits for mobile headline readability
   - Analyze effective mobile CTAs in neobrutalist designs
   - Document responsive typography patterns for long-form copy (emotional narratives)

### Decisions to Document in research.md

- **Content hierarchy**: Value-first vs problem-first ordering
- **Headline length**: Character count sweet spot for mobile + desktop
- **Animation approach**: Which subtle animations enhance (hover states, transitions) vs distract
- **Section spacing**: Optimal breathing room between sections for message absorption
- **CTA placement**: Button text length and positioning for mobile conversions

**Output**: `research.md` with findings and rationale for content presentation strategy

---

## Phase 1: Design & Contracts

### Data Model

**N/A** - No data model required. This is a static content change with no database operations, API calls, or persistent state.

**Output**: `data-model.md` with "Not applicable - static content only" documentation

### API Contracts

**N/A** - No API contracts required. All changes are client-side JSX content within existing page component.

**Output**: Empty `/contracts/` directory or note in `quickstart.md`

### Component Structure

**Existing Component**: `apps/nextjs/src/app/page.tsx`

Current structure (preserved):
```tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header - MODIFIED: Remove subtitle */}
      {/* Hero Section - MODIFIED: Update subheadline */}
      {/* Problem Section - MODIFIED: Headline + body, remove button */}
      {/* How It Works Section - MODIFIED: Headlines + 3 cards */}
      {/* NEW SECTION: "This isn't a recipe app" */}
      {/* Final CTA - MODIFIED: Headlines + button text */}
      {/* Footer - PRESERVED */}
    </div>
  );
}
```

**No new components created** - All changes are inline JSX modifications using existing `<Text>` and `<Button>` components from `@/components/shared`.

### Testing Strategy (quickstart.md)

Manual testing scenarios mapped to spec acceptance criteria:

**P1 - Core Value Understanding** (SC-001):
1. Load homepage on mobile and desktop
2. Verify hero subheadline reads: "See what you can cook tonight — instantly. No browsing, no guessing, no mental math."
3. Verify no voice-first messaging in hero section
4. Test: Ask 3 colleagues "What does this app do?" after 5-second view

**P2 - Target Audience Match** (SC-003):
1. Verify new "This isn't a recipe app" section exists between "How It Works" and final CTA
2. Verify headline: "You know your recipes. We track what's possible."
3. Verify body includes: "You don't need step-by-step instructions..."
4. Test: Show to 2 experienced cooks + 2 recipe-seekers, ask "Is this for you?"

**P3 - Voice as Feature** (SC-002):
1. Verify "How It Works" subheadline: "Voice-powered because your hands are full and your brain is tired."
2. Verify all 3 cards mention voice as convenience, not primary feature
3. Measure: Track scroll depth (expect 20% more visitors reach final CTA)

**Performance** (SC-006):
1. Lighthouse mobile test (3G throttling)
2. Verify <2s load time maintained
3. Check no new large assets added

**Visual Preservation** (FR-018 to FR-021):
1. Verify all gradients, borders (border-4/6/8), shadows (shadow-[Npx...]) unchanged
2. Verify responsive breakpoints work (mobile, tablet, desktop)
3. Verify rotations still only apply on md+ breakpoints
4. Verify header Login/App buttons + footer unchanged

**Output**: `quickstart.md` with manual test checklist

### Agent Context Update

Run agent context update script:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

**Expected updates to CLAUDE.md**:
- Add "022-homepage-revamp: Homepage messaging revamp - vibrant neobrutalist copy updates, preserved visual styling"
- Document new section: "This isn't a recipe app" between How It Works and final CTA
- Note removed elements: video placeholder, header subtitle

---

## Phase 2: Task Breakdown

**Not executed in /speckit.plan** - This phase is handled by `/speckit.tasks` command.

Expected task structure (preview):
1. Update hero section subheadline (FR-002)
2. Update problem section headline + body (FR-003, FR-004)
3. Remove "Sound familiar?" button (FR-005)
4. Update "How It Works" headlines (FR-006, FR-007)
5. Update 3 "How It Works" cards with new copy (FR-008, FR-009, FR-010)
6. Add new "This isn't a recipe app" section (FR-011, FR-012)
7. Update final CTA headlines + button (FR-013, FR-014, FR-015)
8. Remove demo video placeholder section (FR-016)
9. Remove header logo subtitle (FR-017)
10. Manual testing against all acceptance scenarios
11. Lighthouse performance validation (SC-006)

---

## Risk Assessment

### Low Risk
- ✅ Copy-only changes in single file
- ✅ No new dependencies or libraries
- ✅ No database operations or API calls
- ✅ Existing visual styling preserved
- ✅ No breaking changes to component API

### Medium Risk
- ⚠️ **New section placement**: Adding "This isn't a recipe app" between sections - may affect spacing/layout if not careful with Tailwind classes
- ⚠️ **Video removal**: Deleting video placeholder may shift layout - verify no broken grid/flex containers

### Mitigation
- Preview all breakpoints (mobile, tablet, desktop) after changes
- Use existing section structure/classes as template for new section
- Test scroll behavior after video removal

### Rollback Plan
- Git revert single commit if messaging doesn't test well
- No database migrations or API changes to coordinate

---

## Success Validation

**Manual Testing** (maps to Success Criteria):
- SC-001: Show homepage to 10 users, 8+ articulate "shows what I can cook with what I have"
- SC-002: Monitor bounce rate (analytics) - expect 20% reduction
- SC-003: Survey 20 visitors after reading new section - 90%+ experienced cooks say "this is for me"
- SC-004: Track CTA click-through rate - expect 15% increase
- SC-005: Monitor Problem section time-on-page - expect 30% increase
- SC-006: Lighthouse mobile 3G test - verify <2s load time

**Automated Checks**:
- TypeScript compilation: `pnpm tsc --noEmit` (apps/nextjs)
- Linting: `pnpm lint` (apps/nextjs) - warnings OK for MVP per constitution
- Build success: `pnpm build` (apps/nextjs)
- Dev server runs: `pnpm dev` (apps/nextjs)

**Visual Regression**:
- Manual screenshot comparison (before/after) for all 5 sections
- Verify neo-brutalist style preserved: borders, shadows, rotations, gradients
- Verify responsive behavior: mobile (375px), tablet (768px), desktop (1440px)

---

## Notes

**Design Constraints from User**:
- "use neo brutalism design principles" - Already implemented, FR-018 preserves all styling
- "subtle animations authorized only" - Existing hover states (shadow reduction + translate) are subtle and appropriate
- "focus on delivering the right message in the content the right way to be caught by the visitor" - Messaging hierarchy (value → problem → solution → CTA) addresses this

**Content Strategy**:
- Emotional narrative in Problem section to create recognition/resonance
- New section explicitly disqualifies wrong audience (recipe-seekers) to reduce onboarding friction
- Voice reframed as practical convenience (hands full, brain tired) not gimmick
- Final CTA uses outcome framing ("Cook more. Order less.") not feature framing

**Performance Considerations**:
- No new images, fonts, or assets added
- Text-only changes should maintain or improve load time (removing video placeholder reduces DOM nodes)
- Existing lazy loading and responsive images preserved
