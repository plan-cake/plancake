import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (process.env.NEXT_PUBLIC_DEBUG !== "true") {
    const cookieNames = ["account_sess_token", "guest_sess_token"];
    const hasLegacyCookies = cookieNames.some((name) =>
      request.cookies.has(name)
    );

    // If the user has auth cookies...
    if (hasLegacyCookies) {

      // We defensively try to DELETE the Host-Only (legacy) cookies on every request.
      // By setting Max-Age=0 and omitting the Domain attribute, we target the Host-Only version.
      // The valid Domain cookie (.example.com) will remain untouched because the browser
      // sees them as different scopes.

      // This logic can only be removed AFTER February 15, 2027 (one year from now) just
      // to be safe, since long session cookies have a 1 year lifetime

      cookieNames.forEach((name) => {
        response.headers.append(
          "Set-Cookie",
          `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
        );
      });
    }
  }

  return response;
}

export const config = {
  // Run on all pages, but skip static files and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};