#!/usr/bin/env tsx
// Register inventory-update prompt to Opik
// Feature: 014-inventory-page-rework

import { Opik, PromptType } from "opik";
import { INVENTORY_UPDATE_PROMPT } from "../src/lib/prompts/inventory-update/prompt";

async function main() {
  const env = (process.env.NODE_ENV as "development" | "production") || "development";
  const client = new Opik();

  const prompt = await client.createPrompt({
    ...INVENTORY_UPDATE_PROMPT,
    type: PromptType.MUSTACHE,
    metadata: { ...INVENTORY_UPDATE_PROMPT.metadata, env },
    tags: [...INVENTORY_UPDATE_PROMPT.tags, env],
  });

  console.log(`Registered: ${prompt.name} [${env}] (commit: ${prompt.commit})`);
}

main().catch(console.error);
