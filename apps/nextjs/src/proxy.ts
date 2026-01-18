import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/proxy";

const PROTECTED_ROUTES = ["/onboarding"];
const AUTH_ROUTES = ["/login"];

export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users from protected routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users from auth routes to onboarding
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && user) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return getResponse();
}

export const config = {
  matcher: ["/login", "/onboarding/:path*"],
};
