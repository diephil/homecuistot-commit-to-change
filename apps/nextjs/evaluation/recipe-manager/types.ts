/**
 * Type Definitions: Recipe Manager Evaluation Dataset
 */

import type {
  RecipeSessionItem,
  RecipeManagerProposal,
} from "@/types/recipe-agent";

/**
 * Dataset item for recipe manager evaluation
 */
export type RecipeDatasetItem = {
  input: string;
  expected_output: RecipeManagerProposal;
  metadata: {
    trackedRecipes: RecipeSessionItem[];
    input_locale: string;
    category: string;
    comment: string;
    version: number;
  };
};
