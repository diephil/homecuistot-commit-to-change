#!/usr/bin/env tsx
/**
 * ADK Inventory Manager Agent Script
 *
 * Demonstrates @google/adk LlmAgent for inventory processing.
 * Processes natural language input, extracts ingredients with quantities,
 * validates against real database, returns InventoryUpdateProposal.
 *
 * Usage: pnpm adk:inventory
 */

import 'dotenv/config';

// ADK expects GOOGLE_GENAI_API_KEY or GEMINI_API_KEY
// Map from our existing GOOGLE_GENERATIVE_AI_API_KEY
if (process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
  process.env.GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

import { InMemoryRunner, isFinalResponse } from '@google/adk';
import { createInventoryAgent } from '../src/lib/agents/inventory';
import type { InventoryUpdateProposal } from '../src/types/inventory';

// Test inputs demonstrating various quantity contexts
const TEST_INPUTS = [
  'I just bought chicken, tomatoes, and onions',
  'Running low on olive oil and out of garlic',
  'Restocked eggs, milk, and some weird ingredient called frobnicator',
];

interface RunAgentParams {
  runner: InMemoryRunner;
  userId: string;
  sessionId: string;
  input: string;
}

async function runAgentWithInput(params: RunAgentParams): Promise<InventoryUpdateProposal | null> {
  const { runner, userId, sessionId, input } = params;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Input: "${input}"`);
  console.log('='.repeat(60));

  let finalOutput: InventoryUpdateProposal | null = null;

  for await (const event of runner.runAsync({
    userId,
    sessionId,
    newMessage: {
      role: 'user',
      parts: [{ text: input }],
    },
  })) {
    const isFinal = isFinalResponse(event);
    console.log(`  [Event] Author: ${event.author}, Final: ${isFinal}`);

    // Check for tool results (our validate tool returns the proposal)
    if (event.content?.parts) {
      for (const part of event.content.parts) {
        // Tool result contains the proposal
        if ('functionResponse' in part && part.functionResponse) {
          const response = part.functionResponse.response;
          if (response && typeof response === 'object' && 'recognized' in response) {
            finalOutput = response as unknown as InventoryUpdateProposal;
          }
        }
        // Text response (fallback)
        if ('text' in part && part.text && isFinal) {
          try {
            const parsed = JSON.parse(part.text);
            if (parsed.recognized !== undefined) {
              finalOutput = parsed as InventoryUpdateProposal;
            }
          } catch {
            // Not JSON, that's fine
          }
        }
      }
    }
  }

  // Display result
  if (finalOutput) {
    console.log('\n--- Result ---');
    console.log(`Recognized (${finalOutput.recognized.length}):`);
    for (const item of finalOutput.recognized) {
      console.log(`  - ${item.ingredientName}: level ${item.proposedQuantity} (${item.confidence})`);
    }
    if (finalOutput.unrecognized.length > 0) {
      console.log(`Unrecognized (${finalOutput.unrecognized.length}):`);
      for (const name of finalOutput.unrecognized) {
        console.log(`  - ${name}`);
      }
    }
  } else {
    console.log('\n[No structured output captured]');
  }

  return finalOutput;
}

async function main() {
  console.log('='.repeat(60));
  console.log('ADK Inventory Manager Agent');
  console.log('='.repeat(60));

  // Validate environment
  if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_GENAI_API_KEY not set');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL not set');
    process.exit(1);
  }

  console.log('Environment OK');

  // Create agent
  const agent = createInventoryAgent();
  console.log(`Agent created: ${agent.name}`);

  // Create runner with in-memory session
  const runner = new InMemoryRunner({
    agent,
    appName: 'inventory_manager_demo',
  });

  // Run test inputs (fresh session per input for isolation)
  for (const input of TEST_INPUTS) {
    const session = await runner.sessionService.createSession({
      userId: 'demo-user',
      appName: 'inventory_manager_demo',
    });

    await runAgentWithInput({
      runner,
      userId: 'demo-user',
      sessionId: session.id,
      input,
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('Demo complete!');
  console.log('='.repeat(60));

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
