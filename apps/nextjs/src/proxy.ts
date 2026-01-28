import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Protected and public routes
const protectedRoutes = ["/app", "/admin"];
const publicRoutes = ["/login", "/"];

export default async function proxy(request: NextRequest): Promise<NextResponse> {
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

  // Admin route protection: check user role
  if (path.startsWith("/admin")) {
    const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];

    if (!user || !adminIds.includes(user.id)) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

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
     * - auth callback
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/callback).*)",
  ],
};
