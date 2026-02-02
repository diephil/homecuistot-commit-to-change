import { z } from "zod";
import { BaseMetric, EvaluationScoreResult } from "opik";

const validationSchema = z.object({
  output: z.any(),
  expected: z.any(),
});

type Input = z.infer<typeof validationSchema>;

/**
 * Validates RecipeManagerProposal structure correctness
 *
 * Checks:
 * - Output is an object
 * - Has `recipes` field (array of RecipeToolResult)
 * - Has `noChangesDetected` field (boolean)
 * - Each recipe has valid operation type: create_batch, update_batch, delete_batch, delete_all
 */
export class RecipeStructureMatch extends BaseMetric<typeof validationSchema> {
  public validationSchema = validationSchema;

  constructor(name = "recipe_structure_match", trackMetric = true) {
    super(name, trackMetric);
  }

  async score(params: Input): Promise<EvaluationScoreResult[]> {
    const issues: string[] = [];

    try {
      const { output } = params;

      // Check output is an object
      if (typeof output !== "object" || output === null) {
        issues.push(`Output is not an object, got: ${typeof output}`);
        return this.failResult(issues);
      }

      // Check has recipes field (array)
      if (!("recipes" in output)) {
        issues.push("Output missing 'recipes' field");
      } else if (!Array.isArray(output.recipes)) {
        issues.push(
          `Output 'recipes' is not an array, got: ${typeof output.recipes}`,
        );
      } else {
        // Validate each recipe tool result
        output.recipes.forEach((recipe: unknown, index: number) => {
          if (typeof recipe !== "object" || recipe === null) {
            issues.push(
              `recipes[${index}] is not an object, got: ${typeof recipe}`,
            );
            return;
          }

          const recipeResult = recipe as Record<string, unknown>;

          // Check operation type
          if (!("operation" in recipeResult)) {
            issues.push(`recipes[${index}] missing 'operation' field`);
          } else {
            const validOps = [
              "create",
              "create_batch",
              "update",
              "update_batch",
              "delete",
              "delete_batch",
              "delete_all",
            ];
            if (!validOps.includes(recipeResult.operation as string)) {
              issues.push(
                `recipes[${index}].operation invalid: ${recipeResult.operation}, expected one of: ${validOps.join(", ")}`,
              );
            }
          }

          // Validate based on operation type
          const op = recipeResult.operation as string;

          if (op === "create_batch") {
            this.validateCreateBatch(recipeResult, index, issues);
          } else if (op === "update_batch") {
            this.validateUpdateBatch(recipeResult, index, issues);
          } else if (op === "delete_batch") {
            this.validateDeleteBatch(recipeResult, index, issues);
          } else if (op === "delete_all") {
            this.validateDeleteAll(recipeResult, index, issues);
          }
        });
      }

      // Check has noChangesDetected field (boolean)
      if (!("noChangesDetected" in output)) {
        issues.push("Output missing 'noChangesDetected' field");
      } else if (typeof output.noChangesDetected !== "boolean") {
        issues.push(
          `Output 'noChangesDetected' is not a boolean, got: ${typeof output.noChangesDetected}`,
        );
      }

      // Return result
      if (issues.length > 0) {
        return this.failResult(issues);
      }

      return [
        {
          name: "structure_match",
          value: 1.0,
          reason: "✓ Structure valid: recipes array + noChangesDetected boolean",
        },
      ];
    } catch (error) {
      return [
        {
          name: "structure_match",
          value: 0.0,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ];
    }
  }

  private validateCreateBatch(
    result: Record<string, unknown>,
    index: number,
    issues: string[],
  ): void {
    if (!("results" in result) || !Array.isArray(result.results)) {
      issues.push(`recipes[${index}] (create_batch) missing 'results' array`);
    }
    if (typeof result.totalCreated !== "number") {
      issues.push(
        `recipes[${index}] (create_batch) missing or invalid 'totalCreated'`,
      );
    }
    if (typeof result.totalUnrecognized !== "number") {
      issues.push(
        `recipes[${index}] (create_batch) missing or invalid 'totalUnrecognized'`,
      );
    }
  }

  private validateUpdateBatch(
    result: Record<string, unknown>,
    index: number,
    issues: string[],
  ): void {
    if (!("results" in result) || !Array.isArray(result.results)) {
      issues.push(`recipes[${index}] (update_batch) missing 'results' array`);
    }
    if (typeof result.totalUpdated !== "number") {
      issues.push(
        `recipes[${index}] (update_batch) missing or invalid 'totalUpdated'`,
      );
    }
    if (typeof result.totalNotFound !== "number") {
      issues.push(
        `recipes[${index}] (update_batch) missing or invalid 'totalNotFound'`,
      );
    }
    if (typeof result.totalUnrecognized !== "number") {
      issues.push(
        `recipes[${index}] (update_batch) missing or invalid 'totalUnrecognized'`,
      );
    }
  }

  private validateDeleteBatch(
    result: Record<string, unknown>,
    index: number,
    issues: string[],
  ): void {
    if (!("results" in result) || !Array.isArray(result.results)) {
      issues.push(`recipes[${index}] (delete_batch) missing 'results' array`);
    }
    if (typeof result.totalDeleted !== "number") {
      issues.push(
        `recipes[${index}] (delete_batch) missing or invalid 'totalDeleted'`,
      );
    }
    if (typeof result.totalNotFound !== "number") {
      issues.push(
        `recipes[${index}] (delete_batch) missing or invalid 'totalNotFound'`,
      );
    }
  }

  private validateDeleteAll(
    result: Record<string, unknown>,
    index: number,
    issues: string[],
  ): void {
    if (typeof result.deletedCount !== "number") {
      issues.push(
        `recipes[${index}] (delete_all) missing or invalid 'deletedCount'`,
      );
    }
    if (!("deletedRecipes" in result) || !Array.isArray(result.deletedRecipes)) {
      issues.push(
        `recipes[${index}] (delete_all) missing 'deletedRecipes' array`,
      );
    }
  }

  private failResult(issues: string[]): EvaluationScoreResult[] {
    return [
      {
        name: "structure_match",
        value: 0.0,
        reason: `✗ Structure invalid:\n${issues.map((i) => `  - ${i}`).join("\n")}`,
      },
    ];
  }
}
