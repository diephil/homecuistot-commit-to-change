# Research: Base Pages UI Foundation

**Date**: 2026-01-20
**Context**: Phase 0 research for visual-only UI pages using RetroUI components

---

## 1. RetroUI Component Catalog

### Decision
Use RetroUI registry components from shadcn/ui with neo-brutalist styling for all UI elements.

### Component Mapping

| Page Section | RetroUI Component | Usage |
|--------------|-------------------|-------|
| Badge/chip selection | `@retroui/badge` | Dish/ingredient selection buttons (FR-013) |
| Recipe cards | `@retroui/card` | Recipe display with title, description, ingredients (FR-017) |
| Primary CTAs | `@retroui/button` | Sign up, login, onboarding navigation (FR-013) |
| Empty states | Custom component using `@retroui/card` + lucide-react icons | "No recipes yet" with icon (FR-019) |
| Navigation links | `@retroui/button` variant="link" | Navigate between pages (FR-006) |
| Microphone input | `@retroui/button` + lucide-react `Mic` icon | Visual placeholder (FR-016) |
| Page sections | Native `<div>` with Tailwind classes | Hero, content sections (FR-001) |
| Ingredient lists | Native `<ul>` with Tailwind + badge components | Quantity indicators (FR-018) |

### Rationale
RetroUI components align with neo-brutalist design (Principle VII): bold borders, sharp corners, high contrast. Minimal custom components needed - leverage registry for consistency.

### Alternatives Considered
- **Custom components**: Rejected - increases maintenance burden, RetroUI already implements neo-brutalist patterns
- **Headless UI + custom styling**: Rejected - over-engineering for visual-only MVP

---

## 2. Mock Data Structure Patterns

### Decision
Use `as const` assertions for type-safe mock data constants at top of page.tsx files.

### Pattern

```typescript
// apps/nextjs/src/app/(protected)/inventory/page.tsx

const MOCK_INGREDIENTS = [
  { id: '1', name: 'Tomatoes', category: 'fridge', quantityLevel: 3 },
  { id: '2', name: 'Eggs', category: 'fridge', quantityLevel: 1 },
  { id: '3', name: 'Milk', category: 'fridge', quantityLevel: 2 },
  // ... 5-10 items total
] as const;

type Ingredient = typeof MOCK_INGREDIENTS[number];
```

### Rationale
- `as const` provides literal type inference (quantityLevel = 0 | 1 | 2 | 3, not number)
- Type derivation follows Principle V (no manual type duplication)
- Inline constants keep data with UI (no separate data layer for mock-only feature)
- TypeScript strict mode enforced (Principle II)

### Alternatives Considered
- **Separate data files**: Rejected - adds unnecessary abstraction for visual-only feature
- **Explicit types**: Rejected - violates Principle V (type derivation over duplication)
- **JSON files**: Rejected - no type safety, requires parsing

---

## 3. Onboarding Step Transition Pattern

### Decision
Use `useState` for current step + Tailwind CSS transitions for sliding effect.

### Implementation Approach

```typescript
// apps/nextjs/src/app/(protected)/onboarding/page.tsx

'use client';
import { useState } from 'react';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
      >
        <div className="min-w-full">{/* Step 1 content */}</div>
        <div className="min-w-full">{/* Step 2 content */}</div>
        <div className="min-w-full">{/* Step 3 content */}</div>
      </div>
    </div>
  );
}
```

### Rationale
- Single route /onboarding with client-side state (FR-004)
- CSS transform for sliding animation (FR-015)
- No actual routing changes (meets "purely visual" constraint)
- Simple implementation aligns with MVP-First (Principle I)

### Alternatives Considered
- **React Router nested routes**: Rejected - violates "no routing" requirement (FR-015)
- **Carousel library**: Rejected - over-engineering for 3 static steps
- **Tab component**: Rejected - doesn't provide sliding visual effect

---

## 4. Responsive Badge Wrapping

### Decision
Use Tailwind `flex flex-wrap` with gap utilities for badge wrapping.

### CSS Pattern

```typescript
<div className="flex flex-wrap gap-2">
  {MOCK_DISHES.map(dish => (
    <Badge key={dish.id}>{dish.name}</Badge>
  ))}
</div>
```

### Rationale
- `flex-wrap` creates multi-row layout on narrow screens (FR-021)
- `gap-2` provides consistent spacing between wrapped badges
- Maintains badge size (no shrinking) as required
- No horizontal scroll - flexbox handles wrapping automatically
- Works across all viewport widths (320px-1920px, SC-003)

### Alternatives Considered
- **Grid auto-fit**: Rejected - harder to control min-width, potential size inconsistency
- **Custom breakpoint logic**: Rejected - over-engineered, flexbox handles responsiveness naturally

---

## 5. Text Truncation Pattern

### Decision
Use Tailwind `truncate` utility class for single-line ellipsis truncation.

### CSS Pattern

```typescript
// Recipe title
<h3 className="truncate text-lg font-mono">{recipe.title}</h3>

// Ingredient name
<span className="truncate">{ingredient.name}</span>
```

### Rationale
- `truncate` = `overflow-hidden text-ellipsis whitespace-nowrap` (FR-020)
- Single utility class, simple implementation
- Works for all text elements (ingredient names, recipe titles)
- Maintains layout integrity (no dynamic height changes)
- Browser compatible (ellipsis is standard CSS)

### Alternatives Considered
- **line-clamp**: Rejected - unnecessary for single-line truncation
- **Manual overflow/ellipsis combo**: Rejected - `truncate` is cleaner, same result

---

## Research Completion Summary

All 5 research questions resolved with concrete technical decisions:

1. ✅ RetroUI component mapping complete
2. ✅ Mock data pattern defined (`as const` assertions)
3. ✅ Onboarding transition approach specified (useState + CSS transform)
4. ✅ Badge wrapping pattern specified (flex-wrap)
5. ✅ Text truncation pattern specified (truncate utility)

**Next Phase**: Generate data-model.md and quickstart.md (Phase 1)
