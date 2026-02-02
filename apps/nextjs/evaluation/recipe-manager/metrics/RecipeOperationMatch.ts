import { z } from "zod";
import { BaseMetric, EvaluationScoreResult } from "opik";
import { distance } from "fastest-levenshtein";
import type { RecipeManagerProposal, RecipeToolResult } from "@/types/recipe-agent";

const validationSchema = z.object({
  output: z.any(),
  expected: z.any(),
});

type Input = z.infer<typeof validationSchema>;

// Minimum similarity ratio to consider titles as matching (0.7 = 70% similar)
const TITLE_SIMILARITY_THRESHOLD = 0.7;

/**
 * Calculates precision, recall, and F1 score for recipe operations
 *
 * Metrics (9 scores):
 * 1-3: operation_precision, operation_recall, operation_f1 (operation type matching)
 * 4-6: title_precision, title_recall, title_f1 (recipe title matching using Levenshtein)
 * 7: title_similarity (average Levenshtein ratio for matched titles)
 * 8: overall_f1 (average of operation and title F1 scores)
 * 9: no_changes_match (1.0 if noChangesDetected flags match, 0.0 otherwise)
 */
export class RecipeOperationMatch extends BaseMetric<typeof validationSchema> {
  public validationSchema = validationSchema;

  constructor(name = "recipe_operation_match", trackMetric = true) {
    super(name, trackMetric);
  }

  /**
   * Calculate Levenshtein ratio (similarity score 0-1)
   * 1.0 = identical, 0.0 = completely different
   */
  private levenshteinRatio(a: string, b: string): number {
    if (a === b) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;
    const maxLen = Math.max(a.length, b.length);
    return 1 - distance(a, b) / maxLen;
  }

  /**
   * Find best matching title using Levenshtein ratio
   * Returns the ratio if above threshold, otherwise 0
   */
  private findBestTitleMatch(
    outputTitle: string,
    expectedTitles: string[],
    usedIndices: Set<number>,
  ): { ratio: number; matchedIndex: number } {
    let bestRatio = 0;
    let bestIndex = -1;

    for (let i = 0; i < expectedTitles.length; i++) {
      if (usedIndices.has(i)) continue;
      const ratio = this.levenshteinRatio(outputTitle, expectedTitles[i]);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIndex = i;
      }
    }

    return { ratio: bestRatio, matchedIndex: bestIndex };
  }

  private calculateMetrics(params: {
    output: string[];
    expected: string[];
  }): { precision: number; recall: number; f1: number } {
    const { output, expected } = params;

    const outputSet = new Set(output);
    const expectedSet = new Set(expected);

    const correct = [...outputSet].filter((item) => expectedSet.has(item))
      .length;

    if (output.length === 0 && expected.length === 0) {
      return { precision: 1.0, recall: 1.0, f1: 1.0 };
    }

    if (output.length === 0 && expected.length > 0) {
      return { precision: 1.0, recall: 0.0, f1: 0.0 };
    }

    if (output.length > 0 && expected.length === 0) {
      return { precision: 0.0, recall: 1.0, f1: 0.0 };
    }

    const precision = correct / output.length;
    const recall = correct / expected.length;

    const f1 =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0.0;

    return { precision, recall, f1 };
  }

  /**
   * Calculate title metrics using Levenshtein fuzzy matching
   */
  private calculateTitleMetrics(params: {
    outputTitles: string[];
    expectedTitles: string[];
  }): {
    precision: number;
    recall: number;
    f1: number;
    avgSimilarity: number;
    matchedCount: number;
  } {
    const { outputTitles, expectedTitles } = params;

    if (outputTitles.length === 0 && expectedTitles.length === 0) {
      return { precision: 1.0, recall: 1.0, f1: 1.0, avgSimilarity: 1.0, matchedCount: 0 };
    }

    if (outputTitles.length === 0 && expectedTitles.length > 0) {
      return { precision: 1.0, recall: 0.0, f1: 0.0, avgSimilarity: 0.0, matchedCount: 0 };
    }

    if (outputTitles.length > 0 && expectedTitles.length === 0) {
      return { precision: 0.0, recall: 1.0, f1: 0.0, avgSimilarity: 0.0, matchedCount: 0 };
    }

    // Match output titles to expected titles using Levenshtein
    const usedIndices = new Set<number>();
    let matchedCount = 0;
    let totalSimilarity = 0;

    for (const outputTitle of outputTitles) {
      const { ratio, matchedIndex } = this.findBestTitleMatch(
        outputTitle,
        expectedTitles,
        usedIndices,
      );

      if (ratio >= TITLE_SIMILARITY_THRESHOLD && matchedIndex >= 0) {
        matchedCount++;
        totalSimilarity += ratio;
        usedIndices.add(matchedIndex);
      }
    }

    const precision = matchedCount / outputTitles.length;
    const recall = matchedCount / expectedTitles.length;
    const f1 =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0.0;
    const avgSimilarity = matchedCount > 0 ? totalSimilarity / matchedCount : 0.0;

    return { precision, recall, f1, avgSimilarity, matchedCount };
  }

  /**
   * Extract operation types from recipe results
   */
  private extractOperationTypes(recipes: RecipeToolResult[]): string[] {
    return recipes.map((r) => r.operation);
  }

  /**
   * Extract recipe titles from create operations
   */
  private extractTitles(recipes: RecipeToolResult[]): string[] {
    const titles: string[] = [];

    for (const recipe of recipes) {
      if (recipe.operation === "create_batch" && "results" in recipe) {
        for (const result of recipe.results) {
          if ("title" in result && result.title) {
            titles.push(result.title.toLowerCase());
          }
        }
      } else if (recipe.operation === "create" && "title" in recipe) {
        titles.push((recipe as { title: string }).title.toLowerCase());
      }
    }

    return titles;
  }

  async score(params: Input): Promise<EvaluationScoreResult[]> {
    try {
      if (typeof params.output !== "object" || params.output === null) {
        throw new Error(`Output is not an object, got: ${typeof params.output}`);
      }
      if (typeof params.expected !== "object" || params.expected === null) {
        throw new Error(
          `Expected is not an object, got: ${typeof params.expected}`,
        );
      }

      const outputData = params.output as RecipeManagerProposal;
      const expectedData = params.expected as RecipeManagerProposal;

      // 1. Extract operation types
      const outputOps = this.extractOperationTypes(outputData.recipes);
      const expectedOps = this.extractOperationTypes(expectedData.recipes);

      // 2. Calculate operation matching metrics
      const operationMetrics = this.calculateMetrics({
        output: outputOps,
        expected: expectedOps,
      });

      // 3. Extract and compare recipe titles (for creates)
      const outputTitles = this.extractTitles(outputData.recipes);
      const expectedTitles = this.extractTitles(expectedData.recipes);

      // 4. Calculate title matching metrics using Levenshtein
      const titleMetrics = this.calculateTitleMetrics({
        outputTitles,
        expectedTitles,
      });

      // 5. Calculate overall F1
      const overallF1 = (operationMetrics.f1 + titleMetrics.f1) / 2;

      // 6. Validate noChangesDetected flag
      const noChangesMatch =
        outputData.noChangesDetected === expectedData.noChangesDetected
          ? 1.0
          : 0.0;

      return [
        {
          name: "operation_precision",
          value: operationMetrics.precision,
          reason: `Operation precision: ${(operationMetrics.precision * 100).toFixed(1)}% (${[...new Set(outputOps)].filter((n) => new Set(expectedOps).has(n)).length} correct / ${outputOps.length} total)`,
        },
        {
          name: "operation_recall",
          value: operationMetrics.recall,
          reason: `Operation recall: ${(operationMetrics.recall * 100).toFixed(1)}% (${[...new Set(outputOps)].filter((n) => new Set(expectedOps).has(n)).length} correct / ${expectedOps.length} expected)`,
        },
        {
          name: "operation_f1",
          value: operationMetrics.f1,
          reason: `Operation F1: ${(operationMetrics.f1 * 100).toFixed(1)}% (harmonic mean)`,
        },
        {
          name: "title_precision",
          value: titleMetrics.precision,
          reason: `Title precision: ${(titleMetrics.precision * 100).toFixed(1)}% (${titleMetrics.matchedCount} matched / ${outputTitles.length} output, threshold: ${TITLE_SIMILARITY_THRESHOLD * 100}%)`,
        },
        {
          name: "title_recall",
          value: titleMetrics.recall,
          reason: `Title recall: ${(titleMetrics.recall * 100).toFixed(1)}% (${titleMetrics.matchedCount} matched / ${expectedTitles.length} expected)`,
        },
        {
          name: "title_f1",
          value: titleMetrics.f1,
          reason: `Title F1: ${(titleMetrics.f1 * 100).toFixed(1)}% (harmonic mean, Levenshtein matching)`,
        },
        {
          name: "title_similarity",
          value: titleMetrics.avgSimilarity,
          reason: `Title similarity: ${(titleMetrics.avgSimilarity * 100).toFixed(1)}% (avg Levenshtein ratio for matched titles)`,
        },
        {
          name: "overall_f1",
          value: overallF1,
          reason: `Overall F1: ${(overallF1 * 100).toFixed(1)}% (avg of operation and title F1)`,
        },
        {
          name: "no_changes_match",
          value: noChangesMatch,
          reason:
            noChangesMatch === 1.0
              ? `✓ noChangesDetected match: ${outputData.noChangesDetected}`
              : `✗ noChangesDetected mismatch: ${outputData.noChangesDetected} vs ${expectedData.noChangesDetected}`,
        },
      ];
    } catch (error) {
      const errorReason = `Error: ${error instanceof Error ? error.message : String(error)}`;
      return [
        { name: "operation_precision", value: 0.0, reason: errorReason },
        { name: "operation_recall", value: 0.0, reason: errorReason },
        { name: "operation_f1", value: 0.0, reason: errorReason },
        { name: "title_precision", value: 0.0, reason: errorReason },
        { name: "title_recall", value: 0.0, reason: errorReason },
        { name: "title_f1", value: 0.0, reason: errorReason },
        { name: "title_similarity", value: 0.0, reason: errorReason },
        { name: "overall_f1", value: 0.0, reason: errorReason },
        { name: "no_changes_match", value: 0.0, reason: errorReason },
      ];
    }
  }
}
