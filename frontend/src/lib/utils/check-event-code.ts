import { notFound, redirect } from "next/navigation";

import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import handleErrorResponse from "@/lib/utils/api/handle-api-error";
import { serverGet } from "@/lib/utils/api/server-fetch";

/**
 * Checks if the provided event URL code is the true code for the event. If not, it will
 * redirect the user to the correct URL.
 *
 * If the event does not exist, it will show the 404 page.
 *
 * @param eventCode The URL code of the event the user is trying to navigate to.
 * @param redirectUrlBuilder A function that builds the redirect URL given the true code.
 */
export default async function checkEventCode(
  eventCode: string,
  redirectUrlBuilder: (trueCode: string) => string,
) {
  // Check if this code is the true code, if not then redirect.
  let trueCode: string | null = null;
  try {
    trueCode = (
      await serverGet(ROUTES.event.getTrueCode, {
        event_code: eventCode,
      })
    ).true_code;
  } catch (e) {
    console.log(e);
    const error = e as ApiErrorResponse;
    if (error.status === 404) {
      notFound();
    } else {
      handleErrorResponse(error.status, error.data);
    }
  }
  if (eventCode !== trueCode) {
    // Redirect to the true code page
    redirect(redirectUrlBuilder(trueCode!));
  }
}
