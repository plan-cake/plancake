"use client";

import { useEffect } from "react";

/**
 * Replaces the event code in the browser URL with the event's true code without reloading
 * or refetching the page.
 *
 * This keeps the address bar, shared links, and history on one canonical URL.
 *
 * @param urlCode The event code as it appears in the current URL.
 * @param trueCode The event's true code, from the event details.
 */
export default function SyncEventCodeUrl({
  urlCode,
  trueCode,
}: {
  urlCode: string;
  trueCode: string;
}) {
  useEffect(() => {
    if (urlCode === trueCode) return;

    const { pathname, search, hash } = window.location;
    const segments = pathname.split("/");
    // The event code is the first path segment
    if (decodeURIComponent(segments[1] ?? "") !== urlCode) return;
    segments[1] = encodeURIComponent(trueCode);

    // Next.js syncs native replaceState with its router, so this doesn't refetch
    window.history.replaceState(null, "", segments.join("/") + search + hash);
  }, [urlCode, trueCode]);

  return null;
}
