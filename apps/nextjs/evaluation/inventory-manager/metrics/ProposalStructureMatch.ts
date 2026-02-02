import { z } from "zod";
import { BaseMetric, EvaluationScoreResult } from "opik";

const validationSchema = z.object({
  output: z.any(),
  expected: z.any(),
});

type Input = z.infer<typeof validationSchema>;

/**
 * Validates InventoryUpdateProposal structure correctness
 *
 * Checks:
 * - Output is an object
 * - Has `recognized` field (array)
 * - Has `unrecognized` field (array of strings)
 * - Each recognized item has required fields: ingredientId, ingredientName, proposedQuantity (0-3)
 * - Optional fields: proposedPantryStaple (boolean), previousQuantity, previousPantryStaple, confidence
 */
export class ProposalStructureMatch extends BaseMetric<typeof validationSchema> {
  public validationSchema = validationSchema;

  constructor(name = "proposal_structure_match", trackMetric = true) {
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

      // Check has recognized field (array)
      if (!("recognized" in output)) {
        issues.push("Output missing 'recognized' field");
      } else if (!Array.isArray(output.recognized)) {
        issues.push(
          `Output 'recognized' is not an array, got: ${typeof output.recognized}`,
        );
      } else {
        // Validate each recognized item
        output.recognized.forEach((item: unknown, index: number) => {
          if (typeof item !== "object" || item === null) {
            issues.push(
              `recognized[${index}] is not an object, got: ${typeof item}`,
            );
            return;
          }

          const recognizedItem = item as Record<string, unknown>;

          // Required fields
          if (!("ingredientId" in recognizedItem)) {
            issues.push(`recognized[${index}] missing 'ingredientId'`);
          } else if (typeof recognizedItem.ingredientId !== "string") {
            issues.push(
              `recognized[${index}].ingredientId is not a string, got: ${typeof recognizedItem.ingredientId}`,
            );
          }

          if (!("ingredientName" in recognizedItem)) {
            issues.push(`recognized[${index}] missing 'ingredientName'`);
          } else if (typeof recognizedItem.ingredientName !== "string") {
            issues.push(
              `recognized[${index}].ingredientName is not a string, got: ${typeof recognizedItem.ingredientName}`,
            );
          }

          if (!("proposedQuantity" in recognizedItem)) {
            issues.push(`recognized[${index}] missing 'proposedQuantity'`);
          } else if (typeof recognizedItem.proposedQuantity !== "number") {
            issues.push(
              `recognized[${index}].proposedQuantity is not a number, got: ${typeof recognizedItem.proposedQuantity}`,
            );
          } else if (
            ![0, 1, 2, 3].includes(recognizedItem.proposedQuantity as number)
          ) {
            issues.push(
              `recognized[${index}].proposedQuantity must be 0-3, got: ${recognizedItem.proposedQuantity}`,
            );
          }

          // Optional fields validation
          if (
            "proposedPantryStaple" in recognizedItem &&
            recognizedItem.proposedPantryStaple !== undefined &&
            typeof recognizedItem.proposedPantryStaple !== "boolean"
          ) {
            issues.push(
              `recognized[${index}].proposedPantryStaple must be boolean or undefined, got: ${typeof recognizedItem.proposedPantryStaple}`,
            );
          }

          if (
            "previousQuantity" in recognizedItem &&
            recognizedItem.previousQuantity !== null &&
            typeof recognizedItem.previousQuantity !== "number"
          ) {
            issues.push(
              `recognized[${index}].previousQuantity must be number or null, got: ${typeof recognizedItem.previousQuantity}`,
            );
          }

          if (
            "confidence" in recognizedItem &&
            recognizedItem.confidence !== undefined &&
            !["high", "medium", "low"].includes(
              recognizedItem.confidence as string,
            )
          ) {
            issues.push(
              `recognized[${index}].confidence must be 'high'|'medium'|'low', got: ${recognizedItem.confidence}`,
            );
          }
        });
      }

      // Check has unrecognized field (array of strings)
      if (!("unrecognized" in output)) {
        issues.push("Output missing 'unrecognized' field");
      } else if (!Array.isArray(output.unrecognized)) {
        issues.push(
          `Output 'unrecognized' is not an array, got: ${typeof output.unrecognized}`,
        );
      } else {
        // Validate each unrecognized item is a string
        output.unrecognized.forEach((item: unknown, index: number) => {
          if (typeof item !== "string") {
            issues.push(
              `unrecognized[${index}] is not a string, got: ${typeof item}`,
            );
          }
        });
      }

      // Return result
      if (issues.length > 0) {
        return this.failResult(issues);
      }

      return [
        {
          name: "structure_match",
          value: 1.0,
          reason: "✓ Structure valid: recognized array + unrecognized array",
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
