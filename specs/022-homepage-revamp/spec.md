# Feature Specification: Homepage Messaging Revamp

**Feature Branch**: `022-homepage-revamp`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Homepage messaging revamp - clearer value prop for cooks who know their recipes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time Visitor Immediately Understands Core Value (Priority: P1)

A visitor lands on the homepage and instantly understands that HomeCuistot shows them what they can cook tonight based on what's in their fridge, without needing to browse recipes or do mental inventory math.

**Why this priority**: This is the critical moment that determines whether a visitor becomes a user. If they don't immediately grasp the core value proposition within 3-5 seconds, they'll bounce. The current homepage messaging is too focused on "voice" as the hook rather than the actual problem being solved.

**Independent Test**: Can be fully tested by showing the homepage to 10 new users and asking "What does this app do?" If 8+ can correctly articulate "shows me what I can cook with what I have" without mentioning voice/AI first, the messaging works.

**Acceptance Scenarios**:

1. **Given** visitor lands on homepage, **When** they read the hero headline and subheadline (within 5 seconds), **Then** they understand the core value is "instantly see what's cookable tonight"
2. **Given** visitor scrolls to problem section, **When** they read the emotional problem statement, **Then** they recognize their own "decision fatigue" experience in the description
3. **Given** visitor reads any section, **When** they encounter messaging, **Then** they see no mention of step-by-step recipe instructions (clarifying this is NOT a recipe app)

---

### User Story 2 - Visitor Understands Target Audience Match (Priority: P2)

A visitor identifies whether this app is for them - specifically, that it's designed for people who already know how to cook and don't need detailed instructions, just inventory management and recipe matching.

**Why this priority**: Reduces onboarding friction and support burden by self-qualifying users before signup. Wrong target users (beginners needing recipes) won't waste time signing up, while the right users (experienced cooks) will feel the app was built specifically for them.

**Independent Test**: Survey 20 visitors after reading the new "This isn't a recipe app" section. 90%+ of experienced home cooks should say "this is for me" while 70%+ of recipe-seeking beginners should say "this isn't what I need."

**Acceptance Scenarios**:

1. **Given** experienced cook reads "This isn't a recipe app" section, **When** they see "You know your recipes. We track what's possible.", **Then** they recognize the app targets their specific needs
2. **Given** recipe-seeking beginner reads "This isn't a recipe app" section, **When** they see "You don't need step-by-step instructions", **Then** they understand this app isn't designed for learning to cook
3. **Given** visitor reads "How It Works" section, **When** they see "recipes you've already mastered", **Then** they understand the app assumes cooking competence

---

### User Story 3 - Visitor Understands Voice is a Feature, Not the Product (Priority: P3)

A visitor understands that voice input is a convenience feature that removes friction (hands full from groceries, mental fatigue), not the primary selling point of the product.

**Why this priority**: Current messaging over-emphasizes voice ("Just talk to the app") before establishing the core problem being solved. This reordering ensures visitors understand the "what" and "why" before the "how".

**Independent Test**: Show homepage to 15 new users and ask "What's the main feature?" If 12+ answer "shows what I can cook" rather than "voice assistant", messaging hierarchy is correct.

**Acceptance Scenarios**:

1. **Given** visitor reads hero section, **When** they see subheadline, **Then** they read about core value ("See what you can cook tonight") before voice features are mentioned
2. **Given** visitor reads "How It Works" section, **When** they see the subheadline, **Then** they understand voice is explained as a practical solution to a real problem (hands full, brain tired)
3. **Given** visitor reads any card in "How It Works", **When** they see voice examples, **Then** voice is presented as a convenience method, not a required feature

---

### Edge Cases

- What happens when a visitor is a beginner cook looking for recipes? (Answer: New "This isn't a recipe app" section should politely disqualify them)
- How does messaging handle visitors who are skeptical of voice interfaces? (Answer: Subheadline explains the practical reason - hands full, brain tired - not just "it's cool")
- What if visitor wants to see a demo video before signing up? (Answer: Remove the empty video placeholder to avoid trust issues; keep "See How It Works" button that scrolls to cards)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hero section MUST keep headline "From 'What's in my fridge?' to 'What's for dinner?'" unchanged
- **FR-002**: Hero subheadline MUST be replaced with "See what you can cook tonight — instantly. No browsing, no guessing, no mental math."
- **FR-003**: Problem section headline MUST be replaced with "The problem isn't cooking — it's deciding what to cook"
- **FR-004**: Problem section body MUST include emotional narrative about decision fatigue: coming home tired, staring at fridge, knowing you have food but can't figure out what to make, leading to ordering takeout
- **FR-005**: Problem section MUST remove "Sound familiar?" button/callout
- **FR-006**: "How It Works" headline MUST be replaced with "Three steps. Zero typing."
- **FR-007**: "How It Works" subheadline MUST be replaced with "Voice-powered because your hands are full and your brain is tired."
- **FR-008**: Card 1 ("Collect Ingredients") MUST be replaced with "Say what you have" containing copy: "Just got back from the store? Tap the mic: 'I got chicken, eggs, pasta, and some tomatoes.' Done. Your inventory is updated before you've put the bags away. No typing, no scanning barcodes."
- **FR-009**: Card 2 ("Build Your Cookbook") MUST be replaced with "Add your dishes" containing copy: "Tell us the recipes you've already mastered — the ones you could cook in your sleep. 'I can make carbonara, stir-fry, shakshuka...' You know the steps. We just need to know what's in your repertoire."
- **FR-010**: Card 3 ("Cook More") MUST be replaced with "See what's cookable" containing copy: "Open the app → see which of your dishes you can make right now with what's in your kitchen. Pick one and start cooking. The thinking is done."
- **FR-011**: A new section MUST be added between "How It Works" and final CTA with headline "You know your recipes. We track what's possible."
- **FR-012**: New section body MUST contain: "You don't need step-by-step instructions for the carbonara you've made a hundred times. You don't need precise measurements — you know what 'some garlic' means. What you need is a quick answer to one question: *Can I make it tonight with what I have?* That's all we do. You're the chef. We're just the inventory clerk."
- **FR-013**: Final CTA headline MUST be replaced with "Cook more. Order less."
- **FR-014**: Final CTA subheadline MUST be replaced with "Every meal you cook instead of ordering is a win. We're here to remove the one barrier that makes takeout feel easier: the thinking."
- **FR-015**: Final CTA button text MUST be replaced with "Get Started — It Takes 2 Minutes"
- **FR-016**: Demo video placeholder section (black box with "Demo Video Coming Soon") MUST be completely removed
- **FR-017**: Header logo subtitle "(French: 'Home Chef')" MUST be removed
- **FR-018**: All existing visual styling (gradients, neo-brutalist cards, bold typography, border styles, shadows, rotations) MUST be preserved
- **FR-019**: All existing header elements (Login, Go to App buttons) MUST be preserved
- **FR-020**: Footer content and styling MUST be preserved unchanged
- **FR-021**: Page MUST maintain responsive design across mobile, tablet, and desktop breakpoints

### Key Entities

- **Homepage Sections**: Distinct content blocks (Hero, Problem, How It Works, New "This isn't a recipe app", Final CTA) that each serve a specific messaging purpose in the conversion funnel
- **Messaging Hierarchy**: The sequence in which value propositions are presented - core value first (what you can cook), problem empathy second (decision fatigue), method third (voice convenience)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 80% of first-time visitors can articulate the core value proposition ("shows what I can cook with what I have") when asked "What does this app do?" within 10 seconds of viewing the homepage
- **SC-002**: Bounce rate decreases by at least 20% compared to current homepage (visitors stay to read at least two sections)
- **SC-003**: 90% of experienced home cooks who read the "This isn't a recipe app" section self-identify as the target audience
- **SC-004**: Click-through rate on "Get Started" CTA increases by 15% compared to current homepage
- **SC-005**: Time spent reading Problem section increases by 30% (indicating stronger emotional resonance with decision fatigue narrative)
- **SC-006**: Homepage loads and renders in under 2 seconds on 3G mobile connections (performance maintained despite copy changes)

## Assumptions *(mandatory)*

- Users landing on the homepage are experiencing the problem described (decision fatigue around meal planning) at least occasionally
- The target audience (experienced home cooks) values time savings over detailed cooking instructions
- Voice interface skepticism can be overcome by framing it as a practical solution to a specific problem (hands full, mental fatigue) rather than a novelty feature
- Visual design (neo-brutalist aesthetic, bold colors, playful typography) already resonates with the target audience and doesn't need revision
- The current responsive breakpoints are correctly implemented and just need the new copy applied within the existing structure
- Removing the empty video placeholder will increase trust rather than decrease it (empty placeholders signal incompleteness)

## Dependencies *(mandatory)*

- **No external dependencies**: This is a copy and content structure change only, requiring no new libraries, APIs, or backend changes
- **Internal dependency**: The Next.js page component at `apps/nextjs/src/app/page.tsx` must be editable
- **Design assets**: All existing Tailwind classes, gradients, and styling will be reused (no new design assets needed)

## Open Questions

None - specification is complete and ready for planning.
