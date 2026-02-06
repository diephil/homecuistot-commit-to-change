# Data Model: Landing Page Revamp

**Feature**: 029-landing-page-revamp
**Date**: 2026-02-06

## Overview

No database entities. All data is hardcoded mock data for static presentation.

## Component Interface

### LandingRecipeCardProps

```typescript
interface LandingRecipeCardProps {
  name: string
  description: string
  ingredients: Array<{
    name: string
    type: 'anchor' | 'optional'
    available: boolean
  }>
  status: 'cookable' | 'almost' | 'missing'
}
```

**Field descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Recipe display name |
| `description` | string | Short recipe description (1-2 sentences) |
| `ingredients` | Array | List of ingredients with metadata |
| `ingredients[].name` | string | Ingredient display name |
| `ingredients[].type` | 'anchor' \| 'optional' | Whether ingredient is core to the recipe |
| `ingredients[].available` | boolean | Whether user has this ingredient |
| `status` | 'cookable' \| 'almost' \| 'missing' | Overall recipe availability status |

### Status-to-Visual Mapping

| Status | Background | Badge Text | Badge Color |
|--------|-----------|------------|-------------|
| `cookable` | green-200 → green-300 | "Ready tonight" | green |
| `almost` | yellow-200 → yellow-300 | "Missing N" | yellow |
| `missing` | gray-100 → gray-200 | "Missing N" | gray |

### Mock Data (3 instances)

1. **Pasta Carbonara**: status=cookable, 6 ingredients, 0 missing
2. **Chicken Stir-Fry**: status=almost, 6 ingredients, 1 missing (Bell pepper)
3. **Shakshuka**: status=missing, 6 ingredients, 3 missing (Tomato, Onion, Cumin)

## Relationships

- `LandingRecipeCard` → uses `Badge` from `@/components/shared`
- `page.tsx` → imports `LandingRecipeCard` from `@/components/landing/LandingRecipeCard`
- `page.tsx` → imports `Header`, `Footer`, `Text`, `Button` from `@/components/shared`
- `page.tsx` → imports `Link` from `next/link`
