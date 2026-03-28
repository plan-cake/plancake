"use client";

import { useState } from "react";

import { Pencil1Icon, Pencil2Icon } from "@radix-ui/react-icons";

import CopyToastButton from "@/components/copy-toast-button";
import HeaderSpacer from "@/components/header-spacer";
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
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
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
  );

  /* BUTTONS */
  const paintingButton = (
    <LinkButton
      buttonStyle="primary"
      icon={<Pencil2Icon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      href={`/${eventCode}/painting`}
    />
  );

  const editButton = (buttonStyle: "frosted glass inset" | "secondary") => (
    <LinkButton
      buttonStyle={buttonStyle}
      icon={<Pencil1Icon />}
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
          <div className="top-25 sticky flex max-h-[calc(100vh-8rem)] flex-col gap-y-4">
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
