# Landing Page Revamp — Analysis & Findings

Analysis of two colleague reports (Messaging Framework + Neo-Brutalism Design Guide) cross-referenced against the current `page.tsx` and onboarding story.

---

## TL;DR — Both Reports Are Mostly Right

The core diagnosis is accurate: **the current landing page oscillates between "recipe discovery app" language and "kitchen intelligence" language, never committing to one frame.** The design direction (neo-brutalism) is already partially in place but inconsistent. The proposed fixes are largely sound, with several items needing resolution before implementation.

---

## What the Current Page Gets Wrong

### 1. Identity confusion in the hero

The eyebrow tag says "AI-Powered Voice Assistant for Home Cooks" — generic, could be any cooking app. The headline "From 'What's in my fridge?' to 'What's for dinner?'" is ambiguous — it reads like a recipe suggestion flow (the SuperCook pattern) rather than a "match your known dishes to your current inventory" flow.

### 2. Discovery language throughout

Lines that reinforce the recipe-app mental model:
- **"See what you can cook — instantly"** (line 25) — classic discovery framing
- **"Say what you have"** (step 1, line 70) — this is literally the SuperCook entry point
- **"See cookable recipes instantly"** (step 3, line 94) — "recipes" is a direct trigger word
- **"see what you can cook now"** (line 97) — discovery language again

### 3. The best line is buried

Line 111: **"You know your recipes. We track what's possible."** — this perfectly captures the positioning! It asserts user ownership ("you know") and positions the app as infrastructure ("we track"). This should be near the hero, not in section 4.

### 4. Weak CTAs

- "Get Started Free" — generic, doesn't relate to product action
- "Commit To Change - Let's Go!" — hackathon-internal language, meaningless to a new visitor

### 5. Typos

- Line 94: "recipies" → "recipes"
- Line 97: "what what" → "what"

### 6. No differentiation moment

The page never explicitly says "we're NOT a recipe suggestion app." A first-time visitor has no reason to think HomeCuistot is different from SuperCook, Mealime, or Cooklist.

---

## Report 1 (Messaging Framework) — Verdict

### Strong points I agree with

| Insight | Why it's right |
|---|---|
| Category framing > copywriting | The problem isn't word choice — it's that users slot HomeCuistot into "recipe app" category automatically |
| April Dunford parallel (database → BI tool) | Same product, different frame = different perception. Directly applicable. |
| "Words to avoid" list | The current page uses several: "see what you can cook", "recipes", "discover"-adjacent patterns |
| Obsidian ownership pattern | "Your dishes, not our recipes" is the right structural model. User = source of content, app = infrastructure. |
| Competitive gap table | The "user-owned dishes x inventory x proactive push" stack is genuinely unoccupied territory |
| Landing page = curiosity, Onboarding = understanding | Don't explain the full mechanism on the landing page. Tease it. Let the Sarah story teach. |
| Hero framework (5 layers) | Eyebrow → Headline → Subheadline → CTA → Anti-positioning. Well-structured. |

### Questionable points that need resolution

| Concern | Issue |
|---|---|
| "Not a recipe app" as eyebrow | Risky. Defines by negation. DiGiorno worked because "delivery" was one clear thing to reject. "Recipe app" is vaguer — user might think "then what IS it?" and bounce. Consider leading with what you ARE instead, with the rejection as a secondary beat. |
| "Zero recipes inside" | **Factually misleading.** Users DO add their own recipes. The app literally has recipe management. The distinction is recipes come FROM the user, not FROM a database. Better: "Your recipes, not ours." |
| Proactive push as differentiator | The competitive table claims HomeCuistot does "proactive push." **No push notification feature exists in the codebase.** The app shows cookable status when you open it — that's pull, not push. Don't claim what isn't built. Reframe: "Shows you what's ready the moment you open the app." |
| Sarah story teaser section | Sarah IS in the codebase (constants.ts: "Sarah's hungry. She doesn't feel like scrolling through Uber Eats again.") but she's an onboarding character, not a landing page character. A teaser could work, but needs careful execution to create curiosity without spoiling the onboarding. |
| Testimonial/social proof section | This is a hackathon project. No real users = no real testimonials. Fake ones would undermine trust. Use a realistic scenario instead (the report acknowledges this as a fallback). |
| "Add your first dish" as CTA | Good direction but slightly misleading — the onboarding doesn't start with adding a dish. It starts with the Sarah story (Scene1Dilemma). CTA should lead to the actual first step. |

---

## Report 2 (Design Guide) — Verdict

### Strong points I agree with

| Insight | Why it's right |
|---|---|
| Neo-brutalism breaks "polished cooking app" expectation | Every recipe app uses soft gradients, food photography, rounded cards. Bold borders and hard shadows signal "different." |
| 5 CSS primitives (shadows, borders, flat colors, bold type, sharp corners) | Practical, directly implementable in Tailwind. The current page already uses most of these. |
| Color-to-state mapping | Green = cookable, red = missing, yellow = attention, blue = informational. Smart UX that matches the product's core states. |
| Comparison section layout | Strikethrough + muted vs bold + highlighted is a powerful visual anti-positioning device. |
| Button press animation | Already partially in the current page. Formalizing it with consistent shadow collapse behavior would improve tactile feel. |
| Mobile: reduce shadow offsets | Simple, practical responsive adjustment. |

### Questionable points that need resolution

| Concern | Issue |
|---|---|
| "No gradients" | The current page uses gradients **everywhere** (hero, every section background). Going pure flat is a dramatic visual shift. The gradients give the page energy and warmth. **Suggestion:** keep subtle gradients in section backgrounds but make cards, buttons, and interactive elements flat. Hybrid approach. |
| Color palette shift | Report suggests orange-dominant (#FF6B35) palette. Current page is pink/cyan/yellow/orange. The onboarding uses amber/orange tones. Need to decide: align to which? The onboarding palette (warm amber/orange) is probably the better anchor since it's what users see next. |
| Font change to Archivo Black + DM Sans | Current project uses **Geist** (sans) and **Geist Mono** loaded in layout.tsx. There's also a `font-head` class used on display elements. Changing fonts is a project-wide decision, not just a landing page one. If fonts change on landing, they should match the app. |
| "border-radius: 0" on everything | Current components (Button, cards) use `--radius: 0.5rem`. Going fully angular would affect the component library. The "soft brutal" compromise (4px on cards, 0 on buttons) is more practical. |
| Show "product interface" in hero | Good idea in theory. But it requires building a static mockup of the app's "cookable tonight" view. Is it worth the effort for a landing page? An animation or illustrated flow might be simpler and equally effective. |

---

## Synthesis — What to Actually Do

### The messaging shift (from Report 1)

**Current frame:** "AI assistant that helps you figure out what to cook"
**Target frame:** "Kitchen memory that knows what you cook and what you have"

Copy principles:
1. **Lead with attention-grabbing negation** — "Not a recipe app" as the eyebrow, provocative and immediate
2. **Then assert what you ARE** — ownership language in the headline ("your dishes", "your kitchen")
3. **Describe the app's action as push, not pull** — "tells you", "shows you" vs "search", "browse", "discover"
4. **Never claim proactive push** — reframe as "shows you what's ready the moment you open the app" (honest about pull-on-open behavior)

### Proposed section structure (merged from both reports)

| # | Section | Purpose | Key elements |
|---|---|---|---|
| 1 | Hero | Break assumption, install correct frame | "Not a recipe app" eyebrow tag + ownership headline + one-sentence explanation + CTA |
| 2 | The reframe | Explain what this actually is | "You know those 10-15 dinners you rotate?" bridge pattern |
| 3 | Anti-positioning | Explicit contrast with recipe apps | Two-column comparison: recipe apps (muted/strikethrough) vs HomeCuistot (bold/highlighted) |
| 4 | How it works | 3-step flow, concrete | Step 1: Tell us what you cook. Step 2: Keep your kitchen current. Step 3: See what's ready tonight. |
| 5 | Product demo | Show the "cookable tonight" view | Reuse `RecipeCard` component with mock data — shows real product UI with recipe availability states (green = cookable, missing ingredients shown). Low-effort since component already exists. |
| 6 | Sarah teaser | Hook for onboarding story | Mini-narrative creating curiosity without spoiling. "Meet Sarah. 5:47pm. Hungry." → CTA button to onboarding |
| 7 | Final CTA | Identity reinforcement + action | Echo hero promise + strong CTA |

### The design approach (from Report 2, adapted)

- **Keep:** thick borders, hard offset shadows, bold typography, saturated flat colors on interactive elements
- **Keep:** gradients on section backgrounds (current page style — they give warmth and energy)
- **Keep:** current color palette (pink/cyan/yellow/orange — the existing brand personality)
- **Keep:** Geist fonts (already configured project-wide, `font-head` for display text)
- **Keep:** button press animation pattern (already partially there, formalize it)
- **Keep:** decorative floating shapes (brand personality, part of the playful neo-brutal feel)
- **Adapt:** cards and interactive elements stay flat with hard shadows (neo-brutal primitives from Report 2)

### Product demo section — RecipeCard reuse strategy

The `RecipeCard` component (`src/components/recipes/RecipeCard.tsx`) is already a self-contained neo-brutal card with:
- Thick black border (`border-4 border-black`)
- Hard offset shadow (`shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`)
- Green gradient background (`bg-gradient-to-br from-green-200 to-green-300`)
- Ingredient badges with star ratings (anchor vs optional)

For the landing page, render 2-3 `RecipeCard` instances with mock data showing different availability states:
1. **"Pasta Carbonara"** — all ingredients available (fully cookable tonight)
2. **"Chicken Stir-Fry"** — missing 1 ingredient (almost there)
3. **"Shakshuka"** — missing 2+ ingredients (not tonight)

This shows the product's core value proposition with real UI — no mockup illustration needed. The cards need the `RecipeCard` interface data shape, which is straightforward to hardcode.

**Note:** `RecipeCard` currently shows ingredients as badges but doesn't show availability status (has/missing). The landing page mockup may need a thin wrapper or variant that overlays availability info (e.g., green check vs red X per ingredient, or a "Cookable tonight" / "Missing 2 items" badge on the card). This should be a lightweight presentation-only wrapper — NOT a change to the shared component.

---

## Resolved Decisions

| # | Question | Decision | Implication |
|---|---|---|---|
| 1 | "Not a recipe app" — lead or secondary? | **Lead.** Grab attention with the provocation. | Eyebrow tag on hero section. Risk accepted — the headline immediately below clarifies what it IS. |
| 2 | Proactive push — claim it? | **No.** Won't build push notifications. | Reframe all copy: "shows you what's ready when you open" not "texts you at 5pm." Remove "proactive push" from any competitive claims. |
| 3 | Gradients — kill or keep? | **Keep.** | Section backgrounds retain current gradient style. Cards/buttons stay flat with hard shadows. Hybrid approach. |
| 4 | Color palette? | **Keep current** (pink/cyan/yellow/orange). | No palette shift. Ignore Report 2's orange-dominant suggestion. |
| 5 | Fonts? | **Keep Geist.** | No font change. Ignore Report 2's Archivo Black + DM Sans suggestion. |
| 6 | Sarah teaser? | **Yes**, include curiosity button. | Short teaser section with CTA leading to onboarding story. Don't spoil the narrative. |
| 7 | Product mockup in hero? | **Yes**, reuse `RecipeCard` with mock data. | Low effort — component exists. Show 2-3 cards with different availability states in a dedicated demo section. |
| 8 | Floating decorative shapes? | **Keep.** | Part of brand personality. No removal. |

---

## Remaining Questions

None — all decisions resolved. Ready for implementation planning.
