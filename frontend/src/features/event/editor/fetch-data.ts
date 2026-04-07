import { cache } from "react";

import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import handleErrorResponse from "@/lib/utils/api/handle-api-error";
import { serverGet } from "@/lib/utils/api/server-fetch";
import { EventDetails } from "@/lib/utils/api/types";

export const getCachedEventDetails = cache(
  async (eventCode: string) => {
    return await fetchEventDetails(eventCode);
  },
);

async function fetchEventDetails(
  eventCode: string,
): Promise<EventDetails> {
  try {
    return await serverGet(ROUTES.event.getDetails, { event_code: eventCode }, { cache: "no-store" });
  } catch (e) {
    const error = e as ApiErrorResponse;
    handleErrorResponse(error.status, error.data);
  }
}
