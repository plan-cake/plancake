"use client";

import { useEffect, useState } from "react";

import { fetchEventSource } from "@microsoft/fetch-event-source";
import { PencilIcon, SquarePenIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import CopyToastButton from "@/components/copy-toast-button";
import KebabMenu from "@/components/kebab-menu";
import { EventInformation } from "@/core/event/types";
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
    liveUpdateAvailability,
    liveRemoveParticipant,
  } = useResultsContext();

  const {
    customCode: eventCode,
    title: eventTitle,
    eventRange,
    timeslots,
  } = eventData;

  const { addToast } = useToast();

  /* LIVE UPDATES */
  const [stopLiveUpdates, setStopLiveUpdates] = useState(false);
  const [liveUpdatesPaused, setLiveUpdatesPaused] = useState(false);
  const router = useRouter();

  // Handle idle timeout and reconnection
  useEffect(() => {
    if (stopLiveUpdates) return;

    let timeout: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setLiveUpdatesPaused(true), 1000 * 60 * 15);
    };

    const handleActivity = () => {
      if (liveUpdatesPaused) {
        setLiveUpdatesPaused(false);
        router.refresh();
      }
      resetTimeout();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetTimeout();
      } else {
        handleActivity();
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeout);
    };
  }, [stopLiveUpdates, liveUpdatesPaused, router]);

  useEffect(() => {
    if (stopLiveUpdates) return;
    if (liveUpdatesPaused) return;

    const ctrl = new AbortController();

    fetchEventSource(
      process.env.NEXT_PUBLIC_API_URL + `/event/get-updates/${eventCode}/`,
      {
        signal: ctrl.signal,
        async onopen(response) {
          if (!response.ok) {
            if (response.status === 503) {
              addToast(
                "error",
                "Cannot connect to live updates, the server is busy. Please try again later.",
              );
            }
            setStopLiveUpdates(true);
            ctrl.abort();
          }
        },
        onmessage(msg) {
          const data = JSON.parse(msg.data);
          if (data.action === "add" || data.action === "update") {
            liveUpdateAvailability(
              data.action,
              data.display_name,
              data.availability,
            );
            if (data.action === "add") {
              addToast("info", `${data.display_name} joined the event!`, {
                title: "NEW ATTENDEE",
              });
            } else {
              addToast(
                "info",
                `${data.display_name} updated their availability.`,
              );
            }
          } else if (data.action === "remove") {
            liveRemoveParticipant(data.display_name);
            addToast("info", `${data.display_name} left the event.`);
          } else if (data.action === "event_edit") {
            addToast(
              "info",
              `The event was edited, reload the page for updates.`,
              {
                isPersistent: true,
                title: "EVENT UPDATED",
              },
            );
            setStopLiveUpdates(true);
          } else {
            console.warn("Unknown action received in live update:", data);
          }
        },
        onerror(err) {
          setStopLiveUpdates(true);
          addToast(
            "error",
            "Failed to connect to live updates. Refresh the page to retry.",
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
    liveUpdateAvailability,
    liveRemoveParticipant,
    stopLiveUpdates,
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

  /* BUTTONS */
  const paintingButton = (
    <LinkButton
      buttonStyle="primary"
      icon={<SquarePenIcon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      href={`/${eventCode}/painting`}
    />
  );

  const editButton = (buttonStyle: "frosted glass inset" | "secondary") => (
    <LinkButton
      buttonStyle={buttonStyle}
      icon={<PencilIcon />}
      label="Edit Event"
      href={`/${eventCode}/edit`}
    />
  );

  const copyButton = (buttonStyle: "frosted glass inset" | "secondary") => (
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
            {copyButton("frosted glass inset")}
          </KebabMenu>
        </div>

        <div className="ml-auto hidden flex-wrap justify-end gap-2 md:flex">
          {isCreator && editButton("secondary")}
          {copyButton("secondary")}
          {paintingButton}
        </div>
      </div>

      <div className="md:hidden">{banners}</div>

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
        <div
          className={cn(
            "hidden md:block",
            "fixed bottom-1 left-0 z-10 w-full shrink-0 px-6",
            "relative bottom-auto left-auto w-80 space-y-4 px-0",
          )}
        >
          {banners}
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
  );
}
