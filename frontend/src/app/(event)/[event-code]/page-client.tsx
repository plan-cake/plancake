"use client";

import { useState } from "react";

import { PencilIcon, ShareIcon, SquarePenIcon } from "lucide-react";

import KebabMenu from "@/components/kebab-menu";
import { EventInformation } from "@/core/event/types";
import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import ScheduleGrid from "@/features/event/grid/grid";
import { GRID_ID_SELECTOR } from "@/features/event/grid/lib/constants";
import AttendeesPanel from "@/features/event/results/attendees/desktop-panel";
import AttendeesDrawer from "@/features/event/results/attendees/mobile-drawer";
import { getResultBanners } from "@/features/event/results/components/banners";
import DisplaySettings from "@/features/event/results/components/display-settings";
import {
  ResultsProvider,
  useResultsContext,
} from "@/features/event/results/context";
import { ResultsInformation } from "@/features/event/results/lib/types";
import HeaderSpacer from "@/features/header/components/header-spacer";
import ShareMenu from "@/features/share-menu/menu";
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
  const [drawerSnap, setDrawerSnap] = useState<number | string | null>(0.22);
  const getSpacerHeight = () => {
    const defaultHeight = "25svh";
    if (!drawerSnap) return defaultHeight;

    if (typeof drawerSnap === "number") {
      return `calc(${drawerSnap * 100}svh + 20px)`;
    }

    return drawerSnap;
  };

  /* BANNERS */
  const banners = getResultBanners(
    availabilities,
    participants,
    timeslots,
    eventRange.type === "weekday",
    currentUser !== null,
    isCreator,
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
      loadOnSuccess
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

  const shareButton = (
    <ShareMenu
      eventTitle={eventTitle}
      eventCode={eventCode}
      trigger={
        <EmptyButton
          buttonStyle="secondary"
          icon={<ShareIcon />}
          label="Share Event"
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
            <KebabMenu>{editButton("frosted glass inset")}</KebabMenu>
          </div>
        )}

        <div className="ml-auto hidden flex-wrap justify-end gap-2 md:flex">
          {isCreator && editButton("secondary")}
          {shareButton}
          {paintingButton}
        </div>
      </div>

      <div className="md:hidden">{banners}</div>

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

        <div className="bg-panel shrink-0 rounded-3xl p-6 text-sm md:hidden">
          <DisplaySettings
            timezone={timezone}
            onTimezoneChange={handleTZChange}
          />
        </div>

        {/* Mobile Spacer & Drawer */}
        <div
          className="w-full md:hidden"
          style={{ height: getSpacerHeight() }}
        />
        <div className="md:hidden">
          <AttendeesDrawer
            onSnapChange={setDrawerSnap}
            eventTitle={eventTitle}
            eventCode={eventCode}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed left-0 right-0 top-[100vh] w-[100vw]"
            style={{
              viewTransitionName: "painting-island",
            }}
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
          {banners}
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
