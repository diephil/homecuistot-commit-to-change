# AI Inventory Manager Agent

Voice/text-powered inventory management using Google ADK (Agent Development Kit).

## Architecture

```
User Input (voice/text)
        ↓
┌─────────────────────────────────┐
│  /api/inventory/agent-proposal  │  ← Transcribes audio, runs agent
└─────────────────────────────────┘
        ↓
┌──────────────────────────────────────────┐
│    LlmAgent (Gemini 2.0 / 2.5)           │  ← Extracts ingredients + quantities
│    ├── update_matching_ingredients       │  ← Matches items against DB
│    └── update_all_tracked_ingredients    │  ← Bulk operations (refill/delete all)
└──────────────────────────────────────────┘
        ↓
    InventoryUpdateProposal
        ↓
┌─────────────────────────────────┐
│  ProposalConfirmationModal      │  ← User reviews/edits
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  /api/inventory/apply-proposal  │  ← Persists to DB
└─────────────────────────────────┘
```

## Components

### `agent.ts`
LlmAgent config with tools. Parses NL for:
- Ingredient names (singular, lowercase)
- Quantity levels: 0=out, 1=low, 2=some, 3=full
- Pantry staple intent: true/false/omit

### `prompt.ts`
Opik-registered prompt with version tracking. Instruction prompt for tool-only agent with NO conversation mode.

### `tools/update-matching-ingredients.ts`
FunctionTool that:
1. Takes `{ up: [{ name, qty, staple? }] }`
2. Matches names against ingredients DB via `matchIngredients()`
3. Looks up previous state from session
4. Returns `InventoryUpdateProposal` with recognized/unrecognized splits

Sets `endInvocation=true` to return tool result as agent's final answer.

### `tools/update-all-tracked-ingredients.ts`
FunctionTool for bulk operations:
1. Takes `{ qty, isPantryStaple? }`
2. Updates all inventory items to specified quantity level
3. Optional filter by pantry staple status
4. Returns `InventoryUpdateProposal` with all affected items

Replaces separate `refill-all` and `delete-all` tools (now commented out).

### Commented Out Tools
- `tools/refill-all-ingredients.ts` - Replaced by `update-all-tracked-ingredients({ qty: 3 })`
- `tools/delete-all-ingredients.ts` - Replaced by `update-all-tracked-ingredients({ qty: 0 })`

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/inventory/agent-proposal` | POST | Process voice/text → proposal |
| `/api/inventory/apply-proposal` | POST | Persist confirmed updates |

## Example Flows

### Individual Item Updates
```
"I bought chicken and tomatoes, running low on olive oil"
        ↓
Agent extracts:
  [{ name: "chicken", qty: 3 },
   { name: "tomato", qty: 3 },
   { name: "olive oil", qty: 1 }]
        ↓
update_matching_ingredients matches against DB
        ↓
Returns proposal with ingredient IDs + previous state
        ↓
User confirms → apply-proposal upserts to user_inventory
```

### Bulk Operations
```
"Refill all my pantry staples"
        ↓
Agent calls:
  update_all_tracked_ingredients({ qty: 3, isPantryStaple: true })
        ↓
Returns proposal with all pantry staples set to qty=3
        ↓
User confirms → apply-proposal updates all matching items
```

```
"Clear all non-staple items"
        ↓
Agent calls:
  update_all_tracked_ingredients({ qty: 0, isPantryStaple: false })
        ↓
Returns proposal with all non-staples marked for deletion
        ↓
User confirms → apply-proposal removes all non-staple items
```

## Session State

Agent session includes `currentInventory` for previous state lookup:
```ts
{ id, ingredientId, quantityLevel, isPantryStaple, name }[]
```

This enables showing "2 → 3" change indicators in the confirmation modal.
