# Component Contracts: Inventory Page Rework

**Feature**: 014-inventory-page-rework | **Date**: 2026-01-27

## Component Hierarchy

```
InventoryPage
├── PageContainer
├── Header (title + help button + update button)
├── InventorySection (Available Ingredients)
│   ├── SectionHeader
│   └── IngredientGrid
│       └── IngredientBadge (dots variant, interactive)
│           └── QuantitySelector (popover on click)
├── InventorySection (Pantry Staples)
│   ├── SectionHeader
│   ├── InfoCard (explanation)
│   └── IngredientGrid
│       └── IngredientBadge (dots variant, always full)
├── InventoryUpdateModal
│   ├── InputStage
│   │   ├── VoiceInput (existing)
│   │   └── TextArea (alternative)
│   └── ConfirmationStage
│       ├── UpdateList
│       │   └── UpdateRow (ingredient + before → after badges)
│       ├── UnrecognizedWarning (if any)
│       └── ActionButtons (Save / Cancel)
└── HelpModal
    └── HelpContent (sections for each feature)
```

---

## New Components

### 1. InventorySection

**Path**: `components/inventory/inventory-section.tsx`

**Props**:
```typescript
interface InventorySectionProps {
  title: string;
  description?: string;
  items: InventoryDisplayItem[];
  isPantrySection?: boolean;
  onQuantityChange: (params: { itemId: string; quantity: QuantityLevel }) => void;
  onToggleStaple: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}
```

**Behavior**:
- Renders section header with title
- Optional description (InfoCard for pantry staples)
- Grid of IngredientBadge components
- Empty state if no items

**Styling**: Neo-brutalist section with border-b-4

---

### 2. InventoryUpdateModal

**Path**: `components/inventory/inventory-update-modal.tsx`

**Props**:
```typescript
interface InventoryUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatesApplied: () => void;
  existingInventory: InventoryDisplayItem[];
}
```

**State**:
```typescript
type ModalStage = 'input' | 'processing' | 'confirmation';
type InputMode = 'voice' | 'text';

interface ModalState {
  stage: ModalStage;
  inputMode: InputMode;
  proposal: InventoryUpdateProposal | null;
  error: string | null;
}
```

**Behavior**:
- Stage 1 (input): Voice/text input with toggle
- Stage 2 (processing): Loading skeleton
- Stage 3 (confirmation): Review + save/cancel

**Styling**: Fixed overlay, Card with border-4, max-w-2xl

---

### 3. UpdateConfirmation

**Path**: `components/inventory/update-confirmation.tsx`

**Props**:
```typescript
interface UpdateConfirmationProps {
  proposal: InventoryUpdateProposal;
  existingInventory: InventoryDisplayItem[];
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
}
```

**Behavior**:
- Lists proposed changes with before/after quantity indicators
- Shows "(2 → 3)" format for existing items
- Shows "(new)" for items not in inventory
- Warning alert for unrecognized items
- Save/Cancel buttons at bottom

**Styling**: List with dividers, Alert for warnings

---

### 4. QuantitySelector

**Path**: `components/inventory/quantity-selector.tsx`

**Props**:
```typescript
interface QuantitySelectorProps {
  currentLevel: QuantityLevel;
  onSelect: (level: QuantityLevel) => void;
  onClose: () => void;
}
```

**Behavior**:
- Popover/dropdown with 4 options (0-3)
- Visual indicator showing current selection
- Color-coded options matching IngredientBadge colors
- Click outside to close

**Styling**: Card with shadow, 2x2 grid of options

---

### 5. HelpModal

**Path**: `components/inventory/help-modal.tsx`

**Props**:
```typescript
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Content Sections**:
1. Quantity Badges - tap to adjust, color meanings
2. Pantry Staples - explanation, how to toggle
3. Voice Input - example phrases, tips
4. Text Input - alternative method

**Styling**: Fixed overlay, Card with sections

---

## Existing Components (Reused)

### IngredientBadge

**Path**: `components/retroui/IngredientBadge.tsx`
**Usage**: Dots variant with interactive prop

```typescript
<IngredientBadge
  name="tomatoes"
  level={2}
  variant="dots"
  size="md"
  interactive
  onLevelChange={(newLevel) => handleQuantityChange(newLevel)}
/>
```

---

### VoiceInput

**Path**: `components/recipes/voice-input.tsx`
**Usage**: Direct reuse for voice recording

```typescript
<VoiceInput
  onRecordingComplete={handleAudioBlob}
  disabled={isProcessing}
/>
```

---

### Button

**Path**: `components/retroui/Button.tsx`
**Usage**: All action buttons

- Primary (pink): Save, Update Inventory
- Secondary (yellow): Cancel
- Ghost: Help icon

---

### Card

**Path**: `components/retroui/Card.tsx`
**Usage**: Modal container

---

### Alert

**Path**: `components/retroui/Alert.tsx`
**Usage**: Warning for unrecognized items

```typescript
<Alert status="warning">
  Couldn't recognize: {unrecognized.join(", ")}
</Alert>
```

---

### InfoCard

**Path**: `components/retroui/InfoCard.tsx`
**Usage**: Pantry staples explanation

```typescript
<InfoCard emoji="🏪" heading="Pantry Staples" color="yellow">
  Items here are always available in recipe matching.
</InfoCard>
```

---

## Component Interactions

```
User taps "Update Inventory"
  → InventoryUpdateModal opens (stage: input)
  → User records voice or types text
  → Submit triggers API call
  → Stage changes to "processing" (skeleton)
  → API returns proposal
  → Stage changes to "confirmation"
  → User reviews changes
  → Confirm → batch API call → modal closes → page refreshes
  → Cancel → modal closes (no changes)
```

```
User taps IngredientBadge
  → QuantitySelector popover appears
  → User selects new level
  → Immediate API call to update
  → Badge updates optimistically
  → Toast on error (rollback)
```

```
User taps help icon
  → HelpModal opens
  → User reads content
  → User closes modal
```
