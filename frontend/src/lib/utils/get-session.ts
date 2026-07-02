"use server";

import { cache } from "react";

import { AccountDetails } from "@/features/account/type";
import { getAuthCookieString } from "@/lib/utils/api/cookie-utils";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { serverGet } from "@/lib/utils/api/server-fetch";

export type Session =
  | { isLoggedIn: true; user: AccountDetails }
  | { isLoggedIn: false; user: null };

/**
 * Retrieves the current user's session information by checking for the presence
 * of an authentication cookie and validating the session against the server.
 *
 * This function is memoized using React's `cache()` to optimize performance by
 * preventing redundant network requests during a single page render. It also
 * uses `cache: "no-store"` for the underlying fetch request to ensure that session
 * data is never shared across different requests or users, guaranteeing fresh
 * authentication checks.
 */
export const getSession = cache(async (): Promise<Session> => {
  const cookieString = await getAuthCookieString();
  if (!cookieString.includes("account_sess_token")) {
    return { isLoggedIn: false, user: null };
  }

  try {
    const data = await serverGet(ROUTES.auth.checkAccountAuth, undefined, {
      // By default, Next.js may cache the result of this function and serve it to
      // multiple users, which is a problem because this function returns
      // user-specific data. By setting cache: "no-store", we ensure that Next.js
      // does not cache the result and instead calls this function on every request,
      // allowing it to return the correct session data for each user.
      cache: "no-store",
    });
    return {
      isLoggedIn: true,
      user: {
        email: data.email,
        defaultName: data.default_display_name,
      },
    };
  } catch (e) {
    const error = e as ApiErrorResponse;

    if (error.status === 401 || error.status === 403) {
      return { isLoggedIn: false, user: null };
    }

    throw error;
  }
});
