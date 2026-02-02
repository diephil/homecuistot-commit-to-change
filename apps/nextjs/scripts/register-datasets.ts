/**
 * Register All Evaluation Datasets to Opik
 *
 * Automatically discovers dataset.ts files under evaluation/ and registers to Opik.
 * Supports dev and prod environments via NODE_ENV.
 */

import { Opik } from "opik";
import { glob } from "glob";
import path from "path";
import type { Dataset } from "../evaluation/types";

async function main() {
  const env =
    (process.env.NODE_ENV as "development" | "production") || "development";
  const client = new Opik({ projectName: "homecuistot" });

  console.log(`\n🔍 Discovering evaluation datasets...`);

  // Find all dataset.ts files under evaluation/*/
  const datasetFiles = await glob("evaluation/*/dataset.ts", {
    cwd: path.join(process.cwd()),
    absolute: true,
  });

  console.log(`✅ Found ${datasetFiles.length} dataset(s)\n`);

  const results: Array<{ name: string; count: number; status: string }> = [];

  for (const filePath of datasetFiles) {
    try {
      // Dynamic import
      const imported = await import(filePath);
      const dataset: Dataset<unknown> = imported.DATASET;

      if (!dataset || !dataset.name || !dataset.entries) {
        throw new Error(`Invalid dataset export in ${filePath}`);
      }

      console.log(`📦 Registering: ${dataset.name}...`);

      // Create dataset in Opik (upsert pattern - idempotent)
      const opikDataset = await client.createDataset(
        dataset.name,
        dataset.description,
      );

      // Direct insert - assumes dataset structure matches Opik format
      await opikDataset.insert(dataset.entries);

      results.push({
        name: dataset.name,
        count: dataset.entries.length,
        status: "✅",
      });

      console.log(`   ✅ ${dataset.entries.length} items\n`);
    } catch (error) {
      const fileName = path.basename(path.dirname(filePath));
      results.push({
        name: fileName,
        count: 0,
        status: "❌",
      });
      console.error(
        `   ❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
  }

  // Summary
  console.log(`${"=".repeat(60)}`);
  console.log(`📊 Registration Summary [${env.toUpperCase()}]`);
  console.log(`${"=".repeat(60)}`);
  results.forEach((r) =>
    console.log(`${r.status} ${r.name} (${r.count} items)`),
  );

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
