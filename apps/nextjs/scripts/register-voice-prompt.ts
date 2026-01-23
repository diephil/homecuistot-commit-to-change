import { Opik, PromptType } from "opik";
import { ONBOARDING_VOICE_PROMPT } from "../src/lib/prompts/onboarding-voice/prompt";

async function main() {
  const env = (process.env.NODE_ENV as "development" | "production") || "development";
  const client = new Opik();

  const prompt = await client.createPrompt({
    ...ONBOARDING_VOICE_PROMPT,
    type: PromptType.MUSTACHE,
    metadata: { ...ONBOARDING_VOICE_PROMPT.metadata, env },
    tags: [...ONBOARDING_VOICE_PROMPT.tags, env],
  });

  console.log(`Registered: ${prompt.name} [${env}] (commit: ${prompt.commit})`);
}

main().catch(console.error);
