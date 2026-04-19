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
 * This function retrieves the current user's session information by checking for
 * the presence of an authentication cookie and then making a server-side API call
 * to validate the session and fetch the user's account details.
 *
 * It is wrapped inReact's `cache` function to optimize performance by caching the
 * result of the session retrieval, but it is designed to bypass caching when
 * necessary to ensure that it always returns the correct session data for each user.
 */
export const getSession = cache(async (): Promise<Session> => {
  const cookieString = await getAuthCookieString();
  console.log("Retrieved cookie string:", cookieString);

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
