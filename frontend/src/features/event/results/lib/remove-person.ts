"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { serverPost } from "@/lib/utils/api/server-fetch";

export async function removePerson(
  eventCode: string,
  person: string,
  isCreator: boolean,
) {
  try {
    if (isCreator) {
      await serverPost(ROUTES.availability.remove, {
        event_code: eventCode,
        display_name: person,
      }, { cache: "no-store" });
    } else {
      await serverPost(ROUTES.availability.removeSelf, {
        event_code: eventCode,
      }, { cache: "no-store" });
    }
    revalidatePath(`/${eventCode}`);
    return { success: true };
  } catch (e) {
    const error = e as ApiErrorResponse;
    return { success: false, error: error.formattedMessage };
  }
}
