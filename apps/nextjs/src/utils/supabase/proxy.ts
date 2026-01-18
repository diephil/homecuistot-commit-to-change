import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type ProxyOptions = { mode: "next" } | { mode: "redirect"; url: string };

/**
 * Creates Supabase client for middleware/route handlers.
 * - mode: "next" — for middleware (continues request)
 * - mode: "redirect" — for auth callbacks (redirects after setting cookies)
 *
 * Returns { supabase, getResponse } - call getResponse() AFTER async operations
 */
export function createClient(
  request: NextRequest,
  options: ProxyOptions = { mode: "next" },
) {
  // Mutable container so setAll can update the response
  const state = {
    response:
      options.mode === "redirect"
        ? NextResponse.redirect(options.url)
        : NextResponse.next({ request }),
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Recreate response to include updated cookies
          state.response =
            options.mode === "redirect"
              ? NextResponse.redirect(options.url)
              : NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            state.response.cookies.set(name, value, cookieOptions),
          );
        },
      },
    },
  );

  return { supabase, getResponse: () => state.response };
}
