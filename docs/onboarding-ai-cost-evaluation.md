# Onboarding AI Cost Evaluation: Technical Specification

## Executive Summary

This document outlines the technical specification for evaluating cost-effectiveness of AI approaches in the HomeCuistot onboarding flow. The evaluation compares Gemini-only vs Whisper + smaller model approaches using Opik for comprehensive telemetry tracking.

## Current State Analysis

### Existing Implementation
- **Framework**: Next.js 16 API routes with Vercel AI SDK
- **Model**: Google Gemini 2.5 Flash Lite
- **Telemetry**: OpenTelemetry → Opik via `OpikExporter`
- **Location**: `apps/nextjs/src/app/api/hello/route.ts`
- **Onboarding UI**: Step-based flow at `apps/nextjs/src/app/(protected)/onboarding/page.tsx`

### Current Telemetry Setup
```typescript
// apps/nextjs/src/instrumentation.ts
import { OpikExporter } from "opik-vercel";

registerOTel({
  serviceName: "homecuistot-hackathon",
  traceExporter: new OpikExporter({
    tags: ["nextjs", env, commitSha, vercelUrl].filter(Boolean),
  }),
});
```

## Evaluation Methodology Using Opik

### Phase 1: Baseline Measurement (Gemini-only)
1. **Instrument existing onboarding API endpoints** with Opik telemetry
2. **Tag traces** with identifiable markers for filtering in Opik dashboard
3. **Run simulation** with representative user interactions
4. **Extract metrics** from Opik dashboard: token counts, latency, costs

### Phase 2: Alternative Implementation
1. **Implement Whisper + smaller model** pipeline
2. **Use same Opik tags** for comparison
3. **Run identical simulation** workload
4. **Extract parallel metrics** from Opik

### Phase 3: Analysis
1. **Filter traces** in Opik by tags (`approach:gemini-only` vs `approach:whisper-hybrid`)
2. **Compare aggregated metrics** across user count scenarios
3. **Generate cost projections** based on actual token usage

## Technical Approaches

### Option 1: Gemini-only (Baseline)

**Use Case**: Single model handles both speech recognition and semantic processing

**Architecture**:
```
Audio Input → Gemini 2.0 Flash (multimodal) → Structured Output
```

**Implementation Snippet**:
```typescript
// apps/nextjs/src/app/api/onboarding/voice/route.ts
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { OpikExporter } from "opik-vercel";
import { z } from "zod";

const OnboardingSchema = z.object({
  favoriteDishes: z.array(z.string()),
  fridgeIngredients: z.array(z.string()),
  pantryIngredients: z.array(z.string()),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get("audio") as File;

  // Convert to base64 for Gemini multimodal
  const audioBuffer = await audioFile.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString("base64");

  const result = await generateObject({
    model: google("gemini-2.0-flash-exp"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract onboarding data from this audio" },
          {
            type: "file",
            data: audioBase64,
            mimeType: audioFile.type,
          },
        ],
      },
    ],
    schema: OnboardingSchema,
    experimental_telemetry: OpikExporter.getSettings({
      name: "onboarding-voice-gemini-only",
      metadata: {
        approach: "gemini-only",
        userId: "test-user-123",
        sessionId: crypto.randomUUID(),
      },
    }),
  });

  return Response.json(result.object);
}
```

**Pros**:
- Single API call (lower latency)
- Simpler architecture
- Native multimodal support
- Unified error handling

**Cons**:
- Higher per-token cost
- No ability to optimize each stage independently
- Limited model choice for speech recognition

**Cost Factors**:
- **Input tokens**: Audio → Gemini (multimodal pricing)
- **Output tokens**: Structured JSON response
- **Pricing**: Gemini 2.0 Flash multimodal rates apply

---

### Option 2: Whisper + Gemini Flash

**Use Case**: Specialized speech-to-text + cost-optimized text processing

**Architecture**:
```
Audio Input → Whisper API → Text → Gemini Flash Lite → Structured Output
```

**Implementation Snippet**:
```typescript
// apps/nextjs/src/app/api/onboarding/voice-hybrid/route.ts
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { OpikExporter } from "opik-vercel";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get("audio") as File;

  // Step 1: Whisper transcription
  const transcriptionStart = Date.now();
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });
  const transcriptionDuration = Date.now() - transcriptionStart;

  // Step 2: Gemini Flash processing with Opik tracing
  const result = await generateObject({
    model: google("gemini-2.5-flash-lite"),
    messages: [
      {
        role: "user",
        content: `Extract onboarding data from: "${transcription.text}"`,
      },
    ],
    schema: OnboardingSchema,
    experimental_telemetry: OpikExporter.getSettings({
      name: "onboarding-voice-hybrid",
      metadata: {
        approach: "whisper-gemini",
        userId: "test-user-123",
        sessionId: crypto.randomUUID(),
        transcriptionDuration,
        whisperCost: calculateWhisperCost(audioFile.size),
      },
    }),
  });

  return Response.json({
    ...result.object,
    transcription: transcription.text,
  });
}

function calculateWhisperCost(fileSizeBytes: number) {
  // Whisper: $0.006 per minute (approximate from file size)
  const estimatedMinutes = fileSizeBytes / (60 * 16000 * 2); // 16kHz, 16-bit
  return estimatedMinutes * 0.006;
}
```

**Pros**:
- Whisper is specialized and highly accurate
- Gemini Flash Lite is cheaper for text processing
- Can independently optimize each stage
- Better error handling (can retry stages separately)

**Cons**:
- Two API calls (higher latency)
- More complex error handling
- Additional code complexity

**Cost Factors**:
- **Whisper**: $0.006/minute (fixed, audio length dependent)
- **Gemini Input tokens**: Transcribed text length
- **Gemini Output tokens**: Structured JSON response

---

### Option 3: Whisper + Claude Haiku (Alternative)

**Use Case**: Best-in-class speech recognition + ultra-low-cost text processing

**Architecture**:
```
Audio Input → Whisper API → Text → Claude Haiku → Structured Output
```

**Implementation Snippet**:
```typescript
// apps/nextjs/src/app/api/onboarding/voice-haiku/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { OpikExporter } from "opik-vercel";
import OpenAI from "openai";

const openai = new OpenAI();
const anthropic = new Anthropic();

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get("audio") as File;

  // Step 1: Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });

  // Step 2: Claude Haiku with tool use for structured output
  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    tools: [
      {
        name: "save_onboarding_data",
        description: "Save extracted onboarding preferences",
        input_schema: {
          type: "object",
          properties: {
            favoriteDishes: { type: "array", items: { type: "string" } },
            fridgeIngredients: { type: "array", items: { type: "string" } },
            pantryIngredients: { type: "array", items: { type: "string" } },
          },
          required: ["favoriteDishes", "fridgeIngredients", "pantryIngredients"],
        },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Extract onboarding data from: "${transcription.text}"`,
      },
    ],
  });

  // Extract structured data from tool use
  const toolUse = message.content.find((c) => c.type === "tool_use");
  const data = toolUse ? toolUse.input : null;

  // Manual Opik logging for Claude (no native Vercel AI SDK integration)
  await logToOpik({
    name: "onboarding-voice-haiku",
    metadata: {
      approach: "whisper-haiku",
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
  });

  return Response.json(data);
}
```

**Pros**:
- Claude Haiku: lowest cost per token among frontier models
- Strong structured output via tool use
- Excellent instruction following

**Cons**:
- Requires Anthropic API integration
- No native Vercel AI SDK support (manual tracing)
- More complex Opik integration

**Cost Factors**:
- **Whisper**: $0.006/minute
- **Haiku Input**: $0.25 per 1M tokens
- **Haiku Output**: $1.25 per 1M tokens

---

### Option 4: Local Whisper + Gemini Flash (Self-hosted)

**Use Case**: Eliminate Whisper API costs for high-volume scenarios

**Architecture**:
```
Audio Input → Whisper.cpp (local) → Text → Gemini Flash Lite → Structured Output
```

**Implementation Snippet**:
```typescript
// apps/nextjs/src/app/api/onboarding/voice-local/route.ts
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { OpikExporter } from "opik-vercel";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

async function transcribeLocal(audioFile: File): Promise<string> {
  const tempPath = path.join("/tmp", `audio-${Date.now()}.wav`);

  // Save audio to temp file
  const buffer = await audioFile.arrayBuffer();
  await writeFile(tempPath, Buffer.from(buffer));

  // Run whisper.cpp (assumes binary is installed)
  const { stdout } = await execAsync(
    `whisper-cpp -m models/ggml-base.en.bin -f ${tempPath} --output-txt`
  );

  // Cleanup
  await unlink(tempPath);

  return stdout.trim();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get("audio") as File;

  // Local transcription (no API cost)
  const transcription = await transcribeLocal(audioFile);

  // Gemini processing
  const result = await generateObject({
    model: google("gemini-2.5-flash-lite"),
    messages: [
      {
        role: "user",
        content: `Extract onboarding data from: "${transcription}"`,
      },
    ],
    schema: OnboardingSchema,
    experimental_telemetry: OpikExporter.getSettings({
      name: "onboarding-voice-local",
      metadata: {
        approach: "local-whisper-gemini",
        whisperCost: 0, // Self-hosted
      },
    }),
  });

  return Response.json(result.object);
}
```

**Pros**:
- Zero Whisper API costs
- Full control over speech recognition
- Lower latency (no external API)
- Privacy benefits (audio stays local)

**Cons**:
- Infrastructure complexity (GPU required for real-time)
- Model management overhead
- Accuracy may be lower than OpenAI Whisper
- Deployment complexity on Vercel (may need separate service)

**Cost Factors**:
- **Whisper**: $0 (compute costs only)
- **Gemini tokens**: Same as Option 2

---

## Opik-Compatible Evaluation Process

### 1. Setup Tagged Experiments

```typescript
// Shared utility for consistent tagging
// apps/nextjs/src/utils/opik-tags.ts

export function getExperimentTags(
  approach: "gemini-only" | "whisper-gemini" | "whisper-haiku" | "local-whisper",
  userId: string,
  sessionId: string
) {
  return {
    name: `onboarding-voice-${approach}`,
    metadata: {
      experiment: "cost-evaluation-2026-01",
      approach,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
    },
  };
}
```

### 2. Simulation Script

```typescript
// scripts/simulate-onboarding.ts
/**
 * Simulates onboarding sessions for cost evaluation
 * Run with: tsx scripts/simulate-onboarding.ts
 */

const APPROACHES = [
  "gemini-only",
  "whisper-gemini",
  "whisper-haiku",
  "local-whisper",
];

const SAMPLE_AUDIO_FILES = [
  "test-data/onboarding-short.wav",  // 10s
  "test-data/onboarding-medium.wav", // 30s
  "test-data/onboarding-long.wav",   // 60s
];

async function runSimulation(userCount: number, approach: string) {
  for (let i = 0; i < userCount; i++) {
    const audioFile = SAMPLE_AUDIO_FILES[i % SAMPLE_AUDIO_FILES.length];
    const formData = new FormData();
    formData.append("audio", await readFile(audioFile));

    await fetch(`http://localhost:3000/api/onboarding/voice-${approach}`, {
      method: "POST",
      body: formData,
    });

    // Throttle to avoid rate limits
    await sleep(100);
  }
}

async function main() {
  console.log("Starting cost evaluation simulation...");

  for (const approach of APPROACHES) {
    console.log(`\nRunning ${approach} with 100 users...`);
    await runSimulation(100, approach);
  }

  console.log("\n✅ Simulation complete. Check Opik dashboard for results.");
  console.log("http://localhost:5173");
}

main();
```

### 3. Opik Dashboard Analysis

**Step-by-step process**:

1. **Navigate to Opik dashboard**: `http://localhost:5173`

2. **Create filtered views** for each approach:
   ```
   Filter: metadata.experiment = "cost-evaluation-2026-01"
   Group by: metadata.approach
   ```

3. **Extract key metrics** for each approach:
   - Total input tokens
   - Total output tokens
   - Average latency (ms)
   - P95 latency
   - Error rate
   - Total API calls

4. **Calculate costs** using extracted token counts:
   ```typescript
   // Cost calculation formulas

   // Gemini-only
   const geminiCost =
     (inputTokens * GEMINI_2_FLASH_INPUT_RATE) +
     (outputTokens * GEMINI_2_FLASH_OUTPUT_RATE);

   // Whisper + Gemini
   const whisperCost = audioMinutes * 0.006;
   const geminiTextCost =
     (inputTokens * GEMINI_FLASH_LITE_INPUT_RATE) +
     (outputTokens * GEMINI_FLASH_LITE_OUTPUT_RATE);
   const hybridCost = whisperCost + geminiTextCost;
   ```

5. **Export data** from Opik:
   - Use Opik's export feature to download trace data as CSV
   - Import into spreadsheet for projection calculations

6. **Generate projections** for 1k, 10k, 100k users:
   ```
   Cost per user = Total cost / Number of simulated users
   Projected cost = Cost per user × Target user count
   ```

### 4. Comparison Framework

| Metric | Gemini-only | Whisper + Gemini | Whisper + Haiku | Local + Gemini |
|--------|-------------|------------------|-----------------|----------------|
| **Input tokens** | (Opik) | (Opik) | (Opik) | (Opik) |
| **Output tokens** | (Opik) | (Opik) | (Opik) | (Opik) |
| **Audio cost** | Included | $0.006/min | $0.006/min | $0 |
| **Text processing cost** | Higher | Lower | Lowest | Lower |
| **Avg latency** | (Opik) | (Opik) | (Opik) | (Opik) |
| **P95 latency** | (Opik) | (Opik) | (Opik) | (Opik) |
| **Cost @ 1k users** | Calculated | Calculated | Calculated | Calculated |
| **Cost @ 10k users** | Calculated | Calculated | Calculated | Calculated |
| **Cost @ 100k users** | Calculated | Calculated | Calculated | Calculated |
| **Break-even point** | N/A | Calculated | Calculated | Calculated |

### 5. Opik Query Examples

```typescript
// Use Opik's API to programmatically extract metrics
import { Opik } from "opik";

const opik = new Opik();

async function extractMetrics(approach: string) {
  const traces = await opik.searchTraces({
    filter: {
      "metadata.experiment": "cost-evaluation-2026-01",
      "metadata.approach": approach,
    },
  });

  const totalInputTokens = traces.reduce((sum, t) => sum + t.usage.inputTokens, 0);
  const totalOutputTokens = traces.reduce((sum, t) => sum + t.usage.outputTokens, 0);
  const avgLatency = traces.reduce((sum, t) => sum + t.duration, 0) / traces.length;

  return {
    approach,
    totalInputTokens,
    totalOutputTokens,
    avgLatency,
    traceCount: traces.length,
  };
}
```

## Pricing Reference (January 2026)

### Gemini
- **Gemini 2.0 Flash**: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Gemini Flash Lite**: $0.0375 per 1M input tokens, $0.15 per 1M output tokens

### Whisper
- **Whisper-1**: $0.006 per minute

### Claude
- **Haiku 3.5**: $0.25 per 1M input tokens, $1.25 per 1M output tokens

### GPT (Alternative)
- **GPT-4o-mini**: $0.15 per 1M input tokens, $0.60 per 1M output tokens

## Recommendation Framework

### When to use Gemini-only
- **Low volume** (<1k users/month)
- **Latency is critical** (single API call)
- **Simple architecture preferred**
- Break-even analysis shows minimal cost difference

### When to use Whisper + smaller model
- **High volume** (>10k users/month)
- **Cost optimization is priority**
- **Audio accuracy is critical** (Whisper is best-in-class)
- Break-even analysis shows >20% cost savings

### When to use local Whisper
- **Very high volume** (>100k users/month)
- **Privacy requirements** (audio data stays internal)
- **Infrastructure resources available** (GPU servers)

## Next Steps

1. **Implement all 4 approaches** in separate API routes
2. **Create simulation script** with representative audio samples
3. **Run simulations** and collect Opik traces
4. **Analyze Opik dashboard** data
5. **Generate cost projections** spreadsheet
6. **Make recommendation** based on data
7. **Document findings** in final report

## Implementation Checklist

- [ ] Create API route: `apps/nextjs/src/app/api/onboarding/voice-gemini-only/route.ts`
- [ ] Create API route: `apps/nextjs/src/app/api/onboarding/voice-whisper-gemini/route.ts`
- [ ] Create API route: `apps/nextjs/src/app/api/onboarding/voice-whisper-haiku/route.ts`
- [ ] Create API route: `apps/nextjs/src/app/api/onboarding/voice-local-whisper/route.ts`
- [ ] Create utility: `apps/nextjs/src/utils/opik-tags.ts`
- [ ] Create simulation script: `scripts/simulate-onboarding.ts`
- [ ] Prepare test audio files: `test-data/onboarding-*.wav`
- [ ] Run simulations for all approaches
- [ ] Extract metrics from Opik dashboard
- [ ] Calculate cost projections
- [ ] Create comparison spreadsheet
- [ ] Generate final recommendation report

## Appendix: Sample Audio Scenarios

### Short (10s)
"I like pasta carbonara and grilled cheese. I have eggs, cheese, tomatoes, and pasta in my kitchen."

### Medium (30s)
"For favorite dishes, I really enjoy pasta carbonara, chicken stir fry, and scrambled eggs. In my fridge, I have tomatoes, eggs, cheese, chicken breast, and bell peppers. In my pantry, I have pasta, rice, salt, olive oil, and soy sauce."

### Long (60s)
"Let me tell you about my cooking preferences. I really love making pasta carbonara, it's one of my go-to dishes. I also enjoy chicken stir fry when I want something quick and healthy. Scrambled eggs are my favorite breakfast. For ingredients, let me start with what's in my fridge: I have fresh tomatoes, a dozen eggs, some cheddar cheese, chicken breast that I bought yesterday, and colorful bell peppers. Moving to my pantry, I have spaghetti pasta, jasmine rice, salt, extra virgin olive oil, and soy sauce. I try to keep these basics stocked so I can make a variety of meals throughout the week."

---

**Document Version**: 1.0
**Date**: 2026-01-22
**Status**: Draft for Review
