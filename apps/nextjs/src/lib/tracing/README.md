# Opik Agent Tracing Guide

Learnings from implementing custom Opik traces for ADK-based agents.

## Overview

ADK (`@google/adk`) doesn't have native Opik integration. We use manual tracing with the `opik` SDK combined with `opik-gemini` for specific LLM calls.

## Architecture

```
[Trace] agent-name
├── [Span: LLM] audio-transcription (opik-gemini with parent)
│       → auto token usage + cost via trackGemini
├── [Span: LLM] adk-model-call-N (manual, per LLM response)
│       → usage from event.usageMetadata
└── [Span: Tool] adk-tool-call (manual, per tool execution)
        → starts on functionCall, ends on functionResponse
```

## Key Learnings

### 1. Provider Format for Cost Calculation

**Problem**: Manual spans showed token usage but no cost estimate.

**Solution**: Use `provider: "google_ai"` (not `"google"`) to match opik-gemini's format.

```typescript
// Wrong - no cost calculation
trace.span({ name, type: "llm", model, provider: "google" });

// Correct - enables cost calculation
trace.span({ name, type: "llm", model, provider: "google_ai" });
```

### 2. Linking opik-gemini Spans to Parent Trace

**Problem**: `trackGemini` creates independent traces by default.

**Solution**: Pass `parent` and `client` options to link spans to existing trace.

```typescript
const traceCtx = createAgentTrace({ name: "my-agent", ... });

// trackGemini with parent linking
const trackedGenAI = trackGemini(genAI, {
  parent: traceCtx.trace,      // Links span to parent
  client: traceCtx.client,     // Shares same Opik client
  generationName: "audio-transcription",
  traceMetadata: { tags: ["transcription"] },
});

const response = await trackedGenAI.models.generateContent({...});
await trackedGenAI.flush();  // Flush after each call
```

### 3. ADK Event Differentiation

ADK runner emits events with different structures:

| Event Type | Indicator | Action |
|------------|-----------|--------|
| Model response | `event.usageMetadata` exists | Create LLM span with usage |
| Tool request | `part.functionCall` in parts | End model span, then start tool span |
| Tool result | `part.functionResponse` in parts | End tool span |

### 4. Span Ordering: Model Before Tool

**Problem**: Model span and tool span created in same event iteration appear in wrong order in Opik UI (tool before model).

**Cause**: ADK emits `usageMetadata` and `functionCall` in the same event. If both spans are created/ended at nearly the same instant, Opik may display them incorrectly.

**Solution**: End model span BEFORE creating tool span. This ensures model span's end timestamp precedes tool span's start timestamp.

```typescript
let currentModelSpan: Span | null = null;
let pendingToolSpan: Span | null = null;

for await (const event of runner.runAsync({...})) {
  // Model call - create span when usageMetadata appears
  if (event.usageMetadata) {
    currentModelSpan = traceCtx.createLlmSpan({...});
    currentModelSpan.update({ usage: extractAdkUsage(event.usageMetadata) });
    // DON'T end yet - wait to see if there's a functionCall
  }

  // Process parts
  for (const part of event.content?.parts ?? []) {
    // Tool request - end model span FIRST, then create tool span
    if ("functionCall" in part) {
      if (currentModelSpan) {
        currentModelSpan.end();  // End model span before tool starts
        currentModelSpan = null;
      }
      pendingToolSpan = traceCtx.createToolSpan({
        name: "tool-call",
        input: { functionName: part.functionCall.name, args: part.functionCall.args },
      });
    }

    // Tool result
    if ("functionResponse" in part && pendingToolSpan) {
      pendingToolSpan.update({ output: part.functionResponse.response });
      pendingToolSpan.end();
      pendingToolSpan = null;
    }
  }

  // End model span if no functionCall in this event
  if (currentModelSpan && !pendingToolSpan) {
    currentModelSpan.end();
    currentModelSpan = null;
  }
}

// Clean up any remaining spans after loop
if (currentModelSpan) currentModelSpan.end();
if (pendingToolSpan) pendingToolSpan.end();
```

**Result**: Opik displays spans in correct chronological order:
```
model-call-1 (0.001s)
tool-call (0.02s)
```

### 5. Usage Metadata Extraction

ADK uses different field names than Opik:

```typescript
// ADK format
event.usageMetadata: {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

// Opik format
usage: {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
```

Use `extractAdkUsage()` helper to convert.

### 6. Singleton Opik Client

Use module-level singleton to avoid creating multiple clients:

```typescript
let opikClient: Opik | null = null;

export function getOpikClient(): Opik {
  if (!opikClient) {
    opikClient = new Opik({
      projectName: process.env.OPIK_PROJECT_NAME ?? "default",
    });
  }
  return opikClient;
}
```

### 7. Trace Context Pattern

Return context object with helpers for creating child spans:

```typescript
interface AgentTraceContext {
  client: Opik;
  trace: Trace;
  createLlmSpan(params): Span;
  createToolSpan(params): Span;
  end(): void;
  flush(): Promise<void>;
}
```

## Implementation Checklist

- [ ] Create parent trace with `name`, `input`, `tags`, `metadata`
- [ ] Include user ID in tags: `user:${userId}`
- [ ] Include relevant context in metadata (e.g., `currentInventory`)
- [ ] Use `opik-gemini` with `parent` option for direct LLM calls
- [ ] Create LLM spans when `event.usageMetadata` is present
- [ ] End model span BEFORE creating tool span (for correct ordering)
- [ ] Create tool spans on `functionCall` → `functionResponse` cycle
- [ ] Clean up any pending spans after event loop
- [ ] Use `provider: "google_ai"` for cost calculation
- [ ] Convert ADK usage format to Opik format
- [ ] Call `trace.end()` before `flush()`
- [ ] Always `await flush()` before returning response
- [ ] Handle errors with trace completion in catch block

## Files

- `opik-agent.ts` - Core utilities: `getOpikClient`, `createAgentTrace`, `extractAdkUsage`
- `index.ts` - Re-exports

## Example: Full Agent Trace

See `@/lib/agents/inventory/seq-agents-inventory-update-proposal.ts` for complete implementation.

## Debugging

1. Check Opik UI at `localhost:5173` (local) or Opik Cloud
2. Verify spans are nested under parent trace
3. Check token usage is populated (prompt_tokens, completion_tokens)
4. Check cost shows `<$X.XXX` (requires correct provider format)
5. If cost missing: verify `provider: "google_ai"` and `type: "llm"`
6. If spans appear in wrong order: ensure model span ends before tool span starts
