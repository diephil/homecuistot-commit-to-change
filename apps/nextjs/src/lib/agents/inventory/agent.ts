/**
 * ADK Inventory Manager Agent Configuration
 *
 * LlmAgent that processes natural language input to extract
 * inventory updates and validates against the database.
 */

import { LlmAgent } from '@google/adk';
import { createValidateIngredientsTool } from './tools/validate-ingredients';

const AGENT_INSTRUCTION = `You are an inventory assistant. Extract ingredients and quantity levels from user text.

## Workflow
1. Parse text for ingredients
2. Determine qty (0-3) from context
3. Call validate_ingredients with { up: [{ name, qty }] }

## Quantity Rules
- 3: "bought", "restocked", "full", "new" (default if no context)
- 2: "some", "enough"
- 1: "running low", "almost out"
- 0: "ran out", "finished", "none"

## Name Format
- Lowercase, singular: "tomato" not "Tomatoes"
- No quantities: "3 tomatoes" → "tomato"
- Keep compounds: "olive oil"

## Example
"I just bought chicken and tomatoes, almost out of olive oil"
→ validate_ingredients({ up: [{ name: "chicken", qty: 3 }, { name: "tomato", qty: 3 }, { name: "olive oil", qty: 1 }] })`;

export interface CreateInventoryAgentParams {
  userId?: string;
  model?: string;
}

export function createInventoryAgent(params?: CreateInventoryAgentParams) {
  const { userId, model = 'gemini-2.0-flash' } = params ?? {};

  return new LlmAgent({
    name: 'inventory_manager',
    description: 'Processes natural language to update kitchen inventory',
    model,
    instruction: AGENT_INSTRUCTION,
    tools: [createValidateIngredientsTool({ userId })],
  });
}
