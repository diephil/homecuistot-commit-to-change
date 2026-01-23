import { Opik, PromptType } from "opik";
import { ONBOARDING_TEXT_PROMPT } from "../src/lib/prompts/onboarding-text/prompt";

async function main() {
  const env = (process.env.NODE_ENV as "development" | "production") || "development";
  const client = new Opik();

  const prompt = await client.createPrompt({
    ...ONBOARDING_TEXT_PROMPT,
    type: PromptType.MUSTACHE,
    metadata: { ...ONBOARDING_TEXT_PROMPT.metadata, env },
    tags: [...ONBOARDING_TEXT_PROMPT.tags, env],
  });

  console.log(`Registered: ${prompt.name} [${env}] (commit: ${prompt.commit})`);
}

main().catch(console.error);
