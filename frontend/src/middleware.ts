import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/settings", "/guest-import"];

export function middleware(request: NextRequest) {
  // Clone the request headers and inject the exact pathname into a custom header.
  // This allows server-side code (like getSession()) to determine the user's
  // intended destination.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const path = request.nextUrl.pathname;
  const hasAccountSessToken = request.cookies.has("account_sess_token");

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );

  // If the user is not logged in and tries to access a protected route (like
  // settings), redirect them to the login page. A callbackUrl is included so users
  // can be redirected back after logging in.
  if (!hasAccountSessToken && isProtectedRoute) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    loginUrl.searchParams.set("unauthorized", "true");
    response = NextResponse.redirect(loginUrl);
  }

  if (process.env.NEXT_PUBLIC_DEBUG !== "true") {
    const cookieNames = ["account_sess_token", "guest_sess_token"];
    const existingCookies = cookieNames.filter((name) =>
      request.cookies.has(name),
    );

    // Safari's ITP (Intelligent Tracking Prevention) limits the lifetime of cookies set
    // by direct requests to our API to 7 days. To combat this, we extend cookie lifetimes
    // with Next.js to a full year on every request. In oversimplified terms, the frontend
    // is on the main domain which is not subject to the same restrictions.

    // This solution is a temporary fix until we redo our client-side API requests to use
    // Server Actions, which will route everything through the frontend and bypass the
    // restriction.

    // This won't allow authentication for expired sessions, it only ensures that valid
    // sessions are not prematurely expired. The source of truth is handled by the backend
    // and database.

    if (process.env.COOKIE_DOMAIN) {
      existingCookies.forEach((name) => {
        const cookieValue = request.cookies.get(name)?.value;
        if (cookieValue) {
          response.cookies.set({
            name: name,
            value: cookieValue,
            domain: process.env.COOKIE_DOMAIN,
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 365, // 1 year
          });
        }
      });
    }

    // We defensively try to DELETE the Host-Only (legacy) cookies on every request.
    // By setting Max-Age=0 and omitting the Domain attribute, we target the Host-Only version.
    // The valid Domain cookie (.example.com) will remain untouched because the browser
    // sees them as different scopes.

    // This logic can only be removed AFTER February 15, 2027 (one year from now) just
    // to be safe, since long session cookies have a 1 year lifetime

    existingCookies.forEach((name) => {
      // Because we initialized `response` with NextResponse.next() above,
      // we can safely append headers to it here. If response was reassigned
      // to a redirect, appending headers still works.
      response.headers.append(
        "Set-Cookie",
        `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
      );
    });
  }

  return response;
}

export const config = {
  // Run on all pages, but skip static files and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
