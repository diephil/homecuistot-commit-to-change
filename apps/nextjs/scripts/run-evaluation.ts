/**
 * Run Single Evaluation
 *
 * Execute a specific evaluation by folder name.
 * Usage: pnpm eval <folder> [nbSamples]
 */

import path from "path";
import { existsSync } from "fs";

async function main() {
  // Parse CLI arguments
  const folder = process.argv[2];
  const nbSamples = process.argv[3] ? parseInt(process.argv[3]) : undefined;

  if (!folder) {
    console.error("❌ Error: Missing evaluation folder name");
    console.log("\nUsage: pnpm eval <folder> [nbSamples]");
    console.log("Example: pnpm eval ingredient-extractor 10");
    process.exit(1);
  }

  const filePath = path.join(
    process.cwd(),
    "evaluation",
    folder,
    "evaluation.ts",
  );

  if (!existsSync(filePath)) {
    console.error(`❌ Error: Evaluation not found at ${filePath}`);
    process.exit(1);
  }

  console.log(`\n🧪 Running: ${folder}...`);
  if (nbSamples) console.log(`📊 nbSamples: ${nbSamples}\n`);

  try {
    // Dynamic import
    const imported = await import(filePath);
    const { evaluation } = imported;

    if (!evaluation || typeof evaluation !== "function") {
      throw new Error(`No evaluation function exported from ${filePath}`);
    }

    // Execute
    const result = await evaluation({ nbSamples });

    console.log(`\n✅ Complete`);
    if (result?.resultUrl) {
      console.log(`🔗 ${result.resultUrl}`);
    }
  } catch (error) {
    console.error(
      `\n❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
