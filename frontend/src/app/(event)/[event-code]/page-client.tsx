"use client";

import { useState } from "react";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { PencilIcon, ShareIcon, SquarePenIcon } from "lucide-react";

import CopyToastButton from "@/components/copy-toast-button";
import KebabMenu from "@/components/kebab-menu";
import { EventInformation } from "@/core/event/types";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import ScheduleGrid from "@/features/event/grid/grid";
import AttendeesPanel from "@/features/event/results/attendee-panel/panel";
import { getResultBanner } from "@/features/event/results/banners";
import {
  ResultsProvider,
  useResultsContext,
} from "@/features/event/results/context";
import DisplaySettings from "@/features/event/results/display-settings";
import ResultsDrawer from "@/features/event/results/drawer";
import { ResultsInformation } from "@/features/event/results/lib/types";
import HeaderSpacer from "@/features/header/components/header-spacer";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
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
  } = useResultsContext();

  const {
    customCode: eventCode,
    title: eventTitle,
    eventRange,
    timeslots,
  } = eventData;

  const { addToast } = useToast();

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

  /* BANNER */
  const { element: banner, id: bannerId } = getResultBanner(
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
        {banner && (
          <motion.div
            key={bannerId}
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
            {banner}
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
    <div className="flex flex-col space-y-4 pl-6 pr-6 md:h-screen">
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

      <div className="flex min-h-0 flex-1 flex-col md:flex-row md:gap-4">
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
            "z-10 w-full shrink-0",
            "relative bottom-auto left-auto w-80 space-y-4 px-0",
          )}
        >
          {bannerElement()}
          <div className="flex max-h-[calc(100vh-18rem)] flex-col gap-y-4">
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
