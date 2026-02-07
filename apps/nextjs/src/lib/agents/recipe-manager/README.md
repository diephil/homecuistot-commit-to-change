# Recipe Manager Agent

ADK-based agent for creating, updating, and deleting recipes via voice or text input.

## Architecture

```
recipe-manager/
├── agent.ts                              # LlmAgent config
├── prompt.ts                             # Instruction prompt (Opik registered)
└── tools/
    ├── create-recipes.ts                 # FunctionTool for batch recipe creation
    ├── update-recipes.ts                 # FunctionTool for batch recipe updates
    ├── delete-recipes.ts                 # FunctionTool for batch recipe deletion
    └── delete-all-recipes.ts             # FunctionTool to clear all recipes
```

## Flow

1. **Input**: Voice (audio/webm base64) or text
2. **Transcription**: If voice, transcribe via Gemini with Opik tracking
3. **Agent Session**: Create ADK session with `{ trackedRecipes, trackedIngredients? }` state
4. **Agent Execution**: LlmAgent parses intent, calls appropriate tool(s) - supports parallel tool calls
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

### create_recipes

Creates one or more new recipes (batch operation). If user doesn't specify ingredients, generates sensible defaults.

**Input**: `{ recipes: [{ title, description, ingredients: [{ name, isRequired }] }] }`

- Accepts 1-5 recipes per call
- Each recipe: 1-10 ingredients

**Output**: `CreateRecipesResult` with matched/unrecognized ingredients per recipe

### update_recipes

Updates one or more existing recipes from session state (batch operation).

**Input**: `{ updates: [{ recipeId (UUID), updates: { title?, description?, addIngredients?, removeIngredients?, toggleRequired? } }] }`

- Accepts 1-5 updates per call

**Output**: `UpdateRecipesResult` with previous/proposed states per recipe

### delete_recipes

Deletes one or more existing recipes from session state (batch operation).

**Input**: `{ recipeIds: [UUID], reason? }`

- Accepts 1-10 recipe IDs per call

**Output**: `DeleteRecipesResult` with deleted recipe titles

### delete_all_recipes

Deletes all recipes from the user's tracked recipes.

**Input**: `{ reason? }`

**Output**: `DeleteAllRecipesResult` with count and list of deleted recipes

## Opik Tracing

- Trace name: `recipe-manager-agent`
- Tags: `recipe`, `agent`, `voice|text`, `gemini-2.0-flash|gemini-2.5-flash-lite`, `user:{id}`
- Additional tag `unrecognized_items` added if any ingredient names don't match DB
- Tool spans keyed by ADK `functionCall.id` to support parallel tool calls
- Prompt registered in Opik with version tracking

## Limits

- Max 5 recipes per tool call (create/update)
- Max 10 ingredients per recipe
- Max 10 recipe IDs per delete call

## Model Support

- `gemini-2.0-flash` (default)
- `gemini-2.5-flash-lite` (faster, lower cost)
