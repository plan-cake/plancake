"use client";

import { useState } from "react";

import { Pencil1Icon, Pencil2Icon } from "@radix-ui/react-icons";

import CopyToastButton from "@/components/copy-toast-button";
import HeaderSpacer from "@/components/header-spacer";
import { EventInformation } from "@/core/event/types";
import LinkButton from "@/features/button/components/link";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import { ScheduleGrid } from "@/features/event/grid";
import EventInfoDrawer, { EventInfo } from "@/features/event/info-drawer";
import AttendeesPanel from "@/features/event/results/attendee-panel/panel";
import { getResultBanners } from "@/features/event/results/banners";
import { useResultsContext } from "@/features/event/results/context";
import { cn } from "@/lib/utils/classname";
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

  const {
    customCode: eventCode,
    title: eventName,
    eventRange,
    timeslots,
  } = eventData;

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

  return (
    <div className="flex flex-col space-y-4 pl-6 pr-6">
      <HeaderSpacer />
      <div className="flex flex-col justify-between gap-2 md:flex-row">
        <div className="flex flex-1 justify-between">
          <h1 className="text-2xl">{eventName}</h1>
          <EventInfoDrawer eventRange={eventRange} timezone={timezone} />
        </div>
        <div className="flex flex-wrap items-start justify-end gap-2">
          {isCreator && (
            <LinkButton
              buttonStyle="secondary"
              icon={<Pencil1Icon />}
              label="Edit Event"
              shrinkOnMobile
              href={`/${eventCode}/edit`}
            />
          )}
          <CopyToastButton code={eventCode} />
          <LinkButton
            buttonStyle="primary"
            icon={<Pencil2Icon />}
            label={(currentUser ? "Edit" : "Add") + " Availability"}
            href={`/${eventCode}/painting`}
          />
        </div>
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

        <ResultsDrawer />
      </div>
    </div>
  );
}
