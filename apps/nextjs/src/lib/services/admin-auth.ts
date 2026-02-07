import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function getAdminIds(): string[] {
  return process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || [];
}

/**
 * Check if the current authenticated user is an admin.
 * Lightweight boolean check — no NextResponse coupling.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;
  return getAdminIds().includes(user.id);
}

type AdminAuthSuccess = {
  user: { id: string; email?: string };
};

type UserAuthSuccess = {
  user: { id: string; email?: string };
};

type UserAuthResult =
  | { ok: true; data: UserAuthSuccess }
  | { ok: false; response: NextResponse };

/**
 * Verify the current request is from any authenticated user.
 * Lighter than requireAdmin — no admin ID check.
 */
export async function requireUser(): Promise<UserAuthResult> {
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

  return {
    ok: true,
    data: { user: { id: user.id, email: user.email } },
  };
}

type AdminAuthResult =
  | { ok: true; data: AdminAuthSuccess }
  | { ok: false; response: NextResponse };

/**
 * Verify the current request is from an authenticated admin user.
 * Returns a typed result with NextResponse for API route handlers.
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

  if (!getAdminIds().includes(user.id)) {
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
