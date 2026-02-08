import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { oauthRateLimiter, getClientIp } from "@/lib/ratelimit";

// Protected and public routes
const protectedRoutes = ["/app", "/admin"];
const publicRoutes = ["/login", "/"];

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  // Rate limit OAuth callback endpoint
  if (request.nextUrl.pathname === "/auth/callback") {
    const ip = getClientIp(request.headers);

    try {
      const { success, remaining, reset } = await oauthRateLimiter.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error: "Too many authentication attempts. Please try again later.",
            remaining: 0,
            resetAt: new Date(reset).toISOString(),
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
              "X-RateLimit-Limit": "10",
              "X-RateLimit-Remaining": String(remaining),
              "X-RateLimit-Reset": String(reset),
            },
          }
        );
      }
    } catch (error) {
      console.error("Rate limiter error:", error);
      // Fail open: allow request if rate limiter fails
    }
  }

  // Add pathname header for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verify user authenticity
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) => path === route);

  // Redirect to /login if user is not authenticated on protected routes
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // DEMO: admin routes open to all authenticated users for project review
  // if (path.startsWith("/admin")) {
  //   const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
  //   if (!user || !adminIds.includes(user.id)) {
  //     return NextResponse.rewrite(new URL('/404', request.url));
  //   }
  // }

  // Redirect to /app if user is authenticated on public routes
  if (isPublicRoute && user && path === "/login") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * NOTE: Now INCLUDES /auth/callback for rate limiting
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
