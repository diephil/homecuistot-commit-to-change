import { z } from "zod";
import { BaseMetric, EvaluationScoreResult } from "opik";

const validationSchema = z.object({
  output: z.any(), // Accept any type (will be validated internally)
});

type Input = z.infer<typeof validationSchema>;

export class StructureMatch extends BaseMetric<typeof validationSchema> {
  public validationSchema = validationSchema;

  constructor(name = "structure_match", trackMetric = true) {
    super(name, trackMetric);
  }

  async score(params: Input): Promise<EvaluationScoreResult> {
    const { output } = params;

    try {
      // Check if output is an object
      if (typeof output !== "object" || output === null) {
        return {
          name: this.name,
          value: 0.0,
          reason: `Output is not an object, got: ${typeof output}`,
        };
      }

      // Check if output has 'add' and 'rm' fields
      const hasAdd = "add" in output;
      const hasRm = "rm" in output;
      const isAddArray = Array.isArray(output.add);
      const isRmArray = Array.isArray(output.rm);
      const isAddStringArray = isAddArray
        ? output.add.every((item: unknown) => typeof item === "string")
        : false;
      const isRmStringArray = isRmArray
        ? output.rm.every((item: unknown) => typeof item === "string")
        : false;

      // All checks must pass
      const isValid =
        hasAdd &&
        hasRm &&
        isAddArray &&
        isRmArray &&
        isAddStringArray &&
        isRmStringArray;

      // Build detailed reason
      const issues: string[] = [];
      if (!hasAdd) issues.push("Missing 'add' field");
      if (!hasRm) issues.push("Missing 'rm' field");
      if (hasAdd && !isAddArray) issues.push("'add' is not an array");
      if (hasRm && !isRmArray) issues.push("'rm' is not an array");
      if (isAddArray && !isAddStringArray)
        issues.push("'add' array contains non-string values");
      if (isRmArray && !isRmStringArray)
        issues.push("'rm' array contains non-string values");

      const reason = isValid
        ? "Output has correct structure: {add: string[], rm: string[]}"
        : `Invalid structure: ${issues.join(", ")}`;

      return {
        name: this.name,
        value: isValid ? 1.0 : 0.0,
        reason,
      };
    } catch (error) {
      return {
        name: this.name,
        value: 0.0,
        reason: `Error validating structure: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
