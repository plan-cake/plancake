"use client";

import { useState } from "react";

import { Pencil1Icon, Pencil2Icon } from "@radix-ui/react-icons";

import CopyToastButton from "@/components/copy-toast-button";
import HeaderSpacer from "@/components/header-spacer";
import KebabMenu from "@/components/kebab-menu";
import { EventInformation } from "@/core/event/types";
import LinkButton from "@/features/button/components/link";
import { ScheduleGrid } from "@/features/event/grid";
import { getResultBanners } from "@/features/event/results/banners";
import { useResultsContext } from "@/features/event/results/context";
import ResultsDrawer from "@/features/event/results/drawer";

export default function MobileResults({
  eventData,
}: {
  eventData: EventInformation;
}) {
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

  const { customCode: eventCode, eventRange, timeslots } = eventData;

  /* FORM ERROR & TIMEZONE HANDLING */
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const handleTZChange = (newTZ: string | number) => {
    setTimezone(newTZ.toString());
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

  const editButton = (
    <LinkButton
      buttonStyle="frosted glass inset"
      icon={<Pencil1Icon />}
      label="Edit Event"
      href={`/${eventCode}/edit`}
    />
  );

  const copyButton = (
    <CopyToastButton code={eventCode} buttonStyle="frosted glass inset" />
  );

  return (
    <div className="flex flex-col space-y-4 pl-6 pr-6">
      <HeaderSpacer />
      <div className="flex flex-col justify-between gap-2 md:flex-row">
        <h1 className="text-2xl">
          REALLLY REALLY LONG EVENT TITLE REALLLY REALLY LON
        </h1>
        <div className="flex w-full items-center justify-end gap-2">
          {paintingButton}
          <KebabMenu
            buttons={isCreator ? [editButton, copyButton] : [copyButton]}
          />
        </div>
        {banners}
      </div>
      <div className="h-fit md:flex md:flex-row md:gap-4">
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

        <ResultsDrawer
          eventRange={eventRange}
          timezone={timezone}
          onTimezoneChange={handleTZChange}
        />
      </div>
    </div>
  );
}
