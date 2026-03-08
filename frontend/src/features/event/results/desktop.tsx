"use client";

import { useState } from "react";

import { Pencil1Icon, Pencil2Icon } from "@radix-ui/react-icons";

import CopyToastButton from "@/components/copy-toast-button";
import HeaderSpacer from "@/components/header-spacer";
import { EventInformation } from "@/core/event/types";
import LinkButton from "@/features/button/components/link";
import { ScheduleGrid } from "@/features/event/grid";
import AttendeesPanel from "@/features/event/results/attendee-panel/panel";
import { getResultBanners } from "@/features/event/results/banners";
import { useResultsContext } from "@/features/event/results/context";
import ViewSettings from "@/features/event/results/view-settings";
import { cn } from "@/lib/utils/classname";

export default function DesktopResults({
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
      <div className="flex flex-wrap justify-between gap-2">
        <h1 className="text-2xl font-bold">{eventName}</h1>
        <div className="ml-auto flex flex-wrap justify-end gap-2">
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

      <div className="flex h-fit flex-row gap-4">
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

        {/* Sidebar for attendees */}
        <div
          className={cn(
            "fixed bottom-1 left-0 z-10 w-full shrink-0 px-6",
            "relative bottom-auto left-auto w-80 space-y-4 px-0",
          )}
        >
          {banners}

          <div className="top-25 sticky flex max-h-[calc(100vh-8rem)] flex-col gap-y-4">
            <AttendeesPanel />

            <div className="bg-panel shrink-0 rounded-3xl p-6 text-sm">
              <ViewSettings
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
