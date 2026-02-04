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
 * Search for spans with `unrecognized_items` tag but NOT `promotion_reviewed`.
 * Returns the most recent unprocessed span or null if none found.
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
        {
          field: "tags",
          operator: "not_contains",
          value: "promotion_reviewed",
        },
      ],
      limit: 1,
      sort_by: [{ field: "created_at", direction: "desc" }],
    }),
  });

  if (!response.ok) {
    throw new OpikApiError(
      response.status,
      `Opik search spans failed: ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();

  // Opik search returns different formats depending on version:
  // - Wrapped: { data: [span, ...], total: N }
  // - Direct: span object with `id` field (when limit=1)
  if (Array.isArray(json?.data)) {
    return (json.data[0] as OpikSpan) ?? null;
  }
  if (json?.id) {
    return json as OpikSpan;
  }
  return null;
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
 * Mark a span as reviewed by adding promotion_reviewed tag.
 *
 * Uses GET-then-PATCH pattern: re-fetches the span first to get
 * current tags, then appends promotion_reviewed. Never uses stale
 * tags from the initial search.
 */
export async function markSpanAsReviewed(params: {
  spanId: string;
}): Promise<boolean> {
  // Step 1: Re-fetch span to get current state
  const span = await getSpanById({ spanId: params.spanId });

  // Step 2: Append promotion_reviewed to current tags
  const currentTags = span.tags || [];
  if (currentTags.includes("promotion_reviewed")) return true; // already tagged

  const newTags = [...currentTags, "promotion_reviewed"];

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
