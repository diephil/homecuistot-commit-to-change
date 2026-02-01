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

/**
 * Trace parameters matching Opik's trace interface
 */
interface CreateAgentTraceParams {
  name: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
  startTime?: Date;
  endTime?: Date;
  threadId?: string;
}

/**
 * Base span parameters matching Opik's SpanData interface
 */
interface BaseSpanParams {
  name: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
  usage?: Record<string, number>;
  startTime?: Date;
  endTime?: Date;
  parentSpanId?: string;
}

/**
 * LLM span parameters with required model field
 */
interface LlmSpanParams extends BaseSpanParams {
  model: string;
  provider?: string;
}

/**
 * Tool span parameters
 */
interface ToolSpanParams extends BaseSpanParams {}

export interface AgentTraceContext {
  client: Opik;
  trace: Trace;
  createLlmSpan(params: LlmSpanParams): Span;
  createToolSpan(params: ToolSpanParams): Span;
  end(): void;
  flush(): Promise<void>;
}

export function createAgentTrace(
  params: CreateAgentTraceParams
): AgentTraceContext {
  const client = getOpikClient();
  const trace = client.trace(params);

  return {
    client,
    trace,
    createLlmSpan: ({ model, provider = "google_ai", ...rest }) =>
      trace.span({ ...rest, type: "llm", model, provider }),
    createToolSpan: (params) =>
      trace.span({ ...params, type: "tool" }),
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
