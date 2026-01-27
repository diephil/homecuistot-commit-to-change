# Research: Inventory Page Rework

**Feature**: 014-inventory-page-rework | **Date**: 2026-01-27

## 1. Reusable Component Analysis

### Decision: Extract shared components from recipe-form.tsx

**Rationale**: Recipe form contains modal, voice/text toggle, and confirmation patterns that apply directly to inventory updates.

**Components to Extract/Reuse**:
| Component | Source | Reuse Strategy |
|-----------|--------|----------------|
| VoiceInput | `components/recipes/voice-input.tsx` | Reuse as-is |
| useVoiceInput | `hooks/useVoiceInput.ts` | Reuse as-is |
| Modal overlay pattern | `recipe-form.tsx` lines 47-51 | Extract to shared component or copy pattern |
| Input mode toggle | `recipe-form.tsx` lines 120-140 | Copy pattern (simple enough) |
| Loading skeleton | `recipe-form.tsx` lines 78-90 | Copy pattern |

**Alternatives Considered**:
- Create generic Modal component: Rejected, overhead for MVP
- Use headless UI library: Rejected, inconsistent with RetroUI patterns

### Decision: Use IngredientBadge "dots" variant per spec

**Rationale**: Spec explicitly states "dots variant" for color-coded dot matrix. Component already supports:
- 4 quantity levels (0-3) with distinct colors
- Click-to-cycle interaction
- Responsive sizing

**No Changes Needed**: Component supports all requirements.

---

## 2. LLM Prompt Design for Inventory Updates

### Decision: Create dedicated inventory-update prompt (separate from recipe-editor)

**Rationale**: Different extraction requirements:
- Recipe prompt: title, description, ingredients with optional flags
- Inventory prompt: ingredient names with quantity levels

**Prompt Requirements**:
1. Extract ingredient names (lowercase, singular)
2. Determine quantity level (0-3) from context:
   - "just bought" / "restocked" → 3 (full)
   - "have enough for X meals" → X (capped at 3)
   - "running low" / "almost out" → 1
   - "ran out" / "used last" → 0
3. Handle multiple ingredients in single utterance
4. Handle conflicting mentions (use last value)

**Schema Design**:
```typescript
const inventoryUpdateSchema = z.object({
  updates: z.array(z.object({
    ingredientName: z.string().min(1),
    quantityLevel: z.number().int().min(0).max(3),
    confidence: z.enum(['high', 'medium', 'low']),
  })),
});
```

**Opik Prompt Definition** (following existing pattern):
```typescript
export const INVENTORY_UPDATE_PROMPT = {
  name: "inventory-update",
  description: "Extract ingredient names and quantity levels from voice or text input",
  prompt: `You are an inventory update assistant...`, // Full prompt in prompt.ts
  metadata: { inputType: "audio|text", domain: "inventory", model: "gemini-2.0-flash" },
  tags: ["inventory", "extraction", "voice-input", "gemini"],
};
```

**npm Scripts** (add to package.json):
- `prompt:inventory`: Register to local Opik
- `prompt:inventory:prod`: Register to production Opik
- Update `prompt:all` and `prompt:all:prod` to include inventory

**Alternatives Considered**:
- Extend recipe prompt: Rejected, different output structure
- Use separate model call per ingredient: Rejected, latency

---

## 3. Ingredient Validation Strategy

### Decision: Case-insensitive ILIKE search against ingredients table

**Rationale**: Existing pattern in `recipes.ts:validateIngredients()` works well:
```typescript
await db.select().from(ingredients)
  .where(ilike(ingredients.name, ingredientName))
```

**Validation Flow**:
1. LLM extracts ingredient names
2. Server validates each against 5931-ingredient database
3. Split results: `{ recognized: [], unrecognized: [] }`
4. Client shows warning for unrecognized, continues with recognized

**Edge Cases**:
- Plural forms: LLM prompt instructs singular, but ILIKE handles minor variations
- Synonyms (e.g., "zucchini" vs "courgette"): Accept both if in database
- Unknown ingredients: Add to unrecognized items, show warning

**Alternatives Considered**:
- Fuzzy matching (Levenshtein): Rejected, adds complexity for MVP
- Autocomplete during voice: Rejected, interrupts natural flow

---

## 4. Quantity Level Inference Patterns

### Decision: Map natural language patterns to quantity levels

**Mapping Table**:
| Pattern | Quantity Level | Confidence |
|---------|---------------|------------|
| "just bought", "restocked", "fresh", "new" | 3 | high |
| "have plenty", "lots of", "full" | 3 | high |
| "enough for X meals" (X >= 3) | 3 | high |
| "enough for 2 meals" | 2 | high |
| "enough for 1 meal" | 1 | high |
| "running low", "almost out", "last bit" | 1 | medium |
| "some", "a few" | 2 | medium |
| "ran out", "finished", "used the last", "none left" | 0 | high |
| No quantity context mentioned | 3 | low (assume bought) |

**Prompt Instruction**:
> When quantity context is unclear and user mentions an ingredient without explicit level, assume they are adding/restocking (level 3).

**Alternatives Considered**:
- Ask user to clarify each ingredient: Rejected, poor UX
- Default to level 2 (medium): Rejected, "buying" implies full

---

## 5. Database Operations

### Decision: Use batch upsert pattern for confirmed updates

**Rationale**: User confirms multiple changes at once; batch operation is efficient.

**Pattern** (from existing codebase):
```typescript
await db.insert(userInventory)
  .values(updates.map(u => ({
    userId: token.sub,
    ingredientId: u.ingredientId,
    quantityLevel: u.quantityLevel,
    isPantryStaple: false,
  })))
  .onConflictDoUpdate({
    target: [userInventory.userId, userInventory.ingredientId],
    set: {
      quantityLevel: sql`excluded.quantity_level`,
      updatedAt: sql`now()`,
    },
  });
```

**Alternatives Considered**:
- Individual UPDATE calls: Rejected, N+1 queries
- Transaction with manual conflict handling: Rejected, onConflictDoUpdate simpler

---

## 6. UI/UX Flow

### Decision: Two-stage modal pattern (matches recipe-form.tsx)

**Stage 1: Input**
- Voice button (primary) + text input toggle
- VoiceInput component with 60s timer
- Text area for typing alternative
- Submit button → process with LLM

**Stage 2: Confirmation**
- List of proposed changes with before/after badges
- "(2 → 3)" format for quantity changes
- Unrecognized ingredients warning (if any)
- Save / Cancel buttons

**Visual Design** (Neo-brutalism):
- Modal: `border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- Buttons: Pink (Save), Yellow (Cancel), following Button.tsx patterns
- Warning: Yellow background per Alert.tsx "warning" variant

**Alternatives Considered**:
- Inline editing without modal: Rejected, harder to batch operations
- Single-stage with auto-save: Rejected, LLM errors need review

---

## 7. Pantry Staples Section

### Decision: Visual distinction + toggle action

**Display Differences**:
- Available section: IngredientBadge with quantity dots
- Pantry section: IngredientBadge WITHOUT quantity dots OR always shows 3 (full)

**Toggle Mechanism**:
- Long-press or secondary action reveals move option
- Simple icon button: `⭐` (to staple) / `📦` (to available)
- Immediate database update on toggle

**Rationale**: isPantryStaple flag already exists in schema; minimal new code.

**Alternatives Considered**:
- Drag-and-drop between sections: Rejected, complex for MVP
- Dedicated "Manage Staples" screen: Rejected, adds navigation

---

## 8. Error Handling

### Decision: Follow existing patterns with user-friendly messages

**Error Scenarios**:
| Scenario | User Message | Recovery |
|----------|--------------|----------|
| Voice permission denied | "Microphone access denied. Enable in browser settings or use text input." | Switch to text |
| Voice recording fails | "Recording failed. Try again or switch to text input." | Retry/switch |
| LLM processing fails | "Failed to process. Try again or be more specific." | Retry |
| Network error during save | "Save failed. Check connection and try again." | Retry |
| Partial save failure | "Some updates saved. X items failed." | Show which failed |

**Implementation**: Use `sonner` toast for non-blocking errors, Alert component for blocking errors.

---

## 9. Component Extraction Recommendations

Based on recipe page analysis, extract to shared components:

1. **InputModeToggle** - Voice/text toggle buttons (simple, reusable)
2. **ProcessingOverlay** - Loading state with skeleton animation
3. **ConfirmationDialog** - Review changes before save pattern

For MVP: Copy patterns rather than extract. Mark for post-MVP refactoring.

---

## 10. Unrecognized Items Handling

### Decision: Add to dedicated "unrecognized_items" context + toast warning

**Flow**:
1. LLM extracts: `["tomatoes", "mystery spice"]`
2. Validation: `{ recognized: ["tomatoes"], unrecognized: ["mystery spice"] }`
3. Show warning toast: "Couldn't find: mystery spice"
4. Save "mystery spice" to unrecognized items table (if exists) or log for feedback

**Per User Input**: "add failed detections to unrecognized items with appropriate context"

**Schema** (if table exists, otherwise log):
```typescript
// Check if unrecognized_items table exists, else use console.warn + future migration
```

**Alternatives Considered**:
- Block save until all recognized: Rejected, punishes partial success
- Auto-create new ingredients: Rejected, pollutes database

---

## Summary

All technical unknowns resolved:

1. **Component reuse**: VoiceInput + useVoiceInput as-is, patterns copied for modal/toggle
2. **LLM prompt**: Dedicated inventory-update prompt with quantity inference
3. **Validation**: Case-insensitive ILIKE against ingredients table
4. **Database**: Batch upsert with onConflictDoUpdate
5. **UI flow**: Two-stage modal (input → confirm), neo-brutalist styling
6. **Pantry staples**: Toggle action, no quantity display for staples
7. **Error handling**: Toast notifications, Alert for blocking errors
8. **Unrecognized items**: Warning toast + context logging
