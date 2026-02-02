import { z } from "zod";
import { BaseMetric, EvaluationScoreResult } from "opik";
import type {
  ValidatedInventoryUpdate,
  InventoryUpdateProposal,
} from "@/types/inventory";

const validationSchema = z.object({
  output: z.any(),
  expected: z.any(),
});

type Input = z.infer<typeof validationSchema>;

/**
 * Calculates precision, recall, and F1 score for inventory updates
 *
 * Metrics (10 scores):
 * 1-3: ingredient_precision, ingredient_recall, ingredient_f1 (name matching)
 * 4-6: quantity_precision, quantity_recall, quantity_f1 (exact quantity match)
 * 7-9: staple_precision, staple_recall, staple_f1 (pantry staple flag match)
 * 10: overall_f1 (average of 3 F1 scores)
 * 11: unrecognized_count_match (1.0 if counts match, 0.0 otherwise)
 */
export class InventoryUpdateMatch extends BaseMetric<typeof validationSchema> {
  public validationSchema = validationSchema;

  constructor(name = "inventory_update_match", trackMetric = true) {
    super(name, trackMetric);
  }

  private calculateMetrics(params: {
    output: string[];
    expected: string[];
  }): { precision: number; recall: number; f1: number } {
    const { output, expected } = params;

    // Convert to sets for comparison
    const outputSet = new Set(output);
    const expectedSet = new Set(expected);

    // Calculate intersection (correct predictions)
    const correct = [...outputSet].filter((item) => expectedSet.has(item))
      .length;

    // Edge case: both empty → perfect match
    if (output.length === 0 && expected.length === 0) {
      return { precision: 1.0, recall: 1.0, f1: 1.0 };
    }

    // Edge case: no output but expected exists → precision 1.0, recall 0.0
    if (output.length === 0 && expected.length > 0) {
      return { precision: 1.0, recall: 0.0, f1: 0.0 };
    }

    // Edge case: output exists but no expected → precision 0.0, recall 1.0
    if (output.length > 0 && expected.length === 0) {
      return { precision: 0.0, recall: 1.0, f1: 0.0 };
    }

    // Normal case: both have values
    const precision = correct / output.length;
    const recall = correct / expected.length;

    // F1 = harmonic mean of precision and recall
    const f1 =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0.0;

    return { precision, recall, f1 };
  }

  async score(params: Input): Promise<EvaluationScoreResult[]> {
    try {
      // Validate inputs are objects
      if (typeof params.output !== "object" || params.output === null) {
        throw new Error(`Output is not an object, got: ${typeof params.output}`);
      }
      if (typeof params.expected !== "object" || params.expected === null) {
        throw new Error(
          `Expected is not an object, got: ${typeof params.expected}`,
        );
      }

      const outputData = params.output as InventoryUpdateProposal;
      const expectedData = params.expected as InventoryUpdateProposal;

      // 1. Extract ingredient names (lowercase for comparison)
      const outputNames = outputData.recognized.map((r) =>
        r.ingredientName.toLowerCase(),
      );
      const expectedNames = expectedData.recognized.map((r) =>
        r.ingredientName.toLowerCase(),
      );

      // 2. Calculate ingredient matching metrics
      const ingredientMetrics = this.calculateMetrics({
        output: outputNames,
        expected: expectedNames,
      });

      // 3. For matched ingredients, validate quantities
      const matchedIngredients = outputNames.filter((name) =>
        expectedNames.includes(name),
      );

      let quantityCorrect = 0;
      for (const name of matchedIngredients) {
        const outputItem = outputData.recognized.find(
          (r) => r.ingredientName.toLowerCase() === name,
        );
        const expectedItem = expectedData.recognized.find(
          (r) => r.ingredientName.toLowerCase() === name,
        );

        if (
          outputItem &&
          expectedItem &&
          outputItem.proposedQuantity === expectedItem.proposedQuantity
        ) {
          quantityCorrect++;
        }
      }

      // Calculate quantity metrics
      const quantityMetrics = this.calculateQuantityMetrics({
        matchedCount: matchedIngredients.length,
        correctCount: quantityCorrect,
        expectedCount: expectedNames.length,
      });

      // 4. For matched ingredients, validate pantry staple flags
      let stapleCorrect = 0;
      for (const name of matchedIngredients) {
        const outputItem = outputData.recognized.find(
          (r) => r.ingredientName.toLowerCase() === name,
        );
        const expectedItem = expectedData.recognized.find(
          (r) => r.ingredientName.toLowerCase() === name,
        );

        if (outputItem && expectedItem) {
          // Both undefined → correct (no staple intent)
          if (
            outputItem.proposedPantryStaple === undefined &&
            expectedItem.proposedPantryStaple === undefined
          ) {
            stapleCorrect++;
            continue;
          }

          // Exact match (both defined and equal)
          if (
            outputItem.proposedPantryStaple ===
            expectedItem.proposedPantryStaple
          ) {
            stapleCorrect++;
          }
        }
      }

      // Calculate staple metrics
      const stapleMetrics = this.calculateQuantityMetrics({
        matchedCount: matchedIngredients.length,
        correctCount: stapleCorrect,
        expectedCount: expectedNames.length,
      });

      // 5. Calculate overall F1
      const overallF1 =
        (ingredientMetrics.f1 + quantityMetrics.f1 + stapleMetrics.f1) / 3;

      // 6. Validate unrecognized count
      const unrecognizedMatch =
        outputData.unrecognized.length === expectedData.unrecognized.length
          ? 1.0
          : 0.0;

      // Return array of 11 score results
      return [
        {
          name: "ingredient_precision",
          value: ingredientMetrics.precision,
          reason: `Ingredient precision: ${(ingredientMetrics.precision * 100).toFixed(1)}% (${[...new Set(outputNames)].filter((n) => new Set(expectedNames).has(n)).length} correct / ${outputNames.length} total)`,
        },
        {
          name: "ingredient_recall",
          value: ingredientMetrics.recall,
          reason: `Ingredient recall: ${(ingredientMetrics.recall * 100).toFixed(1)}% (${[...new Set(outputNames)].filter((n) => new Set(expectedNames).has(n)).length} correct / ${expectedNames.length} expected)`,
        },
        {
          name: "ingredient_f1",
          value: ingredientMetrics.f1,
          reason: `Ingredient F1: ${(ingredientMetrics.f1 * 100).toFixed(1)}% (harmonic mean)`,
        },
        {
          name: "quantity_precision",
          value: quantityMetrics.precision,
          reason: `Quantity precision: ${(quantityMetrics.precision * 100).toFixed(1)}% (${quantityCorrect} correct / ${matchedIngredients.length} matched)`,
        },
        {
          name: "quantity_recall",
          value: quantityMetrics.recall,
          reason: `Quantity recall: ${(quantityMetrics.recall * 100).toFixed(1)}% (${quantityCorrect} correct / ${expectedNames.length} expected)`,
        },
        {
          name: "quantity_f1",
          value: quantityMetrics.f1,
          reason: `Quantity F1: ${(quantityMetrics.f1 * 100).toFixed(1)}% (harmonic mean)`,
        },
        {
          name: "staple_precision",
          value: stapleMetrics.precision,
          reason: `Staple precision: ${(stapleMetrics.precision * 100).toFixed(1)}% (${stapleCorrect} correct / ${matchedIngredients.length} matched)`,
        },
        {
          name: "staple_recall",
          value: stapleMetrics.recall,
          reason: `Staple recall: ${(stapleMetrics.recall * 100).toFixed(1)}% (${stapleCorrect} correct / ${expectedNames.length} expected)`,
        },
        {
          name: "staple_f1",
          value: stapleMetrics.f1,
          reason: `Staple F1: ${(stapleMetrics.f1 * 100).toFixed(1)}% (harmonic mean)`,
        },
        {
          name: "overall_f1",
          value: overallF1,
          reason: `Overall F1: ${(overallF1 * 100).toFixed(1)}% (avg of ingredient, quantity, staple F1)`,
        },
        {
          name: "unrecognized_count_match",
          value: unrecognizedMatch,
          reason:
            unrecognizedMatch === 1.0
              ? `✓ Unrecognized count match: ${outputData.unrecognized.length}`
              : `✗ Unrecognized count mismatch: ${outputData.unrecognized.length} vs ${expectedData.unrecognized.length}`,
        },
      ];
    } catch (error) {
      // Return error scores
      const errorReason = `Error: ${error instanceof Error ? error.message : String(error)}`;
      return [
        { name: "ingredient_precision", value: 0.0, reason: errorReason },
        { name: "ingredient_recall", value: 0.0, reason: errorReason },
        { name: "ingredient_f1", value: 0.0, reason: errorReason },
        { name: "quantity_precision", value: 0.0, reason: errorReason },
        { name: "quantity_recall", value: 0.0, reason: errorReason },
        { name: "quantity_f1", value: 0.0, reason: errorReason },
        { name: "staple_precision", value: 0.0, reason: errorReason },
        { name: "staple_recall", value: 0.0, reason: errorReason },
        { name: "staple_f1", value: 0.0, reason: errorReason },
        { name: "overall_f1", value: 0.0, reason: errorReason },
        { name: "unrecognized_count_match", value: 0.0, reason: errorReason },
      ];
    }
  }

  /**
   * Calculate metrics for quantity/staple validation (matched ingredients only)
   */
  private calculateQuantityMetrics(params: {
    matchedCount: number;
    correctCount: number;
    expectedCount: number;
  }): { precision: number; recall: number; f1: number } {
    const { matchedCount, correctCount, expectedCount } = params;

    // Edge case: no matched ingredients
    if (matchedCount === 0 && expectedCount === 0) {
      return { precision: 1.0, recall: 1.0, f1: 1.0 };
    }

    if (matchedCount === 0 && expectedCount > 0) {
      return { precision: 1.0, recall: 0.0, f1: 0.0 };
    }

    // Normal case
    const precision = correctCount / matchedCount;
    const recall = correctCount / expectedCount;

    const f1 =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0.0;

    return { precision, recall, f1 };
  }
}
