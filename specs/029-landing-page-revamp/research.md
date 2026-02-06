# Research: Landing Page Revamp

**Feature**: 029-landing-page-revamp
**Date**: 2026-02-06

## Research Summary

No NEEDS CLARIFICATION items in Technical Context. All decisions resolved by the user-provided `final-spec.md` and existing codebase patterns.

## Decisions

### Decision 1: LandingRecipeCard vs Modifying RecipeCard

- **Decision**: Create a separate `LandingRecipeCard` component
- **Rationale**: The existing `RecipeCard` is tightly coupled to app data models (`Recipe`, `RecipeIngredient` with DB IDs) and interactivity (`onEdit`, `onDelete`, `onIngredientToggle`). The landing page needs a simpler, read-only component with status-based styling (cookable/almost/missing) and hardcoded mock data. Modifying `RecipeCard` would add unnecessary complexity for a fundamentally different use case.
- **Alternatives considered**:
  - Modify `RecipeCard` with optional props: Rejected — adds complexity to an already complex component, different data shape (no DB IDs), different visual states (status-based backgrounds)
  - Reuse `OnboardingRecipeCard`: Rejected — similar but lacks status badge, status-based backgrounds, and availability indicators. Would need significant modifications.

### Decision 2: Component Placement

- **Decision**: `src/components/landing/LandingRecipeCard.tsx`
- **Rationale**: Per CLAUDE.md rules, components used by only 1 page go in a domain folder. The landing page is the sole consumer.
- **Alternatives considered**:
  - `src/components/shared/`: Rejected — only used by landing page, not cross-domain

### Decision 3: Mock Data Location

- **Decision**: Hardcoded `LANDING_RECIPES` constant in `page.tsx`
- **Rationale**: The mock data is page-specific presentation data, not shared. Keeping it co-located with the page that uses it is simplest.
- **Alternatives considered**:
  - Separate constants file: Rejected — over-engineering for 3 hardcoded objects used in one place

### Decision 4: Anti-Positioning Mobile Order

- **Decision**: Use CSS `order` utilities to show HomeCuistot column first on mobile
- **Rationale**: The spec requires positive messaging first on mobile. CSS `order-first` on the HomeCuistot column (or `md:order-last` on recipe apps column) achieves this without DOM duplication.
- **Alternatives considered**:
  - Duplicate DOM with show/hide: Rejected — unnecessary complexity
  - Reverse grid direction on mobile: Rejected — less explicit than `order` utility

### Decision 5: Existing Components Used As-Is

- **Decision**: No modifications to Badge, Button, Text, Header, Footer
- **Rationale**: All needed variants already exist. Badge has `outline`, `default`, and `solid` variants. Button has `asChild` for Link wrapping. Text supports h2-h4 and p elements.
- **Alternatives considered**: None needed — existing components cover all requirements

## Patterns from Existing Codebase

### Neo-Brutal Card Pattern (from RecipeCard/OnboardingRecipeCard)
```
border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-{color}-200 to-{color}-300
```

### Section Pattern (from current page.tsx)
```
<section className="py-12 md:py-28 border-b-4 md:border-b-8 border-black bg-gradient-to-...">
  <div className="max-w-{5xl|6xl|7xl} mx-auto px-4 md:px-8 relative">
```

### Button Press Animation Pattern
```
shadow-[N] hover:shadow-[N/2] hover:translate-x-[Npx] hover:translate-y-[Npx] transition-all
```

### Badge Usage for Ingredients (from RecipeCard)
```
<Badge variant="outline" className="bg-white/50">ingredient name</Badge>
```
