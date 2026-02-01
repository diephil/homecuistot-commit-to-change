/**
 * Opik Agent Tracing Utilities
 *
 * Provides helpers for creating traces and spans for ADK agent monitoring.
 */

import { Opik, type Trace, type Span } from "opik";

let opikClient: Opik | null = null;

export function getOpikClient(): Opik {
  if (!opikClient) {
    opikClient = new Opik({
      projectName: process.env.OPIK_PROJECT_NAME ?? "homecuistot",
    });
  }
  return opikClient;
}

interface CreateAgentTraceParams {
  name: string;
  input: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface AgentTraceContext {
  client: Opik;
  trace: Trace;
  createLlmSpan(params: {
    name: string;
    input: Record<string, unknown>;
    model: string;
  }): Span;
  createToolSpan(params: {
    name: string;
    input: Record<string, unknown>;
  }): Span;
  end(): void;
  flush(): Promise<void>;
}

export function createAgentTrace(
  params: CreateAgentTraceParams
): AgentTraceContext {
  const client = getOpikClient();
  const trace = client.trace({
    name: params.name,
    input: params.input,
    metadata: params.metadata,
    tags: params.tags,
  });

  return {
    client,
    trace,
    createLlmSpan: ({ name, input, model }) =>
      trace.span({ name, type: "llm", input, model, provider: "google_ai" }),
    createToolSpan: ({ name, input }) =>
      trace.span({ name, type: "tool", input }),
    end: () => trace.end(),
    flush: () => client.flush(),
  };
}

export function extractAdkUsage(usageMetadata?: {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}) {
  if (!usageMetadata)
    return { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  return {
    prompt_tokens: usageMetadata.promptTokenCount ?? 0,
    completion_tokens: usageMetadata.candidatesTokenCount ?? 0,
    total_tokens: usageMetadata.totalTokenCount ?? 0,
  };
}
