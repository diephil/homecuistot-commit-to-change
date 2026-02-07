const OPIK_URL = process.env.OPIK_URL_OVERRIDE || "http://localhost:5173/api";
const OPIK_PROJECT_NAME =
  process.env.OPIK_PROJECT_NAME || "homecuistot-hackathon";
const OPIK_API_KEY = process.env.OPIK_API_KEY;
const OPIK_WORKSPACE = process.env.OPIK_WORKSPACE;

export class OpikApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "OpikApiError";
  }
}

export interface OpikSpan {
  id: string;
  trace_id: string;
  name: string;
  tags: string[];
  metadata?: {
    totalUnrecognized?: number;
    unrecognized?: string[];
  };
  created_at?: string;
}

function getOpikHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Production (Opik Cloud): API key + workspace header
  // NOTE: authorization value has NO "Bearer " prefix
  if (OPIK_API_KEY) {
    headers["authorization"] = OPIK_API_KEY;
  }
  if (OPIK_WORKSPACE) {
    headers["Comet-Workspace"] = OPIK_WORKSPACE;
  }

  return headers;
}

/**
 * Parse Opik search response into an array of spans.
 * Handles: { content: [...] }, { spans: [...] }, { data: [...] },
 * single object with id, or NDJSON (newline-delimited JSON).
 */
function parseSearchResponse(text: string): OpikSpan[] {
  try {
    const json = JSON.parse(text);
    const items =
      json?.content ?? json?.spans ?? json?.data ?? (json?.id ? [json] : null);

    if (Array.isArray(items)) return items as OpikSpan[];
    if (json?.id) return [json as OpikSpan];
    return [];
  } catch {
    // NDJSON: parse each line as a separate JSON object
    return text
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line) as OpikSpan;
        } catch {
          return null;
        }
      })
      .filter((span): span is OpikSpan => span !== null && !!span.id);
  }
}

/**
 * Search for spans with `unrecognized_items` tag.
 * Reviewed spans have this tag swapped to `promotion_reviewed`,
 * so only unprocessed spans match.
 *
 * Handles Opik search index eventual consistency: fetches a batch
 * of candidates, then verifies each via GET-by-ID (authoritative)
 * to confirm the span still has `unrecognized_items`.
 */
export async function getNextUnprocessedSpan(): Promise<OpikSpan | null> {
  const response = await fetch(`${OPIK_URL}/v1/private/spans/search`, {
    method: "POST",
    headers: getOpikHeaders(),
    body: JSON.stringify({
      project_name: OPIK_PROJECT_NAME,
      filters: [
        {
          field: "tags",
          operator: "contains",
          value: "unrecognized_items",
        },
      ],
      limit: 50,
      sort_by: [{ field: "created_at", direction: "desc" }],
    }),
  });

  if (!response.ok) {
    throw new OpikApiError(
      response.status,
      `Opik search spans failed: ${response.status} ${response.statusText}`,
    );
  }

  const text = await response.text();
  const candidates = parseSearchResponse(text);

  for (const candidate of candidates) {
    const fresh = await getSpanById({ spanId: candidate.id });
    if (fresh.tags?.includes("unrecognized_items")) {
      return fresh;
    }
  }

  return null;
}

/**
 * Return up to `limit` verified unprocessed spans.
 * Over-fetches (limit 50) from Opik search to account for stale index
 * entries, then verifies each via GET-by-ID.
 */
export async function getNextUnprocessedSpans(params: {
  limit?: number;
}): Promise<OpikSpan[]> {
  const limit = params.limit ?? 5;

  const response = await fetch(`${OPIK_URL}/v1/private/spans/search`, {
    method: "POST",
    headers: getOpikHeaders(),
    body: JSON.stringify({
      project_name: OPIK_PROJECT_NAME,
      filters: [
        {
          field: "tags",
          operator: "contains",
          value: "unrecognized_items",
        },
      ],
      limit: 50,
      sort_by: [{ field: "created_at", direction: "desc" }],
    }),
  });

  if (!response.ok) {
    throw new OpikApiError(
      response.status,
      `Opik search spans failed: ${response.status} ${response.statusText}`,
    );
  }

  const text = await response.text();
  const candidates = parseSearchResponse(text);

  const verified: OpikSpan[] = [];
  for (const candidate of candidates) {
    if (verified.length >= limit) break;

    const fresh = await getSpanById({ spanId: candidate.id });
    if (fresh.tags?.includes("unrecognized_items")) {
      verified.push(fresh);
    }
  }

  return verified;
}

/**
 * Get a span by ID from Opik.
 * Used to re-fetch current state (tags, trace_id) before PATCH.
 */
export async function getSpanById(params: {
  spanId: string;
}): Promise<OpikSpan> {
  const response = await fetch(
    `${OPIK_URL}/v1/private/spans/${params.spanId}`,
    {
      method: "GET",
      headers: getOpikHeaders(),
    },
  );

  if (!response.ok) {
    throw new OpikApiError(
      response.status,
      `Opik get span failed: ${response.status} (spanId: ${params.spanId})`,
    );
  }

  return await response.json();
}

/**
 * Mark a span as reviewed by swapping `unrecognized_items` → `promotion_reviewed`.
 *
 * Uses GET-then-PATCH pattern: re-fetches the span first to get
 * current tags, then replaces the tag. Never uses stale tags from
 * the initial search. Metadata stays untouched.
 */
export async function markSpanAsReviewed(params: {
  spanId: string;
}): Promise<boolean> {
  // Step 1: Re-fetch span to get current state
  const span = await getSpanById({ spanId: params.spanId });

  // Step 2: Swap unrecognized_items → promotion_reviewed
  const currentTags = span.tags || [];
  if (!currentTags.includes("unrecognized_items")) return true; // already swapped

  const newTags = currentTags
    .filter((tag) => tag !== "unrecognized_items")
    .concat("promotion_reviewed");

  // Step 3: PATCH with merged tags (project_name required to avoid 409)
  const response = await fetch(
    `${OPIK_URL}/v1/private/spans/${params.spanId}`,
    {
      method: "PATCH",
      headers: getOpikHeaders(),
      body: JSON.stringify({
        project_name: OPIK_PROJECT_NAME,
        trace_id: span.trace_id,
        tags: newTags,
      }),
    },
  );

  if (!response.ok) {
    throw new OpikApiError(
      response.status,
      `Opik PATCH span failed: ${response.status} ${response.statusText} (spanId: ${params.spanId})`,
    );
  }

  return true;
}
