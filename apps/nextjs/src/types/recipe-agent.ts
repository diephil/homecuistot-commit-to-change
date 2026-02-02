/**
 * Type Definitions: Recipe Manager Agent
 *
 * Types for ADK-based recipe management agent.
 * Follows Constitution Principle V (Drizzle inference) where applicable.
 */

import type { userRecipes, recipeIngredients, ingredients } from "@/db/schema";

// ============================================================================
// Base Types (Drizzle Schema Inference)
// ============================================================================

type UserRecipe = typeof userRecipes.$inferSelect;
type RecipeIngredient = typeof recipeIngredients.$inferSelect;
type Ingredient = typeof ingredients.$inferSelect;

// ============================================================================
// Session State Types
// ============================================================================

/**
 * Recipe ingredient for session state (minimal for token efficiency)
 */
export interface RecipeSessionIngredient {
  name: string;
  isRequired: boolean; // anchor = true, optional = false
}

/**
 * Recipe item stored in session state
 * LLM uses id, title, description to determine update targets
 */
export interface RecipeSessionItem {
  id: string; // user_recipes.id
  title: string;
  description: string;
  ingredients: RecipeSessionIngredient[];
}

// ============================================================================
// Tool Input Types
// ============================================================================

/**
 * Ingredient input for create/update tools
 */
export interface IngredientInput {
  name: string; // lowercase, singular
  isRequired: boolean; // true = anchor, false = optional
}

/**
 * Updates to apply to existing recipe
 */
export interface RecipeUpdates {
  title?: string;
  description?: string;
  addIngredients?: IngredientInput[];
  removeIngredients?: string[]; // ingredient names to remove
  toggleRequired?: string[]; // ingredient names to toggle isRequired
}

// ============================================================================
// Tool Result Types
// ============================================================================

/**
 * Matched ingredient from database
 */
export interface MatchedRecipeIngredient {
  ingredientId: string;
  name: string;
  isRequired: boolean;
}

/**
 * Proposed ingredient (may or may not be matched)
 */
export interface ProposedRecipeIngredient {
  ingredientId?: string; // undefined if unrecognized
  name: string;
  isRequired: boolean;
}

/**
 * Result from create_recipe tool
 */
export interface CreateRecipeResult {
  operation: "create";
  title: string;
  description: string;
  ingredients: ProposedRecipeIngredient[];
  matched: MatchedRecipeIngredient[];
  unrecognized: string[];
}

/**
 * Result from update_recipe tool
 */
export interface UpdateRecipeResult {
  operation: "update";
  recipeId: string;
  previousState: RecipeSessionItem;
  proposedState: {
    title: string;
    description: string;
    ingredients: ProposedRecipeIngredient[];
  };
  matched: MatchedRecipeIngredient[];
  unrecognized: string[];
}

/**
 * Result from delete_recipe tool
 */
export interface DeleteRecipeResult {
  operation: "delete";
  recipeId: string;
  title: string;
  reason?: string;
}

/**
 * Result from delete_all_recipes tool
 */
export interface DeleteAllRecipesResult {
  operation: "delete_all";
  deletedCount: number;
  deletedRecipes: Array<{
    recipeId: string;
    title: string;
  }>;
  reason?: string;
}

/**
 * Union of tool results
 */
export type RecipeToolResult = CreateRecipeResult | UpdateRecipeResult | DeleteRecipeResult | DeleteAllRecipesResult;

// ============================================================================
// Proposal Types
// ============================================================================

/**
 * Full proposal from recipe manager agent
 */
export interface RecipeManagerProposal {
  recipes: RecipeToolResult[];
  noChangesDetected: boolean;
}

// ============================================================================
// API Types
// ============================================================================

/**
 * Request to agent-proposal API
 */
export interface RecipeAgentProposalRequest {
  input?: string;
  audioBase64?: string;
}

/**
 * Response from agent-proposal API
 */
export interface RecipeAgentProposalResponse {
  proposal: RecipeManagerProposal;
  transcribedText?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Request to apply-proposal API
 */
export interface RecipeApplyProposalRequest {
  recipes: RecipeToolResult[];
}

/**
 * Response from apply-proposal API
 */
export interface RecipeApplyProposalResponse {
  success: boolean;
  created: number;
  updated: number;
  deleted: number;
  errors?: string[];
}

// ============================================================================
// Constants
// ============================================================================

export const RECIPE_LIMITS = {
  MAX_RECIPES_PER_REQUEST: 5,
  MAX_INGREDIENTS_PER_RECIPE: 6,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: Check if tool result is create operation
 */
export function isCreateRecipeResult(
  result: RecipeToolResult
): result is CreateRecipeResult {
  return result.operation === "create";
}

/**
 * Type guard: Check if tool result is update operation
 */
export function isUpdateRecipeResult(
  result: RecipeToolResult
): result is UpdateRecipeResult {
  return result.operation === "update";
}

/**
 * Type guard: Check if tool result is delete operation
 */
export function isDeleteRecipeResult(
  result: RecipeToolResult
): result is DeleteRecipeResult {
  return result.operation === "delete";
}

/**
 * Type guard: Check if tool result is delete all operation
 */
export function isDeleteAllRecipesResult(
  result: RecipeToolResult
): result is DeleteAllRecipesResult {
  return result.operation === "delete_all";
}
