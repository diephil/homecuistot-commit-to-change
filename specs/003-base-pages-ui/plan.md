# Implementation Plan: Base Pages UI Foundation

**Branch**: `003-base-pages-ui` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-base-pages-ui/spec.md`

## Summary

Build foundational UI pages with mock data using RetroUI components from shadcn/ui registry. Create 6 page routes (landing, login, onboarding, suggestions, inventory, recipes) with responsive layouts, no interactions/behavior, purely visual demonstration. Mock data declared as constants at top of page.tsx files (5-10 items per category).

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode), React 19, Next.js 16
**Primary Dependencies**: shadcn/ui, RetroUI registry (@retroui), Tailwind CSS v4, React
**Storage**: N/A (mock data only, no persistence)
**Testing**: Manual visual testing (no automated tests for MVP)
**Target Platform**: Web (Next.js 16 app router)
**Project Type**: Web (Next.js monorepo with apps/nextjs)
**Performance Goals**: <2s initial page render (SC-008)
**Constraints**: Mock data only, no state mutations, visual-only (no click handlers/form submissions), 320px-1920px responsive
**Scale/Scope**: 6 routes, ~15-20 RetroUI components, 30-50 mock data items total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: MVP-First Development
✅ **PASS** - Feature completeness prioritized (all 6 pages defined), happy paths only (visual layout), manual validation acceptable (visual testing), edge cases identified but minimal (empty states, text truncation, wrapping)

### Principle II: Pragmatic Type Safety
✅ **PASS** - TypeScript strict mode enabled, mock data will be properly typed, boundary types at component props, internal looseness acceptable for visual-only components

### Principle III: Essential Validation Only
✅ **PASS** - No validation needed (mock data, no user inputs, no database operations)

### Principle IV: Test-Ready Infrastructure
✅ **PASS** - Test infrastructure exists (`pnpm test`), manual testing only for MVP (visual verification), no automated tests required for static UI

### Principle V: Type Derivation Over Duplication
✅ **PASS** - Mock data types will be derived from const assertions (`as const`), component prop types from RetroUI, no complex schemas needed

### Principle VI: Named Parameters for Clarity
✅ **PASS** - Component props naturally use named params (React convention), function signatures will follow rule (3+ args or 2+ same type → named params)

### Principle VII: Neo-Brutalist Design System
✅ **PASS** - RetroUI registry aligns with neo-brutalist principles (bold borders, sharp corners, high contrast, monospace fonts), design system naturally followed through component usage

### Non-Negotiable Safeguards
✅ **PASS** - No user data (mock only), no auth implementation (placeholder wrappers), no SQL (no database), no secrets (no backend), TypeScript compilation required, no crashes (static pages)

**Constitution Compliance**: ✅ ALL GATES PASSED

## Project Structure

### Documentation (this feature)

```text
specs/003-base-pages-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output (RetroUI component catalog, mock data patterns)
├── data-model.md        # Phase 1 output (mock data type definitions)
├── quickstart.md        # Phase 1 output (local dev setup, page navigation)
├── contracts/           # N/A (no API contracts for visual-only UI)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx           # FR-002: Login page
│   │   ├── (protected)/
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx           # FR-004-008: Onboarding with 3 steps
│   │   │   ├── suggestions/
│   │   │   │   └── page.tsx           # FR-009: Suggestions page
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx           # FR-010: Inventory page
│   │   │   └── recipes/
│   │   │       └── page.tsx           # FR-011: Recipes page
│   │   ├── page.tsx                   # FR-001: Landing page (root)
│   │   └── layout.tsx                 # Root layout (if modifications needed)
│   └── components/
│       └── ui/                        # RetroUI components (from registry)
└── public/
    └── icons/                          # SVG icons for microphone, empty states
```

**Structure Decision**: Next.js 16 app router with route groups for auth separation. `(auth)` group for public pages (login), `(protected)` group for protected pages (onboarding, suggestions, inventory, recipes), root-level page.tsx for landing. All mock data declared as constants at top of each page.tsx file. No separate data layer needed for visual-only implementation.

## Complexity Tracking

No constitution violations. All gates passed without exceptions.

---

# Phase 0: Research & Discovery

## Research Tasks

### 1. RetroUI Component Catalog
**Question**: Which RetroUI components from shadcn/ui registry should be used for each page section?

**Research Scope**:
- Badge/chip components for dish/ingredient selection (FR-013)
- Card components for recipe display (FR-017)
- Button components for CTAs (FR-013)
- Empty state components (FR-019)
- Layout/container components for responsive design (FR-014)
- Icon components for microphone visual (FR-016)

**Deliverable**: Component mapping table (page section → RetroUI component)

### 2. Mock Data Structure Patterns
**Question**: What TypeScript patterns for mock data constants ensure type safety and maintainability?

**Research Scope**:
- `as const` assertions for literal types
- Array structures for lists (5-10 items per category)
- Object shapes for dishes, ingredients, recipes
- Type inference from const assertions vs explicit types

**Deliverable**: Mock data pattern guide with examples

### 3. Onboarding Step Transition Pattern
**Question**: How to implement visual sliding transitions between onboarding steps without routing (FR-015)?

**Research Scope**:
- Client-side state management for current step (useState)
- CSS transitions or Tailwind animations for sliding effect
- Carousel/stepper component patterns
- Accessibility considerations for step transitions

**Deliverable**: Step transition implementation approach

### 4. Responsive Badge Wrapping
**Question**: What Tailwind classes achieve badge wrapping on narrow screens while maintaining size (FR-021)?

**Research Scope**:
- Flexbox wrap utilities (`flex-wrap`)
- Grid auto-fit patterns
- Min-width constraints for badges
- Gap/spacing utilities for wrapped layouts

**Deliverable**: Badge layout CSS pattern

### 5. Text Truncation Pattern
**Question**: What Tailwind pattern achieves single-line truncation with ellipsis (FR-020)?

**Research Scope**:
- `truncate` utility class
- `line-clamp` utilities
- `overflow-hidden`, `text-ellipsis`, `whitespace-nowrap` combination
- Browser compatibility considerations

**Deliverable**: Text truncation CSS pattern

---

# Phase 1: Design & Contracts

*(Phase 1 artifacts generated after research.md is complete)*

## Phase 1 Outputs

### data-model.md
Mock data type definitions:
- `Dish` type (id, name, isSelected)
- `Ingredient` type (id, name, category, quantityLevel)
- `Recipe` type (id, title, description, ingredients, isAvailable)
- Mock data constants for each category

### quickstart.md
Local development setup:
- Install RetroUI components from registry
- Run dev server (`pnpm dev`)
- Navigate to each page route
- Visual verification checklist

### contracts/
N/A - No API contracts for visual-only UI

---

# Phase 2: Task Generation

*(Tasks generated by `/speckit.tasks` command after plan approval)*

Task categories:
1. Setup: Install RetroUI components, configure Tailwind for neo-brutalist design
2. Public Pages: Landing page (FR-001), Login page (FR-002)
3. Onboarding: Single-route 3-step onboarding with transitions (FR-004-008)
4. Main App: Suggestions (FR-009), Inventory (FR-010), Recipes (FR-011)
5. Visual Polish: Empty states (FR-019), text truncation (FR-020), badge wrapping (FR-021)
6. Verification: Manual visual testing against success criteria (SC-001-008)
