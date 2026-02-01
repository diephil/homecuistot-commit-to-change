# Quickstart: Homepage Messaging Revamp Testing

**Feature**: 022-homepage-revamp
**Date**: 2026-02-01
**Target**: `apps/nextjs/src/app/page.tsx`

---

## Development Setup

### 1. Start Development Server

```bash
cd apps/nextjs
pnpm dev
```

Visit: http://localhost:3000

### 2. Verify TypeScript Compilation

```bash
cd apps/nextjs
pnpm tsc --noEmit
```

Expected: No errors (strict mode enabled)

### 3. Run Linting (Optional for MVP)

```bash
cd apps/nextjs
pnpm lint
```

Expected: Warnings OK per constitution, no errors that break builds

---

## Manual Testing Checklist

### Priority 1: Core Value Understanding (SC-001)

**Objective**: 80% of visitors articulate "shows what I can cook with what I have" within 10 seconds

- [ ] **Mobile (375px)**: Load homepage, verify hero subheadline visible above fold
- [ ] **Desktop (1440px)**: Load homepage, verify hero subheadline visible above fold
- [ ] **Content verification**: Hero subheadline reads exactly: "See what you can cook tonight — instantly. No browsing, no guessing, no mental math."
- [ ] **No voice-first messaging**: Hero section does NOT mention "voice" or "AI" before value proposition
- [ ] **User test** (optional): Show to 3 colleagues for 5 seconds, ask "What does this app do?" - expect "shows what I can cook" not "voice assistant"

**Pass criteria**: Subheadline visible, correct text, value-first messaging

---

### Priority 2: Target Audience Match (SC-003)

**Objective**: 90% of experienced cooks self-identify as target audience

- [ ] **New section exists**: Scroll to find "This isn't a recipe app" section between "How It Works" and final CTA
- [ ] **Headline verification**: Section headline reads exactly: "You know your recipes. We track what's possible."
- [ ] **Body content**: Section includes text: "You don't need step-by-step instructions for the carbonara you've made a hundred times..."
- [ ] **Full text verification**: Section body includes: "Can I make it tonight with what I have? That's all we do. You're the chef. We're just the inventory clerk."
- [ ] **Mobile layout**: Verify section renders correctly on mobile (no overflow, readable paragraphs)
- [ ] **Desktop layout**: Verify section uses same styling pattern as other sections (gradient background, borders, padding)
- [ ] **User test** (optional): Show to 2 experienced cooks + 2 recipe-seekers, ask "Is this for you?" - expect 2/2 yes from cooks, 0-1/2 yes from recipe-seekers

**Pass criteria**: Section exists, correct text, matches design patterns

---

### Priority 3: Voice as Feature Not Product (SC-002)

**Objective**: Messaging hierarchy presents value before method

- [ ] **"How It Works" headline**: Reads exactly "Three steps. Zero typing."
- [ ] **"How It Works" subheadline**: Reads exactly "Voice-powered because your hands are full and your brain is tired."
- [ ] **Card 1 verification**: Headline "Say what you have" + body includes "Tap the mic: 'I got chicken, eggs, pasta, and some tomatoes.' Done. Your inventory is updated before you've put the bags away. No typing, no scanning barcodes."
- [ ] **Card 2 verification**: Headline "Add your dishes" + body includes "Tell us the recipes you've already mastered — the ones you could cook in your sleep..."
- [ ] **Card 3 verification**: Headline "See what's cookable" + body includes "Open the app → see which of your dishes you can make right now with what's in your kitchen. Pick one and start cooking. The thinking is done."
- [ ] **Voice framing**: All 3 cards present voice as convenience (hands full, no typing), not as primary feature
- [ ] **Scroll depth** (analytics): After deploy, expect 20% more visitors reach final CTA compared to baseline

**Pass criteria**: All headlines/body correct, voice positioned as convenience

---

### Problem Section Updates (FR-003 to FR-005)

**Objective**: Emotional narrative creates resonance with decision fatigue

- [ ] **Headline verification**: Problem section headline reads exactly: "The problem isn't cooking — it's deciding what to cook"
- [ ] **Body paragraph 1**: "You come home tired and hungry. You open the fridge, stare at the shelves, and draw a blank. You *know* you have food in there. You *know* how to cook. But figuring out what you can actually make with what you have? That's exhausting. So you order takeout — again."
- [ ] **Body paragraph 2**: "That decision fatigue is the real enemy. Not the cooking itself."
- [ ] **"Sound familiar?" button REMOVED**: Verify no button or callout box with this text exists in problem section
- [ ] **Mobile readability**: Verify paragraphs break correctly on mobile (no wall of text)
- [ ] **Emotional resonance** (analytics): After deploy, expect 30% increase in time-on-page for Problem section (SC-005)

**Pass criteria**: Headline correct, narrative complete, button removed, readable on mobile

---

### Final CTA Updates (FR-013 to FR-015)

**Objective**: Outcome-focused CTA increases conversions

- [ ] **Headline verification**: Final CTA headline reads exactly: "Cook more. Order less."
- [ ] **Subheadline verification**: Reads exactly: "Every meal you cook instead of ordering is a win. We're here to remove the one barrier that makes takeout feel easier: the thinking."
- [ ] **Button text verification**: Button reads exactly: "Get Started — It Takes 2 Minutes"
- [ ] **Button link**: Verify button still links to `/login` (unchanged from current)
- [ ] **CTR tracking** (analytics): After deploy, expect 15% increase in CTA click-through rate (SC-004)

**Pass criteria**: All text correct, button functional

---

### Removals (FR-016, FR-017)

**Objective**: Clean up trust-damaging elements

- [ ] **Video placeholder REMOVED**: Verify no black box with "Demo Video Coming Soon" exists anywhere on page
- [ ] **Header subtitle REMOVED**: Verify header logo does NOT include "(French: 'Home Chef')" text
- [ ] **Layout verification**: Ensure removing video didn't break section layout (check for empty space, broken grids)
- [ ] **Header layout**: Verify header still has logo + "HomeCuistot" text + Login/Go to App buttons

**Pass criteria**: Both elements removed, no layout breaks

---

### Visual Preservation (FR-018 to FR-021)

**Objective**: Maintain vibrant neobrutalist design

#### Gradients
- [ ] Header: `bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400`
- [ ] Hero background: `bg-gradient-to-br from-pink-200 via-yellow-200 to-cyan-200 opacity-50`
- [ ] Problem section: `bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300`
- [ ] How It Works: `bg-gradient-to-br from-cyan-300 via-blue-300 to-cyan-300`
- [ ] Final CTA: `bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400`

#### Borders & Shadows
- [ ] Header border: `border-b-4 md:border-b-8 border-black`
- [ ] Section dividers: `border-t-4/border-b-4 md:border-t-8/border-b-8 border-black`
- [ ] Cards: `border-4 md:border-6 border-black`
- [ ] Shadows: `shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]` (or similar variations)

#### Typography
- [ ] Headlines: `font-black uppercase` (900 weight)
- [ ] Body: `font-bold` (700 weight)
- [ ] Responsive sizing: `text-3xl md:text-6xl` (or similar patterns)

#### Rotations (Desktop Only)
- [ ] Verify rotations only apply on md+ breakpoints: `md:rotate-2`, `md:-rotate-1`, etc.
- [ ] Mobile (375px): No rotations visible (prevents horizontal overflow)
- [ ] Desktop (1440px): Playful rotations visible on headlines/cards

#### Responsive Breakpoints
- [ ] **Mobile (375px)**: All text readable, no horizontal scroll, buttons tappable (44x44px min)
- [ ] **Tablet (768px)**: Layout transitions correctly, borders/shadows increase
- [ ] **Desktop (1440px)**: Full design with rotations, largest typography

**Pass criteria**: All visual elements preserved across breakpoints

---

### Performance (SC-006)

**Objective**: <2s load time on 3G mobile

#### Lighthouse Test (Chrome DevTools)
1. Open Chrome DevTools (F12)
2. Navigate to Lighthouse tab
3. Select "Mobile" device
4. Select "Navigation (Default)" mode
5. Throttle to "Slow 3G" in network conditions
6. Run report

**Expected Results**:
- [ ] **First Contentful Paint (FCP)**: <1.8s
- [ ] **Largest Contentful Paint (LCP)**: <2.5s
- [ ] **Total Blocking Time (TBT)**: <200ms
- [ ] **Cumulative Layout Shift (CLS)**: <0.1
- [ ] **Speed Index**: <3.4s

- [ ] **No new assets**: Verify no new images, fonts, or scripts added (text-only change)
- [ ] **DOM size**: Removing video placeholder should reduce DOM nodes by ~10-15

**Pass criteria**: LCP <2.5s on Slow 3G (allows buffer beyond 2s target for real-world variance)

---

## Automated Checks

Run these commands from `apps/nextjs/`:

### TypeScript Compilation
```bash
pnpm tsc --noEmit
```
Expected: Exit code 0, no errors

### Build
```bash
pnpm build
```
Expected: Build succeeds, no compilation errors

### Linting (Optional)
```bash
pnpm lint
```
Expected: Warnings OK per constitution, no errors

---

## Visual Regression Testing

### Before/After Screenshot Comparison

**Tool**: Browser DevTools or manual screenshots

**Breakpoints to test**:
1. Mobile: 375px (iPhone SE)
2. Tablet: 768px (iPad)
3. Desktop: 1440px (MacBook Pro)

**Sections to screenshot**:
- [ ] Header
- [ ] Hero section
- [ ] Problem section
- [ ] How It Works section (all 3 cards)
- [ ] NEW: "This isn't a recipe app" section
- [ ] Final CTA section
- [ ] Footer

**Comparison checklist**:
- [ ] Gradients unchanged
- [ ] Borders/shadows unchanged
- [ ] Font weights unchanged
- [ ] Rotations still desktop-only
- [ ] Button styling unchanged (only text modified)
- [ ] Layout spacing consistent

---

## User Acceptance Testing (Post-Deploy)

### Analytics Setup (Optional)

Track these metrics in Google Analytics or similar:

1. **SC-001**: User comprehension survey (external tool, n=10)
2. **SC-002**: Bounce rate (baseline vs new messaging)
3. **SC-003**: Target audience survey (external tool, n=20)
4. **SC-004**: CTA click-through rate (event tracking)
5. **SC-005**: Problem section time-on-page (scroll tracking)
6. **SC-006**: Lighthouse CI or WebPageTest (automated)

---

## Rollback Procedure

If messaging tests poorly or visual regression detected:

### Quick Rollback
```bash
git log --oneline # Find commit hash before changes
git revert <commit-hash>
git push origin 022-homepage-revamp
```

### Deploy Rollback
If already deployed to production:
```bash
# Assuming Vercel deployment
vercel rollback
```

**No database rollback needed** - This feature has no database migrations or schema changes.

---

## Success Criteria Summary

| Metric | Target | Test Method |
|--------|--------|-------------|
| SC-001: Core value comprehension | 80% articulate correctly | Manual user test (n=10) |
| SC-002: Bounce rate reduction | 20% decrease | Analytics comparison |
| SC-003: Target audience match | 90% experienced cooks say "for me" | Manual survey (n=20) |
| SC-004: CTA click-through rate | 15% increase | Analytics event tracking |
| SC-005: Problem section engagement | 30% time increase | Analytics scroll depth |
| SC-006: Mobile load time | <2s on 3G | Lighthouse mobile audit |

---

## Notes

**Testing Priority**:
1. P1 tests (core value) - critical for bounce rate
2. Visual preservation - critical for brand consistency
3. Performance - critical for mobile users
4. P2/P3 tests - important but not blocking

**MVP Testing Approach** (per constitution):
- Manual testing sufficient for MVP
- Automated tests optional (test infrastructure exists but not required)
- Focus on user scenarios from spec (P1-P3 acceptance criteria)

**Post-MVP Testing** (deferred):
- Comprehensive E2E tests (Playwright)
- A/B testing framework integration
- Automated visual regression (Percy, Chromatic)
- Performance budgets in CI/CD
