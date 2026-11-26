"use client";

import { startTransition, useOptimistic, useRef, useState } from "react";

import { CircleQuestionMarkIcon } from "lucide-react";

import InfoPoint from "@/components/info-point";
import LinkText from "@/components/link-text";
import SegmentedControl from "@/components/segmented-control";
import { DashboardEventProps } from "@/features/dashboard/components/event";
import EventGrid from "@/features/dashboard/components/event-grid";
import { deleteEvent } from "@/features/dashboard/delete-event";
import HeaderSpacer from "@/features/header/components/header-spacer";
import { ConfirmationDialog, useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

type DashboardTab = "created" | "participated";

export type DashboardPageProps = {
  created_events: DashboardEventProps[];
  participated_events: DashboardEventProps[];
};

export default function ClientPage({
  created_events,
  participated_events,
  logged_in,
}: DashboardPageProps & { logged_in: boolean }) {
  const [optimisticCreatedEvents, deleteOptimisticCreatedEvent] = useOptimistic(
    created_events,
    (state, eventToDelete: string) => {
      return state.filter((e) => e.code !== eventToDelete);
    },
  );
  const [optimisticParticipatedEvents, deleteOptimisticParticipatedEvent] =
    useOptimistic(participated_events, (state, eventToDelete: string) => {
      return state.filter((e) => e.code !== eventToDelete);
    });
  const [tab, setTab] = useState<DashboardTab>(
    !created_events.length && participated_events.length
      ? "participated"
      : "created",
  );

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const eventToDelete = useRef<string | null>(null);
  const { addToast } = useToast();

  const currentTabEvents =
    tab === "created" ? optimisticCreatedEvents : optimisticParticipatedEvents;

  const handleDeleteEvent = async (eventCode: string) => {
    // Immediate UI update
    startTransition(() => {
      if (tab === "created") {
        deleteOptimisticCreatedEvent(eventCode);
      } else {
        deleteOptimisticParticipatedEvent(eventCode);
      }
    });

    // Server Action
    const result = await deleteEvent(eventCode);

    if (!result.success) {
      addToast("error", result.error || MESSAGES.ERROR_GENERIC);
    } else {
      addToast("success", MESSAGES.SUCCESS_EVENT_DELETE);
    }
  };

  const onDeleteEvent = (eventCode: string) => {
    eventToDelete.current = eventCode;
    setConfirmationOpen(true);
  };

  const guestModeInfoContent = (className?: string) => (
    <div className={cn("flex flex-col gap-1", className)}>
      <p>
        Your events and availability are saved{" "}
        <span className="italic">only on this browser</span>.{" "}
        <LinkText>Create an account</LinkText> to access them from anywhere, and
        you{"'"}ll be prompted to import this data after logging in.
      </p>
      <p className="italic opacity-75">
        Plancake will always work without an account. Just be mindful where you
        create events and fill out availability so you can access it all from
        the same place later!
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col gap-4 px-6 pb-4">
      <HeaderSpacer />
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {!logged_in && (
          <InfoPoint
            title="Guest Mode"
            description="About guest mode"
            drawerContent={guestModeInfoContent()}
            tooltipContent={guestModeInfoContent("max-w-md p-1")}
          >
            <button className="bg-accent/50 text-accent-text flex select-none items-center gap-1.5 rounded-full p-1 px-2 pl-3">
              <span className="font-bold">Guest Mode</span>
              <CircleQuestionMarkIcon className="size-5" />
            </button>
          </InfoPoint>
        )}
      </div>
      <div className="bg-panel flex w-full flex-col gap-4 rounded-3xl p-4">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { label: "My Events", value: "created" },
            { label: "Others' Events", value: "participated" },
          ]}
          hidePadding
        />
        {currentTabEvents.length ? (
          <EventGrid events={currentTabEvents} onDeleteEvent={onDeleteEvent} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-4 text-center italic opacity-75">
            <div>
              {tab === "created"
                ? "You haven't created any events yet."
                : "You haven't participated in any events yet."}
            </div>
            <div>{`When you do, it'll show up here for quick access!`}</div>
          </div>
        )}
      </div>
      <ConfirmationDialog
        type="delete"
        autoClose={true}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        onConfirm={() => {
          if (!eventToDelete.current) return false;
          handleDeleteEvent(eventToDelete.current!);
          return true;
        }}
      />
    </div>
  );
}
