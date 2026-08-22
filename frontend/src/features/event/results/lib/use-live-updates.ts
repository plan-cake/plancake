import { useEffect, useRef, useState } from "react";

import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useRouter } from "next/navigation";

import { useToast } from "@/features/system-feedback";
import {
  LiveUpdateAddUpdateEvent,
  LiveUpdateEvent,
  LiveUpdateRemoveEvent,
} from "@/lib/utils/api/live-updates/types";

export function useLiveUpdates(
  eventCode: string,
  liveAddParticipant: (data: LiveUpdateAddUpdateEvent) => void,
  liveUpdateParticipant: (data: LiveUpdateAddUpdateEvent) => boolean,
  liveRemoveParticipant: (data: LiveUpdateRemoveEvent) => boolean,
) {
  const [liveUpdatesPaused, setLiveUpdatesPaused] = useState(false);
  const [liveUpdatesStopped, setliveUpdatesStopped] = useState(false);
  const router = useRouter();
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleToastRef = useRef<number | null>(null);

  const { addToast, removeToast } = useToast();

  // Handle idle timeout and reconnection
  useEffect(() => {
    if (liveUpdatesStopped) return;

    const resetTimeout = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(
        () => {
          setLiveUpdatesPaused(true);
          if (idleToastRef.current) return; // Already showing toast
          idleToastRef.current = addToast(
            "info",
            "You've been idle for a while. Interact with the page to resume live updates.",
            {
              isPersistent: true,
              title: "LIVE UPDATES PAUSED",
            },
          );
        },
        1000 * 60 * 10,
      ); // 10 minutes
    };

    const handleActivity = () => {
      if (liveUpdatesPaused) {
        router.refresh();
        setLiveUpdatesPaused(false);
        if (idleToastRef.current) {
          removeToast(idleToastRef.current);
          idleToastRef.current = null;
        }
      }
      resetTimeout();
    };

    resetTimeout();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [liveUpdatesStopped, liveUpdatesPaused, router, addToast, removeToast]);

  useEffect(() => {
    if (liveUpdatesStopped) return;
    if (liveUpdatesPaused) return;

    const ctrl = new AbortController();

    fetchEventSource(
      process.env.NEXT_PUBLIC_API_URL + `/event/get-updates/${eventCode}/`,
      {
        signal: ctrl.signal,
        credentials: "include",
        async onopen(response) {
          if (!response.ok) {
            if (response.status === 503) {
              const errorData = await response.json();
              addToast(
                "info",
                (errorData?.error?.general?.[0] ||
                  "Live updates are currently unavailable.") +
                  " Refresh the page to retry.",
                {
                  isPersistent: true,
                },
              );
            }
            setliveUpdatesStopped(true);
            ctrl.abort();
          }
        },
        onmessage(msg) {
          if (!msg.data) return; // Ignore pings

          const data = JSON.parse(msg.data) as LiveUpdateEvent;
          switch (data.action) {
            case "add":
              liveAddParticipant(data);
              break;
            case "update": {
              const updated = liveUpdateParticipant(data);
              const subject = data.is_you ? "You" : data.display_name;
              const pronoun = data.is_you ? "your" : "their";
              if (updated) {
                addToast("info", `${subject} updated ${pronoun} availability.`);
              }
              break;
            }
            case "remove":
              liveRemoveParticipant(data);
              break;
            case "event_edit":
              addToast(
                "info",
                `The event was edited, reload the page for updates.`,
                {
                  isPersistent: true,
                  title: "EVENT UPDATED",
                },
              );
              setliveUpdatesStopped(true);
              break;
            default:
              console.warn("Unknown action received in live update:", data);
              return;
          }
        },
        onerror(err) {
          setliveUpdatesStopped(true);
          addToast(
            "info",
            "Failed to connect to live updates. Refresh the page to retry.",
            {
              isPersistent: true,
            },
          );
          // Prevent automatic retry
          ctrl.abort();
          throw err;
        },
        openWhenHidden: true,
      },
    );

    return () => {
      ctrl.abort();
    };
  }, [
    addToast,
    eventCode,
    liveAddParticipant,
    liveUpdateParticipant,
    liveRemoveParticipant,
    liveUpdatesStopped,
    liveUpdatesPaused,
  ]);
}
