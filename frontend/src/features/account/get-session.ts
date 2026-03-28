"use server";

import { redirect } from "next/navigation";

import { AccountDetails } from "@/features/account/type";
import { getAuthCookieString } from "@/lib/utils/api/cookie-utils";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { serverGet } from "@/lib/utils/api/server-fetch";

export async function getSession(): Promise<AccountDetails | null> {
  const cookieString = await getAuthCookieString();

  // If no account session cookies is present, the user is not logged in, so we
  // can redirect them to the login page immediately without making an API call.
  if (!cookieString.includes("account_sess_token")) {
    redirect("/login");
  }

  // Otherwise fetch user info. If the session cookie is invalid/expired, the API
  // will return a 401/403 error, in which case we will return null.
  try {
    const data = await serverGet(ROUTES.auth.checkAccountAuth);
    return {
      email: data.email,
      defaultName: data.default_display_name,
    };
  } catch (e) {
    const error = e as ApiErrorResponse;

    if (error.status === 401 || error.status === 403) {
      return null;
    }

    throw error;
  }
}
