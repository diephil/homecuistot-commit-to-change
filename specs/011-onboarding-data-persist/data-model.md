# Data Model: Onboarding Data Persistence

**Feature**: 011-onboarding-data-persist | **Date**: 2026-01-26

## Entity Diagram

```
┌──────────────────┐       ┌──────────────────┐
│    ingredients   │       │      recipes     │
│  (5931 records)  │       │    (new rows)    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │◄──────│ id (PK)          │
│ name (unique)    │       │ name             │
│ category         │       │ description      │
│ createdAt        │       │ userId (FK)      │
└────────┬─────────┘       │ isSeeded=false   │
         │                 │ createdAt        │
         │                 └────────┬─────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐       ┌──────────────────┐
│  user_inventory  │       │   user_recipes   │
│    (new rows)    │       │    (new rows)    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ userId           │       │ userId           │
│ ingredientId(FK) │       │ recipeId (FK)────┼───►
│ quantityLevel=3  │       │ source='onbrdng' │
│ updatedAt        │       │ createdAt        │
└──────────────────┘       └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│user_pantry_staple│       │recipe_ingredients│
│    (new rows)    │       │    (new rows)    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ userId           │       │ recipeId (FK)    │
│ ingredientId(FK) │       │ ingredientId(FK) │
│ createdAt        │       │ ingredientType   │
└──────────────────┘       │   ='anchor'      │
                           │ createdAt        │
                           └──────────────────┘

┌──────────────────┐
│unrecognized_items│
│    (new rows)    │
├──────────────────┤
│ id (PK)          │
│ userId           │
│ rawText          │
│ context='onbrdng'│
│ resolvedAt=null  │
│ createdAt        │
└──────────────────┘
```

## Tables Used (No Schema Changes)

### ingredients (read-only)
- Lookup table with 5931 pre-populated records
- Query: `WHERE LOWER(name) IN (...)`

### recipes (insert)
| Field | Type | Source |
|-------|------|--------|
| id | uuid | auto |
| name | text | user input |
| description | text | LLM generated |
| userId | uuid | session.user.id |
| isSeeded | boolean | false |
| createdAt | timestamp | auto |

### user_recipes (insert)
| Field | Type | Source |
|-------|------|--------|
| id | uuid | auto |
| userId | uuid | session.user.id |
| recipeId | uuid | FK to recipes.id |
| source | text | 'onboarding' |
| createdAt | timestamp | auto |

### recipe_ingredients (insert)
| Field | Type | Source |
|-------|------|--------|
| id | uuid | auto |
| recipeId | uuid | FK to recipes.id |
| ingredientId | uuid | FK to ingredients.id |
| ingredientType | text | 'anchor' |
| createdAt | timestamp | auto |

### user_inventory (insert)
| Field | Type | Source |
|-------|------|--------|
| id | uuid | auto |
| userId | uuid | session.user.id |
| ingredientId | uuid | FK to ingredients.id |
| quantityLevel | int | 3 (full) |
| updatedAt | timestamp | auto |

### user_pantry_staples (insert)
| Field | Type | Source |
|-------|------|--------|
| id | uuid | auto |
| userId | uuid | session.user.id |
| ingredientId | uuid | FK to ingredients.id |
| createdAt | timestamp | auto |

### unrecognized_items (insert)
| Field | Type | Source |
|-------|------|--------|
| id | uuid | auto |
| userId | uuid | session.user.id |
| rawText | text | unmatched item name |
| context | text | 'ingredient' or 'dish' |
| resolvedAt | timestamp | null |
| createdAt | timestamp | auto |

## Validation Rules

### Input Validation (Zod)
```typescript
const PersistRequestSchema = z.object({
  dishes: z.array(z.string().min(1).max(100)).max(20),
  ingredients: z.array(z.string().min(1).max(100)).max(100),
  pantryItems: z.array(z.string().min(1).max(100)).max(50)
})
```

### Database Constraints
- `recipes.recipe_ownership`: isSeeded=false requires userId NOT NULL
- `user_inventory.quantity_level_check`: quantityLevel BETWEEN 0 AND 3
- All FK constraints with ON DELETE CASCADE/RESTRICT

## State Transitions

```
Onboarding Step 3 (client state)
         │
         ▼ [Complete Setup clicked]
┌─────────────────────────────────┐
│   POST /api/onboarding/persist  │
├─────────────────────────────────┤
│ 1. Validate auth                │
│ 2. Match user ingredients (IN)  │
│ 3. Log unrecognized (ctx=ingr)  │
│ 4. Generate recipe via LLM      │
│ 5. Match LLM ingredients (IN)   │
│ 6. Log unrecognized (ctx=ingr)  │
│ 7. Insert all records (tx)      │
│    - recipes                    │
│    - user_recipes               │
│    - recipe_ingredients (matched)│
│    - user_inventory             │
│    - user_pantry_staples        │
│    - unrecognized_items         │
└─────────────────────────────────┘
         │
         ▼
    Step 4 (4s timer)
         │
         ▼
    Redirect to /app
         │
         ▼
    Fetch user_recipes
    Display Available Recipes
```

## Idempotency

All inserts use `ON CONFLICT DO NOTHING`:
- Unique(userId, ingredientId) on user_inventory
- Unique(userId, ingredientId) on user_pantry_staples
- Unique(userId, recipeId) on user_recipes
- Unique(recipeId, ingredientId) on recipe_ingredients

User refresh during Step 4 = safe, no duplicates.
