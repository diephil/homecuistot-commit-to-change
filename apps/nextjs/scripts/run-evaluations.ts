/**
 * Run All Evaluations
 *
 * Discovers evaluation.ts files under evaluation/ and executes them.
 * Optional CLI argument: nbSamples
 */

import { glob } from "glob";
import path from "path";

async function main() {
  // Parse CLI arguments
  const nbSamples = process.argv[2] ? parseInt(process.argv[2]) : undefined;

  console.log(`\n🔍 Discovering evaluations...`);
  if (nbSamples) console.log(`📊 nbSamples: ${nbSamples}\n`);

  // Find all evaluation.ts files under evaluation/*/
  const evaluationFiles = await glob("evaluation/*/evaluation.ts", {
    cwd: path.join(process.cwd()),
    absolute: true,
  });

  console.log(`✅ Found ${evaluationFiles.length} evaluation(s)\n`);

  const results: Array<{
    name: string;
    status: string;
    url?: string;
  }> = [];

  for (const filePath of evaluationFiles) {
    try {
      const evalName = path.basename(path.dirname(filePath));
      console.log(`🧪 Running: ${evalName}...`);

      // Dynamic import
      const imported = await import(filePath);
      const { evaluation } = imported;

      if (!evaluation || typeof evaluation !== "function") {
        throw new Error(`No evaluation function exported`);
      }

      // Execute
      const result = await evaluation({ nbSamples });

      results.push({
        name: evalName,
        status: "✅",
        url: result?.resultUrl,
      });

      console.log(`   ✅ Complete`);
      if (result?.resultUrl) {
        console.log(`   🔗 ${result.resultUrl}`);
      }
      console.log();
    } catch (error) {
      const evalName = path.basename(path.dirname(filePath));
      results.push({
        name: evalName,
        status: "❌",
      });
      console.error(
        `   ❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
  }

  // Summary
  console.log(`${"=".repeat(60)}`);
  console.log(`📊 Evaluation Summary`);
  console.log(`${"=".repeat(60)}`);
  results.forEach((r) => {
    console.log(`${r.status} ${r.name}`);
    if (r.url) console.log(`   🔗 ${r.url}`);
  });

  const successCount = results.filter((r) => r.status === "✅").length;
  console.log(`\n✅ Success: ${successCount}/${results.length}`);

  if (successCount < results.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
