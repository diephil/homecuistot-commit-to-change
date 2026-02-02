import { z } from "zod";
import { BaseMetric, EvaluationScoreResult } from "opik";

const validationSchema = z.object({
  output: z.any(), // Accept any type (will be validated internally)
  expected: z.any(), // Accept any type (will be validated internally)
});

type Input = z.infer<typeof validationSchema>;

interface IngredientData {
  add: string[];
  rm: string[];
}

export class IngredientSetMatch extends BaseMetric<typeof validationSchema> {
  public validationSchema = validationSchema;

  constructor(name = "ingredient_set_match", trackMetric = true) {
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

    // Edge case: no output but expected exists → precision 1.0 (no false positives), recall 0.0
    if (output.length === 0 && expected.length > 0) {
      return { precision: 1.0, recall: 0.0, f1: 0.0 };
    }

    // Edge case: output exists but no expected → precision 0.0, recall 1.0 (no false negatives)
    if (output.length > 0 && expected.length === 0) {
      return { precision: 0.0, recall: 1.0, f1: 0.0 };
    }

    // Normal case: both have values
    const precision = correct / output.length;
    const recall = correct / expected.length;

    // F1 = harmonic mean of precision and recall
    // Avoid division by zero
    const f1 =
      precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0.0;

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
          `Expected is not an object, got: ${typeof params.expected}`
        );
      }

      const outputData = params.output as IngredientData;
      const expectedData = params.expected as IngredientData;

      // Calculate metrics for 'add' array
      const addMetrics = this.calculateMetrics({
        output: outputData.add,
        expected: expectedData.add,
      });

      // Calculate metrics for 'rm' array
      const rmMetrics = this.calculateMetrics({
        output: outputData.rm,
        expected: expectedData.rm,
      });

      // Calculate overall F1 (average of add_f1 and rm_f1)
      const overallF1 = (addMetrics.f1 + rmMetrics.f1) / 2;

      // Return array of 7 score results
      return [
        {
          name: "add_precision",
          value: addMetrics.precision,
          reason: `Add precision: ${(addMetrics.precision * 100).toFixed(1)}% (${[...new Set(outputData.add)].filter((item) => new Set(expectedData.add).has(item)).length} correct / ${outputData.add.length} total)`,
        },
        {
          name: "add_recall",
          value: addMetrics.recall,
          reason: `Add recall: ${(addMetrics.recall * 100).toFixed(1)}% (${[...new Set(outputData.add)].filter((item) => new Set(expectedData.add).has(item)).length} correct / ${expectedData.add.length} expected)`,
        },
        {
          name: "add_f1",
          value: addMetrics.f1,
          reason: `Add F1: ${(addMetrics.f1 * 100).toFixed(1)}% (harmonic mean of precision and recall)`,
        },
        {
          name: "rm_precision",
          value: rmMetrics.precision,
          reason: `Remove precision: ${(rmMetrics.precision * 100).toFixed(1)}% (${[...new Set(outputData.rm)].filter((item) => new Set(expectedData.rm).has(item)).length} correct / ${outputData.rm.length} total)`,
        },
        {
          name: "rm_recall",
          value: rmMetrics.recall,
          reason: `Remove recall: ${(rmMetrics.recall * 100).toFixed(1)}% (${[...new Set(outputData.rm)].filter((item) => new Set(expectedData.rm).has(item)).length} correct / ${expectedData.rm.length} expected)`,
        },
        {
          name: "rm_f1",
          value: rmMetrics.f1,
          reason: `Remove F1: ${(rmMetrics.f1 * 100).toFixed(1)}% (harmonic mean of precision and recall)`,
        },
        {
          name: "overall_f1",
          value: overallF1,
          reason: `Overall F1: ${(overallF1 * 100).toFixed(1)}% (average of add_f1 and rm_f1)`,
        },
      ];
    } catch (error) {
      // Return error scores
      return [
        {
          name: "add_precision",
          value: 0.0,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
        {
          name: "add_recall",
          value: 0.0,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
        {
          name: "add_f1",
          value: 0.0,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
        {
          name: "rm_precision",
          value: 0.0,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
        {
          name: "rm_recall",
          value: 0.0,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
        {
          name: "rm_f1",
          value: 0.0,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
        {
          name: "overall_f1",
          value: 0.0,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ];
    }
  }
}
