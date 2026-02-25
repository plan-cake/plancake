"use server";

import { revalidatePath } from "next/cache";

import { MESSAGES } from "@/lib/messages";
import { getAuthCookieString } from "@/lib/utils/api/cookie-utils";

export async function deleteEvent(eventCode: string) {
  const authCookies = await getAuthCookieString();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${baseUrl}/event/delete/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookies,
      },
      cache: "no-store",
      body: JSON.stringify({ event_code: eventCode }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: response.statusText,
      };
    }

    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: MESSAGES.ERROR_GENERIC };
  }
}