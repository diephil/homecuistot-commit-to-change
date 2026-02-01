# Recipe Manager Agent

ADK-based agent for creating, updating, and deleting recipes via voice or text input.

## Architecture

```
recipe/
├── index.ts                              # Public exports
├── agent.ts                              # LlmAgent config + instruction prompt
├── seq-agents-recipe-manager-proposal.ts # Orchestrator with Opik tracing
└── tools/
    ├── create-recipe.ts                  # FunctionTool for new recipes
    ├── update-recipe.ts                  # FunctionTool for recipe updates
    └── delete-recipe.ts                  # FunctionTool for recipe deletion
```

## Flow

1. **Input**: Voice (audio/webm base64) or text
2. **Transcription**: If voice, transcribe via Gemini with Opik tracking
3. **Agent Session**: Create ADK session with `{ trackedRecipes }` state (YAML injected)
4. **Agent Execution**: LlmAgent parses intent, calls appropriate tool(s)
5. **Tool Execution**: Validate ingredients against DB, return structured result
6. **Result Merge**: Collect all tool responses into `RecipeManagerProposal`
7. **Tracing**: Full Opik trace with spans for transcription, model calls, tool calls

## Session State

```typescript
interface RecipeSessionItem {
  id: string;              // user_recipes.id (UUID)
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    isRequired: boolean;   // anchor = true, optional = false
  }>;
}
```

Tracked recipes are injected into the conversation as YAML for the LLM to reference.

## Tools

### create_recipe

Creates a new recipe. If user doesn't specify ingredients, generates sensible defaults.

**Input**: `{ title, description, ingredients: [{ name, isRequired }] }`

**Output**: `CreateRecipeResult` with matched/unrecognized ingredients

### update_recipe

Updates an existing recipe from session state.

**Input**: `{ recipeId (UUID), updates: { title?, description?, addIngredients?, removeIngredients?, toggleRequired? } }`

**Output**: `UpdateRecipeResult` with previous/proposed states

### delete_recipe

Deletes an existing recipe from session state.

**Input**: `{ recipeId (UUID), reason? }`

**Output**: `DeleteRecipeResult` with recipe title

## Opik Tracing

- Trace name: `recipe-manager-agent`
- Tags: `recipe`, `agent`, `voice|text`, `gemini-2.0-flash`, `user:{id}`
- Additional tag `unrecognized_item` added if any ingredient names don't match DB
- Tool spans keyed by ADK `functionCall.id` to support parallel tool calls

## Limits

- Max 5 recipes per request
- Max 6 ingredients per recipe
