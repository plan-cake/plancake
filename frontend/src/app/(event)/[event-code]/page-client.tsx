"use client";

import { useEffect, useRef, useState } from "react";

import { fetchEventSource } from "@microsoft/fetch-event-source";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { PencilIcon, ShareIcon, SquarePenIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import CopyToastButton from "@/components/copy-toast-button";
import KebabMenu from "@/components/kebab-menu";
import { EventInformation } from "@/core/event/types";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import ScheduleGrid from "@/features/event/grid/grid";
import AttendeesPanel from "@/features/event/results/attendee-panel/panel";
import { getResultBanners } from "@/features/event/results/banners";
import {
  ResultsProvider,
  useResultsContext,
} from "@/features/event/results/context";
import DisplaySettings from "@/features/event/results/display-settings";
import ResultsDrawer from "@/features/event/results/drawer";
import { ResultsInformation } from "@/features/event/results/lib/types";
import HeaderSpacer from "@/features/header/components/header-spacer";
import { useHeaderSize } from "@/features/header/context";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { LiveUpdateEvent } from "@/lib/utils/api/live-updates/types";
import { cn } from "@/lib/utils/classname";

export default function ClientPage({
  eventData,
  initialAvailabilityData,
}: {
  eventData: EventInformation;
  initialAvailabilityData: ResultsInformation;
}) {
  return (
    <ResultsProvider initialData={initialAvailabilityData}>
      <EventResults eventData={eventData} />
    </ResultsProvider>
  );
}

type HeaderButtonStyle = "frosted glass inset" | "secondary";

function EventResults({ eventData }: { eventData: EventInformation }) {
  const {
    hoveredSlot,
    participants,
    availabilities,
    filteredAvailabilities,
    gridNumParticipants,
    setHoveredSlot,
    timezone,
    setTimezone,
    currentUser,
    isCreator,
    liveAddParticipant,
    liveUpdateParticipant,
    liveRemoveParticipant,
  } = useResultsContext();

  const {
    customCode: eventCode,
    title: eventTitle,
    eventRange,
    timeslots,
  } = eventData;

  const { addToast, removeToast } = useToast();

  /* LIVE UPDATES */
  const [liveUpdatesPaused, setLiveUpdatesPaused] = useState(false);
  const [liveUpdatesStopped, setliveUpdatesStopped] = useState(false);
  const router = useRouter();
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleToastRef = useRef<number | null>(null);

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
              addToast(
                "error",
                "Cannot connect to live updates, the server is busy. Please try again later.",
              );
            }
            setliveUpdatesStopped(true);
            ctrl.abort();
          }
        },
        onmessage(msg) {
          const data = JSON.parse(msg.data) as LiveUpdateEvent;
          switch (data.action) {
            case "add":
              liveAddParticipant(data);
              break;
            case "update":
              const result = liveUpdateParticipant(data);
              const subject = data.is_you ? "You" : data.display_name;
              const pronoun = data.is_you ? "your" : "their";
              if (result.slotsUpdated) {
                addToast("info", `${subject} updated ${pronoun} availability.`);
              }
              break;
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

  /* TIMEZONE HANDLING */
  const handleTZChange = (newTZ: string | number) => {
    setTimezone(newTZ.toString());
  };

  /* MOBILE DRAWER SPACING */
  const [drawerSnap, setDrawerSnap] = useState<number | string | null>(0.22);
  const getSpacerHeight = () => {
    const defaultHeight = "25svh";
    if (!drawerSnap) return defaultHeight;

    if (typeof drawerSnap === "number") {
      return `calc(${drawerSnap * 100}svh + 20px)`;
    }

    return drawerSnap;
  };

  /* HEADER SPACING */
  const { topMarginClass } = useHeaderSize();

  /* BANNERS */
  const banners = getResultBanners(
    availabilities,
    participants,
    timeslots,
    eventRange.type === "weekday",
    currentUser !== null,
  );

  const bannerElement = () => {
    const variants: Variants = {
      enter: {
        height: "auto",
        marginBottom: "1rem",
        opacity: 1,
        x: "0%",
        transition: {
          // Delayed extra to match with the exit animation of the banner
          height: { duration: 0.3, delay: 0.4, ease: "easeOut" },
          marginBottom: { duration: 0.3, delay: 0.4, ease: "easeOut" },
          opacity: { duration: 0.4, delay: 0.7, ease: "backOut" },
          x: { duration: 0.4, delay: 0.7, ease: "backOut" },
        },
      },
      exit: {
        height: 0,
        marginBottom: 0,
        opacity: 0,
        x: "-2rem",
        transition: {
          opacity: { duration: 0.4, ease: "backIn" },
          x: { duration: 0.4, ease: "backIn" },
          height: { duration: 0.3, delay: 0.4, ease: "easeOut" },
          marginBottom: { duration: 0.3, delay: 0.4, ease: "easeOut" },
        },
      },
    };

    return (
      <AnimatePresence initial={false} mode="sync">
        {banners && (
          <motion.div
            key={banners?.props.children}
            initial={{
              height: 0,
              opacity: 0,
              x: "5%",
              marginBottom: 0,
            }}
            animate="enter"
            exit="exit"
            variants={variants}
          >
            {banners}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  /* BUTTONS */
  const paintingButton = (
    <LinkButton
      buttonStyle="primary"
      icon={<SquarePenIcon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      href={`/${eventCode}/painting`}
    />
  );

  const editButton = (buttonStyle: HeaderButtonStyle) => (
    <LinkButton
      buttonStyle={buttonStyle}
      icon={<PencilIcon />}
      label="Edit Event"
      href={`/${eventCode}/edit`}
    />
  );

  const shareButton = (buttonStyle: HeaderButtonStyle) => {
    // Check if sharing is supported
    if (typeof navigator !== "undefined" && !navigator.share) {
      /* This condition means it will be rendered until mounted on the client, then it
       * disappears if not supported. There are more browsers that support the API than
       * don't, so this is a better trade-off than having the button appear after initial
       * mount on supported browsers.
       *
       * This also won't be visible on mobile anyway, since the buttons are hidden in the
       * kebab menu.
       */
      return null;
    } else {
      return (
        <ActionButton
          buttonStyle={buttonStyle}
          icon={<ShareIcon />}
          label="Share Event"
          onClick={async () => {
            try {
              await navigator.share({
                title: eventTitle,
                url: window.location.href,
              });
            } catch (error) {
              // An error is thrown if sharing is cancelled, ignore that
              if (error instanceof Error && error.name !== "AbortError") {
                addToast("error", MESSAGES.ERROR_GENERIC);
              }
            }
          }}
        />
      );
    }
  };

  const copyButton = (buttonStyle: HeaderButtonStyle) => (
    <CopyToastButton code={eventCode} buttonStyle={buttonStyle} />
  );

  return (
    <div className="flex flex-col space-y-4 pl-6 pr-6">
      <HeaderSpacer />

      {/* Header */}
      <div className="flex flex-row justify-between gap-2 md:flex-wrap">
        <h1 className="text-2xl font-bold">{eventTitle}</h1>

        <div className="md:hidden">
          <KebabMenu>
            {isCreator && editButton("frosted glass inset")}
            {shareButton("frosted glass inset")}
            {copyButton("frosted glass inset")}
          </KebabMenu>
        </div>

        <div className="ml-auto hidden flex-wrap justify-end gap-2 md:flex">
          {isCreator && editButton("secondary")}
          {shareButton("secondary")}
          {copyButton("secondary")}
          {paintingButton}
        </div>
      </div>

      <div className="-mb-2 md:hidden">{bannerElement()}</div>

      <div className="flex h-fit flex-col md:flex-row md:gap-4">
        <ScheduleGrid
          mode="view"
          isWeekdayEvent={eventRange.type === "weekday"}
          timezone={timezone}
          hoveredSlot={hoveredSlot}
          setHoveredSlot={setHoveredSlot}
          availabilities={filteredAvailabilities}
          numParticipants={gridNumParticipants}
          timeslots={timeslots}
        />

        {/* Mobile Spacer & Drawer */}
        <div
          className="w-full md:hidden"
          style={{ height: getSpacerHeight() }}
        />
        <div className="md:hidden">
          <ResultsDrawer
            timezone={timezone}
            onTimezoneChange={handleTZChange}
            onSnapChange={setDrawerSnap}
            eventCode={eventCode}
          />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          {bannerElement()}
          <div
            className={cn(
              "hidden md:block",
              "fixed bottom-1 left-0 z-10 w-full shrink-0 px-6",
              "relative bottom-auto left-auto w-80 px-0",
            )}
          >
            <div
              className={cn(
                "sticky flex max-h-[calc(100vh-8rem)] flex-col gap-y-4",
                topMarginClass,
              )}
            >
              <AttendeesPanel />
              <div className="bg-panel shrink-0 rounded-3xl p-6 text-sm">
                <DisplaySettings
                  timezone={timezone}
                  onTimezoneChange={handleTZChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
