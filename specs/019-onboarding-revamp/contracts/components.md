# Component Contracts: Onboarding Steps 2 & 3 Revamp

**Branch**: `019-onboarding-revamp` | **Date**: 2026-01-31

## Shared Components

### IngredientChip

**Location**: `components/shared/IngredientChip.tsx`

**Purpose**: Reusable chip for displaying ingredients in selectable or read-only mode.

#### Props
```typescript
interface IngredientChipProps {
  name: string;
  selected?: boolean;      // visual selection state
  readOnly?: boolean;      // disable interactions (step 3 display)
  onToggle?: () => void;   // click handler (step 2 selection)
  className?: string;      // additional styling
}
```

#### Visual States (Neobrutalism)
- **Default (unselected)**: `bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- **Selected**: `bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- **Read-only**: `bg-gray-200 border-2 border-gray-400 opacity-75` (visually distinct per FR-011)
- **Hover (when selectable)**: `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]`

#### Accessibility
- `role="button"` when selectable
- `aria-pressed={selected}` when selectable
- `tabIndex={0}` for keyboard navigation
- `onKeyDown` handler for Enter/Space

---

## Page Component Updates

### Step 2 Section: Cooking Skills

**New section before ingredients**

#### Props/State
```typescript
// Local state in onboarding page
const [cookingSkill, setCookingSkill] = useState<'basic' | 'advanced' | null>(null);
```

#### UI Elements
- Two radio-style buttons: "Basic" and "Advanced"
- Selected: bright color + checkmark
- Unselected (after selection): grayed out
- Section hidden until skill selected

---

### Step 2 Section: Ingredients

**Appears after skill selection**

#### Props/State
```typescript
const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
```

#### UI Elements
- Grid of 16 `IngredientChip` components
- Multi-select behavior (toggle on click)
- "Next Step" button: disabled until 1+ selected
- Hint text: hidden until skill + 1+ ingredients selected

---

### Step 3 Section: Add More Ingredients

**Replaces current step 3**

#### Props/State
```typescript
// ingredients from step 2 + voice/text additions
const [ingredients, setIngredients] = useState<string[]>([...step2Ingredients]);
```

#### UI Elements
- Title: "Add more ingredients"
- Read-only grid of `IngredientChip` (from step 2)
- Voice input section (reuse existing)
- Text input fallback ("Prefer to type instead?")
- Toast on add/remove: "Ingredient list has been updated"
- "Complete Setup" button: disabled if ingredients empty
