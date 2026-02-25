"use client";

import { startTransition, useOptimistic, useRef, useState } from "react";

import Link from "next/link";

import HeaderSpacer from "@/components/header-spacer";
import SegmentedControl from "@/components/segmented-control";
import { useAccount } from "@/features/account/context";
import { DashboardEventProps } from "@/features/dashboard/components/event";
import EventGrid from "@/features/dashboard/components/event-grid";
import { deleteEvent } from "@/features/dashboard/delete-event";
import {
  Banner,
  ConfirmationDialog,
  useToast,
} from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";

type DashboardTab = "created" | "participated";

export type DashboardPageProps = {
  created_events: DashboardEventProps[];
  participated_events: DashboardEventProps[];
};

export default function ClientPage({
  created_events,
  participated_events,
}: DashboardPageProps) {
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

  const { loginState } = useAccount();

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

  return (
    <div className="flex min-h-screen flex-col gap-4 px-6 pb-4">
      <HeaderSpacer />
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {loginState === "logged_out" && (
        <Banner type="info" title="Logged in as a Guest">
          <div>
            This data is only available from this browser.{" "}
            <Link
              href="/register"
              className="text-accent cursor-pointer font-bold hover:underline"
            >
              Create an account
            </Link>{" "}
            to sync your data across devices.
          </div>
        </Banner>
      )}
      <div className="bg-panel w-full rounded-3xl">
        <div className="px-2 pt-2">
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { label: "My Events", value: "created" },
              { label: "Others' Events", value: "participated" },
            ]}
          />
        </div>
        <div className="p-4 pt-2">
          {currentTabEvents.length ? (
            <EventGrid
              events={currentTabEvents}
              onDeleteEvent={onDeleteEvent}
            />
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
