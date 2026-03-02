"use client";

import { useState, useRef, useEffect } from "react";

import { Pencil1Icon, Pencil2Icon } from "@radix-ui/react-icons";

import Checkbox from "@/components/checkbox";
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
    showOnlyBestTimes,
    setShowOnlyBestTimes,
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
            "relative bottom-auto left-auto w-80 space-y-4 px-0",
          )}
        >
          {banners}

          <div className="sticky top-24 flex h-[calc(100vh-8rem)] flex-col gap-y-4">
            <div className="flex min-h-0 flex-1">
              <AttendeesPanel />
            </div>
            <div className="bg-panel hidden shrink-0 rounded-3xl p-6 md:block">
              <EventInfo eventRange={eventRange} timezone={timezone} />
            </div>
            <div className="bg-panel hidden shrink-0 rounded-3xl p-6 text-sm md:block">
              <Checkbox
                label="Only show best times"
                checked={showOnlyBestTimes}
                onChange={setShowOnlyBestTimes}
              />
              <div className="mt-3">
                Displaying event in
                <span className="text-accent font-bold">
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
      </div>
    </div>
  );
}
