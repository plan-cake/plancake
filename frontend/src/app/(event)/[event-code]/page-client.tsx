"use client";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { PencilIcon, ShareIcon, SquarePenIcon } from "lucide-react";

import KebabMenu from "@/components/kebab-menu";
import { EventInformation } from "@/core/event/types";
import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import ScheduleGrid from "@/features/event/grid/grid";
import { GRID_ID_SELECTOR } from "@/features/event/grid/lib/constants";
import AttendeesPanel from "@/features/event/results/attendees/desktop-panel";
import AttendeesDrawer from "@/features/event/results/attendees/mobile-drawer";
import { getResultBanner } from "@/features/event/results/banner";
import AvailabilityFilters from "@/features/event/results/components/availability-filters";
import {
  ResultsProvider,
  useResultsContext,
} from "@/features/event/results/context";
import { ResultsInformation } from "@/features/event/results/lib/types";
import HeaderSpacer from "@/features/header/components/header-spacer";
import ShareMenu from "@/features/share-menu/menu";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { useViewTransition } from "@/lib/hooks/use-view-transition";
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

  /* TIMEZONE HANDLING */
  const handleTZChange = (newTZ: string | number) => {
    setTimezone(newTZ.toString());
  };

  /* MOBILE DRAWER SPACING */
  const isMobile = useCheckMobile();
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
  const bannerElement = getResultBanner(
    availabilities,
    participants,
    timeslots,
    eventRange.type === "weekday",
    currentUser !== null,
    isCreator,
  );

  /* DISPLAY SETTINGS */
  const renderTimezoneSelector = (id: string, useShortcut: boolean) => (
    <div className="bg-panel shrink-0 rounded-3xl p-6 text-sm">
      Displaying event in
      <TimeZoneSelector
        id={id}
        value={timezone}
        onChange={handleTZChange}
        drawerNesting={0}
        useShortcut={useShortcut}
      />
    </div>
  );

  const availabilityFilters = (
    <motion.div
      key="availability-filters"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
      className="shrink-0 overflow-hidden"
    >
      <div className="bg-panel rounded-3xl p-6 text-sm">
        <AvailabilityFilters />
      </div>
    </motion.div>
  );

  const doViewTransition = useViewTransition();

  /* BUTTONS */
  const paintingButton = (
    <ActionButton
      buttonStyle="primary"
      icon={<SquarePenIcon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      onClick={() => {
        doViewTransition(`/${eventCode}/painting`, GRID_ID_SELECTOR);
      }}
      hotkey={{
        keys: "a",
        type: "shortcut",
      }}
      loadOnSuccess
    />
  );

  const editButton = (buttonStyle: HeaderButtonStyle, desktop: boolean) => (
    <LinkButton
      buttonStyle={buttonStyle}
      icon={<PencilIcon />}
      label="Edit Event"
      href={`/${eventCode}/edit`}
      hotkey={
        desktop
          ? {
              keys: "e",
              type: "shortcut",
            }
          : undefined
      }
    />
  );

  const shareButton = (
    <ShareMenu
      eventTitle={eventTitle}
      eventCode={eventCode}
      trigger={
        <EmptyButton
          buttonStyle="secondary"
          icon={<ShareIcon />}
          label="Share Event"
          hotkey={{
            keys: "s",
            type: "shortcut",
          }}
        />
      }
    />
  );

  return (
    <div className="flex flex-col space-y-4 pl-6 pr-6 md:h-screen">
      <HeaderSpacer />

      {/* Header */}
      <div className="flex flex-row justify-between gap-2 md:flex-wrap">
        <h1 className="text-2xl font-bold">{eventTitle}</h1>

        {isCreator && (
          <div className="md:hidden">
            <KebabMenu>{editButton("frosted glass inset", false)}</KebabMenu>
          </div>
        )}

        <div className="ml-auto hidden flex-wrap justify-end gap-2 md:flex">
          {isCreator && editButton("secondary", true)}
          {shareButton}
          {paintingButton}
        </div>
      </div>

      <div className="-mb-2 md:hidden">{bannerElement}</div>

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

        <div className="md:hidden">
          {renderTimezoneSelector("timezone-select-mobile", false)}
        </div>

        {/* Mobile Spacer & Drawer */}
        {isMobile && (
          <>
            <div className="w-full" style={{ height: getSpacerHeight() }} />
            <div className="md:hidden">
              <AttendeesDrawer
                onSnapChange={setDrawerSnap}
                eventTitle={eventTitle}
                eventCode={eventCode}
                numParticipants={participants.length}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none fixed left-0 right-0 top-[100vh] w-screen"
                style={{
                  viewTransitionName: "painting-island",
                }}
              />
            </div>
          </>
        )}

        {/* Desktop Sidebar */}
        <div
          className={cn(
            "hidden md:block",
            "z-10 w-full shrink-0",
            "relative bottom-auto left-auto w-80 space-y-4 px-0",
          )}
        >
          {bannerElement}
          <div className="flex max-h-[calc(100vh-18rem)] flex-col gap-y-4">
            <AttendeesPanel />
            <AnimatePresence initial={false}>
              {participants.length > 1 && availabilityFilters}
            </AnimatePresence>
            {renderTimezoneSelector("timezone-select-desktop", true)}
          </div>
        </div>
      </div>
    </div>
  );
}
