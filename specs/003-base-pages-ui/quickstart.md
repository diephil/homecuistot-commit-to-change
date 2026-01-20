# Quickstart: Base Pages UI Foundation

**Date**: 2026-01-20
**Context**: Local development setup and visual verification guide

---

## Prerequisites

- Node.js 18+ installed
- pnpm package manager installed
- Repository cloned locally

---

## Setup

### 1. Install Dependencies

```bash
cd apps/nextjs
pnpm install
```

### 2. Install RetroUI Components

Install required shadcn/ui components from RetroUI registry:

```bash
# Badge component (for dish/ingredient selection)
pnpm dlx shadcn@latest add badge --registry @retroui

# Card component (for recipe display)
pnpm dlx shadcn@latest add card --registry @retroui

# Button component (for CTAs and navigation)
pnpm dlx shadcn@latest add button --registry @retroui
```

**Note**: Components install to `apps/nextjs/src/components/ui/`

### 3. Add Icons

Install lucide-react for icons (microphone, empty states):

```bash
pnpm add lucide-react
```

---

## Development

### Start Dev Server

```bash
pnpm dev
```

Server runs at `http://localhost:3000` (default Next.js port)

### Available Routes

| Route | Description | Spec Reference |
|-------|-------------|----------------|
| `/` | Landing page | FR-001 |
| `/login` | Login page with OAuth CTAs | FR-002 |
| `/onboarding` | 3-step onboarding (single route) | FR-004-008 |
| `/suggestions` | Available/almost-available recipes | FR-009 |
| `/inventory` | Ingredient list with quantity levels | FR-010 |
| `/recipes` | Recipe cards grid | FR-011 |

---

## Visual Verification Checklist

### Landing Page (/)

- [ ] Logo and "Home Cuistot" title visible at top
- [ ] Sign up/login CTAs present
- [ ] Hero section with headline visible
- [ ] Origin/problem section visible
- [ ] How-it-works section visible
- [ ] Responsive layout (test 320px mobile → 1920px desktop)
- [ ] No horizontal scroll at any viewport width

### Login Page (/login)

- [ ] Google OAuth CTA visible
- [ ] Discord OAuth CTA visible
- [ ] Responsive layout on mobile/desktop

### Onboarding Page (/onboarding)

**Step 1 (Initial view)**:
- [ ] Welcome message visible
- [ ] Voice authorization note visible
- [ ] "Start Onboarding" CTA visible

**Step 2 (After clicking "Start")**:
- [ ] Three sections: dishes, fridge items, pantry items
- [ ] Badge-style buttons display (5-10 items per section)
- [ ] Some badges visually highlighted (pre-selected state)
- [ ] Badges wrap on narrow screens (no horizontal scroll)
- [ ] Continue/clear CTAs visible at bottom

**Step 3 (After clicking "Continue")**:
- [ ] Summary of selected dishes visible
- [ ] Summary of fridge/pantry ingredients (grouped as "Ingredients")
- [ ] Microphone icon + "Tap to speak" text visible
- [ ] "Finish Onboarding" button visible

**Sliding transition**:
- [ ] Smooth sliding animation between steps
- [ ] URL stays `/onboarding` (no route changes)

### Suggestions Page (/suggestions)

- [ ] "Available Recipes" section visible
- [ ] Recipe cards display (title, description, ingredients)
- [ ] "Almost Available Recipes" section visible
- [ ] "Mark as Cooked" CTA per recipe
- [ ] Navigation CTAs to inventory and recipes pages
- [ ] Recipe titles truncate with ellipsis if long

### Inventory Page (/inventory)

- [ ] Ingredient list displays (5-10 fridge + 5-10 pantry items)
- [ ] Quantity levels (0-3) visible per ingredient
- [ ] Instructions for editing quantities visible
- [ ] Microphone icon + instructional text visible
- [ ] Ingredient names truncate with ellipsis if long

### Recipes Page (/recipes)

- [ ] Recipe cards grid displays
- [ ] "Add a new recipe" card visible
- [ ] Edit/delete/mark as cooked CTAs per recipe
- [ ] Recipe titles truncate with ellipsis if long
- [ ] Grid wraps responsively on narrow screens

### Empty States (Manual Test)

Edit mock data constants to empty arrays `[]` and verify:

- [ ] Empty recipes: "No recipes yet" + icon displays
- [ ] Empty ingredients: "No ingredients yet" + icon displays

---

## Testing Responsive Behavior

### Mobile (320px - 768px)

```bash
# Use browser DevTools responsive mode
# Test viewports: 320px, 375px, 414px, 768px
```

Verify:
- [ ] Badge buttons wrap to multiple rows
- [ ] Recipe cards stack vertically
- [ ] No horizontal scroll
- [ ] Text truncates properly

### Tablet (768px - 1024px)

Verify:
- [ ] Recipe cards display in 2-column grid
- [ ] Badge buttons wrap if needed

### Desktop (1024px+)

Verify:
- [ ] Recipe cards display in 3-column grid
- [ ] All content fits viewport width (no horizontal scroll up to 1920px)

---

## Performance Verification

### Page Load Test

Open browser DevTools → Network tab:

- [ ] Landing page loads <2s (SC-008)
- [ ] All pages load <2s on standard connection
- [ ] No console errors on any page

### Build Test

```bash
pnpm build
```

Verify:
- [ ] Build completes without TypeScript errors
- [ ] No build warnings related to UI components

---

## Common Issues

### Issue: RetroUI components not found

**Solution**: Ensure components installed from `@retroui` registry, not default shadcn registry.

### Issue: Icons not displaying

**Solution**: Verify `lucide-react` installed and icons imported correctly:

```typescript
import { Mic, UtensilsCrossed } from 'lucide-react';
```

### Issue: Sliding transition not smooth

**Solution**: Check Tailwind config includes transition utilities:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      transitionProperty: {
        'transform': 'transform',
      }
    }
  }
}
```

---

## Next Steps

After visual verification passes:

1. Run `/speckit.tasks` to generate implementation tasks
2. Implement pages incrementally (Landing → Login → Onboarding → Main App)
3. Manual visual testing after each page
4. Final verification against all success criteria (SC-001-008)
