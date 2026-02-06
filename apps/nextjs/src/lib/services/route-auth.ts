import { type User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";

// === Types ===

type RouteParams = Promise<Record<string, string>>;

export type WithAuthContext = {
  user: User;
  userId: string;
  db: ReturnType<typeof createUserDb>;
  request: NextRequest;
  params: RouteParams;
};

export type WithUserContext = {
  user: User;
  request: NextRequest;
  params: RouteParams;
};

/**
 * HOF wrapper for routes that need full auth + RLS-scoped DB client.
 * Validates user + session, decodes JWT, creates RLS-aware DB transaction wrapper.
 */
export function withAuth(
  handler: (ctx: WithAuthContext) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    segmentConfig?: { params: RouteParams },
  ): Promise<NextResponse> => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    return handler({
      user,
      userId: user.id,
      db,
      request,
      params: segmentConfig?.params ?? Promise.resolve({}),
    });
  };
}

/**
 * HOF wrapper for routes that only need user verification (no DB client).
 * Use for Gemini/LLM processing routes, read-only endpoints, etc.
 */
export function withUser(
  handler: (ctx: WithUserContext) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    segmentConfig?: { params: RouteParams },
  ): Promise<NextResponse> => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler({
      user,
      request,
      params: segmentConfig?.params ?? Promise.resolve({}),
    });
  };
}
