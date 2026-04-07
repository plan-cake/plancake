"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { serverPost } from "@/lib/utils/api/server-fetch";

export async function deleteEvent(eventCode: string) {
  try {
    await serverPost(ROUTES.event.delete, { event_code: eventCode }, { cache: "no-store" });
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (e) {
    const error = e as ApiErrorResponse;
    return { success: false, error: error.formattedMessage };
  }
}