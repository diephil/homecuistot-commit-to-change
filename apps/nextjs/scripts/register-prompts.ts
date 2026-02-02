/**
 * Register All Agent Prompts to Opik
 *
 * Automatically discovers agent.ts files and registers their PROMPT variables to Opik.
 * Supports dev and prod environments via NODE_ENV.
 */

import { Opik, PromptType } from "opik";
import { glob } from "glob";
import path from "path";

async function main() {
  const env =
    (process.env.NODE_ENV as "development" | "production") || "development";
  const client = new Opik();

  console.log(`\n🔍 Discovering agent prompts...`);

  // Find all agent.ts files
  const agentFiles = await glob("src/lib/agents/**/agent.ts", {
    cwd: path.join(process.cwd()),
    absolute: true,
  });

  console.log(`✅ Found ${agentFiles.length} agents\n`);

  const results: Array<{ name: string; commit: string; status: string }> = [];

  for (const filePath of agentFiles) {
    try {
      // Dynamic import of the agent module
      const module = await import(filePath);

      if (!module.PROMPT) {
        console.warn(`⚠️  Skipped ${path.basename(path.dirname(filePath))}: No PROMPT export`);
        continue;
      }

      const { PROMPT } = module;

      // Register prompt to Opik
      const prompt = await client.createPrompt({
        name: PROMPT.name,
        prompt: PROMPT.prompt,
        description: PROMPT.description,
        versionId: PROMPT.versionId,
        promptId: PROMPT.promptId,
        tags: [...(PROMPT.tags || []), env],
        type: PromptType.MUSTACHE,
        metadata: { env },
      });

      results.push({
        name: prompt.name,
        commit: prompt.commit,
        status: "✅",
      });

      console.log(`✅ ${prompt.name} [${env}] (commit: ${prompt.commit})`);
    } catch (error) {
      const agentName = path.basename(path.dirname(filePath));
      results.push({
        name: agentName,
        commit: "",
        status: "❌",
      });
      console.error(`❌ ${agentName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Registration Summary [${env.toUpperCase()}]`);
  console.log(`${"=".repeat(60)}`);
  results.forEach((r) => console.log(`${r.status} ${r.name} ${r.commit ? `(${r.commit})` : ""}`));
  console.log(`${"=".repeat(60)}\n`);

  const successCount = results.filter((r) => r.status === "✅").length;
  console.log(`✅ Success: ${successCount}/${results.length}`);
  if (successCount < results.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
