"use client";

import { useState } from "react";

import { PencilIcon, ShareIcon, SquarePenIcon } from "lucide-react";

import KebabMenu from "@/components/kebab-menu";
import { EventInformation } from "@/core/event/types";
import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import ScheduleGrid from "@/features/event/grid/grid";
import AttendeesPanel from "@/features/event/results/attendees/desktop-panel";
import AttendeesDrawer from "@/features/event/results/attendees/mobile-drawer";
import { getResultBanner } from "@/features/event/results/banner";
import DisplaySettings from "@/features/event/results/components/display-settings";
import {
  ResultsProvider,
  useResultsContext,
} from "@/features/event/results/context";
import { ResultsInformation } from "@/features/event/results/lib/types";
import HeaderSpacer from "@/features/header/components/header-spacer";
import ShareMenu from "@/features/share-menu/menu";
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

  /* BANNER */
  const bannerElement = getResultBanner(
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
      hotkey={{
        keys: "mod+alt+a",
        badgeDisplay: "powerkey tooltip",
      }}
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
              keys: "mod+alt+e",
              badgeDisplay: "powerkey tooltip",
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
            keys: "mod+alt+s",
            badgeDisplay: "powerkey tooltip",
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
        </div>

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
