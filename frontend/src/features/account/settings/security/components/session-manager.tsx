"use client";

import { toZonedTime } from "date-fns-tz";
import { CircleQuestionMark, Laptop2Icon, SmartphoneIcon } from "lucide-react";

import { type ActiveSession } from "@/lib/utils/api/types";
import { cn } from "@/lib/utils/classname";
import { formatTimeAgo } from "@/lib/utils/date-time-format";

export default function SessionManager({
  sessions,
}: {
  sessions: ActiveSession[];
}) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="bg-panel flex flex-col gap-4 rounded-3xl border-none p-6 md:p-8">
      <div>
        <h2 className="text-lg font-bold">Active Devices</h2>
        <p className="mt-1 text-sm leading-tight opacity-75">
          If there are any devices you don{"'"}t recognize, remove them and
          change your password.
        </p>
      </div>

      {sessions.map((session) => {
        const lastUsedLocal = toZonedTime(
          new Date(session.last_used + "Z"),
          userTimeZone,
        );
        const lastUsedSecondsAgo =
          (Date.now() - lastUsedLocal.getTime()) / 1000;

        return (
          <div
            key={session.public_id}
            className="bg-background rounded-3xl p-2"
          >
            <div className="flex gap-2">
              <div
                className={cn(
                  "bg-panel h-fit rounded-full p-2",
                  session.is_current && "bg-accent text-white",
                )}
              >
                {session.device_type === "desktop" ? (
                  <Laptop2Icon className="h-5 w-5" />
                ) : session.device_type === "smartphone" ? (
                  <SmartphoneIcon className="h-5 w-5" />
                ) : (
                  <CircleQuestionMark className="h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col justify-between">
                <div className="text-sm font-semibold">
                  {!session.os_name && !session.client_name
                    ? "Unknown"
                    : (session.os_name || "Unknown Device") +
                      " • " +
                      (session.client_name || "Unknown Browser")}
                </div>
                <div className="text-xs opacity-75">
                  {session.is_current
                    ? "This Session"
                    : `Last used ${formatTimeAgo(lastUsedSecondsAgo)}`}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
