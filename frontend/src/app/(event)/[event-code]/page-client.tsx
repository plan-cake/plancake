"use client";

import { useEffect, useRef, useState } from "react";

import { Pencil1Icon, Pencil2Icon } from "@radix-ui/react-icons";

import CopyToastButton from "@/components/copy-toast-button";
import HeaderSpacer from "@/components/header-spacer";
import { EventRange } from "@/core/event/types";
import LinkButton from "@/features/button/components/link";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import { ScheduleGrid } from "@/features/event/grid";
import EventInfoDrawer, { EventInfo } from "@/features/event/info-drawer";
import AttendeesPanel from "@/features/event/results/attendees-panel";
import { getResultBanners } from "@/features/event/results/banners";
import { useEventResults } from "@/features/event/results/use-results";
import { AllAvailability } from "@/lib/utils/api/types";
import { cn } from "@/lib/utils/classname";

export default function ClientPage({
  eventCode,
  eventName,
  eventRange,
  timeslots,
  initialAvailabilityData,
  isCreator,
}: {
  eventCode: string;
  eventName: string;
  eventRange: EventRange;
  timeslots: Date[];
  initialAvailabilityData: AllAvailability;
  isCreator: boolean;
}) {
  /* PARTICIPANT INFO */
  const participated: boolean =
    initialAvailabilityData.user_display_name != null;
  const userName = initialAvailabilityData.user_display_name || "";

  /* FORM ERROR & TIMEZONE HANDLING */
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const handleTZChange = (newTZ: string | number) => {
    setTimezone(newTZ.toString());
  };

  /* LOGIC HOOK */
  const {
    participants,
    availabilities,
    filteredAvailabilities,
    gridNumParticipants,
    hoveredSlot,
    selectedParticipants,
    clearSelectedParticipants,
    setHoveredSlot,
    setHoveredParticipant,
    toggleParticipant,
    handleRemoveParticipant,
  } = useEventResults(initialAvailabilityData, eventCode, isCreator, userName);

  /* SIDEBAR SPACING HANDLING */
  const DEFAULT_SPACER_HEIGHT = 200;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(DEFAULT_SPACER_HEIGHT);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const entry = entries[0];
      setSpacerHeight(entry.contentRect.height);
    });

    observer.observe(sidebarRef.current);

    return () => observer.disconnect();
  }, []);

  /* BANNERS */
  const banners = getResultBanners(
    availabilities,
    participants,
    timeslots,
    eventRange.type === "weekday",
    participated,
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
            label={(participated ? "Edit" : "Add") + " Availability"}
            href={`/${eventCode}/painting`}
          />
        </div>
      </div>

      <div className="md:hidden">{banners}</div>

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

        <div
          style={{ height: `${spacerHeight}px` }}
          className="w-full md:hidden"
        />

        {/* Sidebar for attendees */}
        <div
          ref={sidebarRef}
          className={cn(
            "fixed bottom-1 left-0 z-10 w-full shrink-0 px-6",
            "md:top-25 md:sticky md:h-full md:w-80 md:space-y-4 md:px-0",
          )}
        >
          <div className="hidden md:block">{banners}</div>

          <AttendeesPanel
            hoveredSlot={hoveredSlot}
            participants={participants}
            availabilities={availabilities}
            selectedParticipants={selectedParticipants}
            clearSelectedParticipants={clearSelectedParticipants}
            onParticipantToggle={toggleParticipant}
            setHoveredParticipant={setHoveredParticipant}
            isCreator={isCreator}
            currentUser={userName}
            onRemoveParticipant={handleRemoveParticipant}
          />

          <div className="bg-panel hidden rounded-3xl p-6 md:block">
            <EventInfo eventRange={eventRange} timezone={timezone} />
          </div>

          <div className="bg-panel hidden rounded-3xl p-6 text-sm md:block">
            Displaying event in
            <span className="text-accent ml-1 font-bold">
              <TimeZoneSelector
                id="timezone-select"
                value={timezone}
                onChange={handleTZChange}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
