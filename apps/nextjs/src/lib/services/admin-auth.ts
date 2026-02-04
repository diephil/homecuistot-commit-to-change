import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type AdminAuthSuccess = {
  user: { id: string; email?: string };
};

type AdminAuthResult =
  | { ok: true; data: AdminAuthSuccess }
  | { ok: false; response: NextResponse };

/**
 * Verify the current request is from an authenticated admin user.
 *
 * Checks session via Supabase, then validates user.id against
 * ADMIN_USER_IDS env var (comma-separated).
 *
 * @returns `{ ok: true, data: { user } }` or `{ ok: false, response: NextResponse(401) }`
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  const adminIds =
    process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || [];

  if (!adminIds.includes(user.id)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true,
    data: { user: { id: user.id, email: user.email } },
  };
}
