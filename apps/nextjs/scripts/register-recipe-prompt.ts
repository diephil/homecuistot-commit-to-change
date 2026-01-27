import { Opik, PromptType } from "opik";
import { RECIPE_EDITOR_PROMPT } from "../src/lib/prompts/recipe-editor/prompt";

async function main() {
  const env = (process.env.NODE_ENV as "development" | "production") || "development";
  const client = new Opik();

  const prompt = await client.createPrompt({
    ...RECIPE_EDITOR_PROMPT,
    type: PromptType.MUSTACHE,
    metadata: { ...RECIPE_EDITOR_PROMPT.metadata, env },
    tags: [...RECIPE_EDITOR_PROMPT.tags, env],
  });

  console.log(`Registered: ${prompt.name} [${env}] (commit: ${prompt.commit})`);
}

main().catch(console.error);
