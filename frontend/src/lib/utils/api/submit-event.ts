import { EventRange } from "@/core/event/types";
import { EventEditorType } from "@/features/event/editor/types";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { EventCode } from "@/lib/utils/api/types";
import { timeslotToISOString } from "@/lib/utils/date-time-format";

export type EventSubmitData = {
  title: string;
  code: string;
  eventRange: EventRange;
  timeslots: Date[];
};

type EventSubmitJsonBody = {
  title: string;
  duration?: number;
  time_zone: string;
  timeslots: string[];
  custom_code?: string;
  event_code?: string;
};

export default async function submitEvent(
  data: EventSubmitData,
  type: EventEditorType,
  eventType: "specific" | "weekday",
  onSuccess: (code: string) => void,
  handleError: (field: string, message: string) => void,
): Promise<boolean> {
  let apiRoute;

  if (eventType === "specific") {
    apiRoute =
      type === "new" ? ROUTES.event.dateCreate : ROUTES.event.dateEdit;
  } else {
    apiRoute =
      type === "new" ? ROUTES.event.weekCreate : ROUTES.event.weekEdit;
  }

  if (data.timeslots.length === 0) {
    handleError("toast", "No valid timeslots generated for this range.");
    return false;
  }

  const jsonBody: EventSubmitJsonBody = {
    title: data.title,
    time_zone: data.eventRange.timezone,
    timeslots: data.timeslots.map((d) =>
      timeslotToISOString(d, data.eventRange.timezone, eventType),
    ),
  };

  // only include duration if set
  if (data.eventRange.duration && data.eventRange.duration > 0) {
    jsonBody.duration = data.eventRange.duration;
  }

  if (type === "new" && data.code) {
    jsonBody.custom_code = data.code;
  } else if (type === "edit") {
    jsonBody.event_code = data.code;
  }

  try {
    const resData = await clientPost(apiRoute, jsonBody);
    if (type === "new") {
      const code = (resData as EventCode).event_code;
      onSuccess(code);
      return true;
    } else {
      onSuccess(data.code);
      return true;
    }
  } catch (e) {
    const error = e as ApiErrorResponse;
    if (error.rateLimited) {
      handleError("rate_limit", error.formattedMessage);
    } else {
      handleError("toast", error.formattedMessage);
    }
    return false;
  }
}
