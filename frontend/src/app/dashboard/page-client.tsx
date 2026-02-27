"use client";

import { useState } from "react";

import Link from "next/link";

import HeaderSpacer from "@/components/header-spacer";
import SegmentedControl from "@/components/segmented-control";
import { useAccount } from "@/features/account/context";
import EventGrid, {
  EventGridProps,
} from "@/features/dashboard/components/event-grid";
import { Banner } from "@/features/system-feedback";

type DashboardTab = "created" | "participated";

export type DashboardPageProps = {
  created_events: EventGridProps;
  participated_events: EventGridProps;
};

export default function ClientPage({
  created_events,
  participated_events,
}: DashboardPageProps) {
  const [tab, setTab] = useState<DashboardTab>(
    !created_events.length && participated_events.length
      ? "participated"
      : "created",
  );
  const { loginState } = useAccount();

  const currentTabEvents =
    tab === "created" ? created_events : participated_events;

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
            to sync data across devices.
          </div>
          <div className="opacity-60">
            Currently, guest data cannot be transferred to an account. Keep an
            eye out for updates!
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
            <EventGrid events={currentTabEvents} />
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
    </div>
  );
}
