# Feature Specification: Landing Page Revamp

**Feature Branch**: `029-landing-page-revamp`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Revamp landing page with new copy, anti-positioning section, product demo cards, and Sarah story teaser"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time Visitor Understands Product Value (Priority: P1)

A first-time visitor lands on the homepage and immediately understands that HomeCuistot is NOT a recipe app — it works with *their* existing dishes and *their* kitchen inventory to tell them what they can cook tonight. The visitor reads the hero, scrolls through the page, and clicks "Start with your recipes" to sign up.

**Why this priority**: The landing page is the first impression. If visitors misunderstand the product as "yet another recipe app," they bounce. Correct positioning is the highest-value outcome.

**Independent Test**: Can be fully tested by loading the homepage and verifying all copy, sections, and CTAs render correctly with the updated messaging.

**Acceptance Scenarios**:

1. **Given** a visitor loads the homepage, **When** the page renders, **Then** the hero displays "Not a recipe app." eyebrow, "Your kitchen already knows what's for dinner" headline, and "Start with your recipes" CTA linking to `/login`
2. **Given** a visitor scrolls past the hero, **When** they reach section 2 (The Reframe), **Then** they see the question "You know those 10-15 dinners you rotate through?" with the explanatory paragraph about HomeCuistot starting with the user's own dishes
3. **Given** a visitor scrolls to section 3 (Anti-Positioning), **When** they view the comparison, **Then** they see a two-column layout contrasting "Recipe Apps" (grayed out, strikethrough) vs "HomeCuistot" (green, positive), with HomeCuistot column appearing first on mobile
4. **Given** a visitor views the final CTA section, **When** they see the button, **Then** it reads "Start with your recipes" and links to `/login`

---

### User Story 2 - Visitor Sees Product Demo Cards (Priority: P2)

A visitor scrolls to the product demo section and sees three example recipe cards showing different availability states (cookable, almost ready, missing ingredients). This gives them a concrete preview of what the app looks like in practice.

**Why this priority**: Showing the actual product experience reduces uncertainty and builds confidence. It bridges the gap between marketing copy and real functionality.

**Independent Test**: Can be fully tested by verifying the three LandingRecipeCard components render with correct mock data, status badges, and ingredient availability indicators.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls to the product demo section, **When** the section renders, **Then** three recipe cards are displayed: "Pasta Carbonara" (cookable/green, all ingredients available), "Chicken Stir-Fry" (almost/yellow, 1 missing), and "Shakshuka" (missing/gray, 3 missing)
2. **Given** the recipe cards are visible, **When** viewing each card, **Then** each shows a status badge (Ready tonight / Missing 1 / Missing 3), ingredient list with available/missing indicators, and anchor ingredient markers
3. **Given** a visitor views the demo section on mobile, **When** the viewport is below `md` breakpoint, **Then** the cards stack vertically in a single column

---

### User Story 3 - Visitor Encounters Sarah Story Teaser (Priority: P3)

A visitor scrolls to the Sarah story section and reads a 3-line mini-narrative that hooks their curiosity about the onboarding experience. They click "See Sarah's story" to sign up and access the onboarding.

**Why this priority**: The Sarah teaser creates an emotional connection and curiosity hook, driving sign-ups from visitors who respond to narrative over feature lists.

**Independent Test**: Can be fully tested by verifying the 3 narrative lines render correctly and the CTA button links to `/login`.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls to the Sarah story section, **When** the section renders, **Then** they see three narrative lines: "5:47pm. Office.", "Sarah's hungry. She doesn't feel like scrolling through Uber Eats again.", "She opens HomeCuistot instead."
2. **Given** the Sarah section is visible, **When** the visitor clicks "See Sarah's story", **Then** they are navigated to `/login`

---

### User Story 4 - Visitor Understands How It Works (Priority: P2)

A visitor reads the "How It Works" section and understands the three-step flow: tell us what you cook, keep your kitchen current, see what's ready tonight. The steps emphasize voice input and ownership of dishes.

**Why this priority**: The how-it-works section translates positioning into concrete user actions. Without it, visitors know *what* the product is but not *how* it works.

**Independent Test**: Can be fully tested by verifying the three step cards render with updated copy and visual styling.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls to the How It Works section, **When** the section renders, **Then** they see "Three steps. Your voice. That's it." as the title and three cards with steps 01/02/03
2. **Given** the three cards are visible, **When** viewing card content, **Then** Step 1 reads "Tell us what you cook", Step 2 reads "Keep your kitchen current", Step 3 reads "See what's ready tonight"

---

### Edge Cases

- What happens when the page is viewed on very small screens (< 320px)? Content should remain readable with no horizontal overflow.
- What happens when a visitor has JavaScript disabled? All content is static server-rendered HTML/CSS, so the page renders correctly.
- What happens when fonts fail to load? System font fallbacks apply; no critical images are used, so degradation is graceful.
- What happens on the anti-positioning section with very long text (future i18n)? Current spec is English-only with controlled hardcoded copy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Landing page MUST display 7 distinct sections in order: Hero, Reframe, Anti-Positioning, How It Works, Product Demo, Sarah Story Teaser, Final CTA
- **FR-002**: Hero section MUST show "Not a recipe app." eyebrow tag, "Your kitchen already knows what's for dinner" headline, bridge subheadline, and "Start with your recipes" CTA linking to `/login`
- **FR-003**: Reframe section MUST display "You know those 10-15 dinners you rotate through?" headline with explanatory body text in a white card with neo-brutal styling
- **FR-004**: Anti-Positioning section MUST show a two-column comparison with "Recipe Apps" (grayed, strikethrough) vs "HomeCuistot" (green, positive) with HomeCuistot column appearing first on mobile
- **FR-005**: Anti-Positioning section MUST include knockout line: "Your dishes. Your inventory. Suggestions from strangers, never."
- **FR-006**: How It Works section MUST display three numbered step cards with updated copy: "Tell us what you cook", "Keep your kitchen current", "See what's ready tonight"
- **FR-007**: Product Demo section MUST display three LandingRecipeCard components showing cookable (green), almost-ready (yellow), and missing (gray) states with hardcoded mock data
- **FR-008**: Each LandingRecipeCard MUST show recipe name, description, status badge, and ingredient list with availability indicators (available vs missing)
- **FR-009**: Sarah Story Teaser section MUST display 3 narrative lines and a "See Sarah's story" CTA linking to `/login`
- **FR-010**: Final CTA section MUST display "Your dishes. Your kitchen. Always knowing what's for dinner." headline with "Start with your recipes" CTA linking to `/login`
- **FR-011**: All sections MUST maintain the existing neo-brutal design system (thick black borders, hard offset shadows, bold typography, button press animations)
- **FR-012**: Page MUST be responsive with mobile-first layout, using `md:` breakpoints for desktop enhancements
- **FR-013**: LandingRecipeCard MUST be a separate component from the existing app RecipeCard, purpose-built for static landing page display with no interactivity

### Key Entities

- **LandingRecipeCard**: Presentation-only component displaying recipe name, description, status (cookable/almost/missing), and ingredient list with availability and type (anchor/optional) indicators
- **Landing Recipe Mock Data**: Hardcoded array of 3 recipe objects with name, description, status, and ingredients used exclusively on the landing page

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of landing page visitors see all 7 sections rendered correctly without layout breaks on viewports from 320px to 1920px
- **SC-002**: All CTA buttons on the landing page navigate to `/login` when clicked
- **SC-003**: The anti-positioning comparison renders HomeCuistot column first on mobile (< 768px) and side-by-side on desktop
- **SC-004**: The product demo section displays 3 recipe cards with visually distinct status states (green/yellow/gray backgrounds and corresponding badges)
- **SC-005**: Page contains zero references to "recipe app" framing in positive/aspirational copy — the term appears only in the anti-positioning "what we're not" context
- **SC-006**: All landing page text matches the approved copy reference inventory exactly

## Assumptions

- The existing shared components (Header, Footer, Text, Button, Badge) are used as-is without modification
- No backend changes, new routes, or new package dependencies are needed
- The page remains a static server-rendered page with no client-side state or data fetching
- The color palette (pink/cyan/yellow/orange), fonts (Geist), and neo-brutal design system remain unchanged
- The Sarah story teaser uses shortened copy inspired by the onboarding constants, not the full scene text
- English-only copy; no internationalization considerations for this iteration

## Scope Boundaries

### In Scope

- Rewriting all section copy on `src/app/page.tsx`
- Adding 3 new sections: Anti-Positioning (section 3), Product Demo (section 5), Sarah Story Teaser (section 6)
- Creating `src/components/landing/LandingRecipeCard.tsx` component
- Hardcoded mock data for product demo cards

### Out of Scope

- Changes to any shared component (Header, Footer, Text, Button, Badge)
- Changes to the existing RecipeCard used in the app
- Backend/API changes
- Database changes
- New package dependencies
- Onboarding flow changes
- Analytics or tracking integration
- A/B testing infrastructure
- SEO metadata changes

## Dependencies

- Existing shared components: Header, Text, Button, Badge from shared
- Existing Footer component
- Next.js Link component for CTA navigation
