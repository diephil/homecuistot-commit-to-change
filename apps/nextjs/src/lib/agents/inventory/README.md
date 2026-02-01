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
┌─────────────────────────────────┐
│    LlmAgent (Gemini 2.0)        │  ← Extracts ingredients + quantities
│    └── validate_ingredients     │  ← Matches against DB
└─────────────────────────────────┘
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
LlmAgent config with instruction prompt. Parses NL for:
- Ingredient names (singular, lowercase)
- Quantity levels: 0=out, 1=low, 2=some, 3=full
- Pantry staple intent: true/false/omit

### `tools/validate-ingredients.ts`
FunctionTool that:
1. Takes `{ up: [{ name, qty, staple? }] }`
2. Matches names against ingredients DB via `matchIngredients()`
3. Looks up previous state from session
4. Returns `InventoryUpdateProposal` with recognized/unrecognized splits

Sets `endInvocation=true` to return tool result as agent's final answer.

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/inventory/agent-proposal` | POST | Process voice/text → proposal |
| `/api/inventory/apply-proposal` | POST | Persist confirmed updates |

## Example Flow

```
"I bought chicken and tomatoes, running low on olive oil"
        ↓
Agent extracts:
  [{ name: "chicken", qty: 3 },
   { name: "tomato", qty: 3 },
   { name: "olive oil", qty: 1 }]
        ↓
validate_ingredients matches against DB
        ↓
Returns proposal with ingredient IDs + previous state
        ↓
User confirms → apply-proposal upserts to user_inventory
```

## Session State

Agent session includes `currentInventory` for previous state lookup:
```ts
{ id, ingredientId, quantityLevel, isPantryStaple, name }[]
```

This enables showing "2 → 3" change indicators in the confirmation modal.
