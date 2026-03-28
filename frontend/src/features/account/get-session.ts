"use server";

import { cache } from "react";

import { AccountDetails } from "@/features/account/type";
import { getAuthCookieString } from "@/lib/utils/api/cookie-utils";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { serverGet } from "@/lib/utils/api/server-fetch";

// 2. Wrap your entire async function in cache()
export const getSession = cache(async (): Promise<AccountDetails | null> => {
  const cookieString = await getAuthCookieString();
  console.log("Retrieved cookie string:", cookieString);

  if (!cookieString.includes("account_sess_token")) {
    return null;
  }

  try {
    const data = await serverGet(ROUTES.auth.checkAccountAuth, undefined, {
      // Keep this! It stops Next.js from aggressively caching the
      // result across DIFFERENT users/requests.
      cache: "no-store",
    });
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
});
