import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { ClockIcon, Pencil1Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DashboardCopyButton from "@/features/dashboard/components/copy-button";
import DateRangeRow from "@/features/dashboard/components/date-range-row";
import ParticipantRow from "@/features/dashboard/components/participant-row";
import WeekdayRow from "@/features/dashboard/components/weekday-row";
import { cn } from "@/lib/utils/classname";
import {
  formatTimeRange,
  getTimezoneDetails,
} from "@/lib/utils/date-time-format";

export type DashboardEventProps = {
  myEvent: boolean;
  code: string;
  title: string;
  type: "specific" | "weekday";
  participants: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  timezone: string;
};

export default function DashboardEvent({
  myEvent = false,
  code,
  title,
  type,
  participants,
  timezone,
  ...dateTimeProps
}: DashboardEventProps) {
  const router = useRouter();

  function navigateToEdit(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault(); // prevent the link behind it triggering
    router.push(`/${code}/edit`);
  }

  // Memoized local start and end details
  const start = useMemo(
    () =>
      getTimezoneDetails({
        time: dateTimeProps.startTime,
        date: dateTimeProps.startDate,
        fromTZ: type === "weekday" ? timezone : undefined,
      }),
    [dateTimeProps.startTime, dateTimeProps.startDate, timezone, type],
  );
  const end = useMemo(
    () =>
      getTimezoneDetails({
        time: dateTimeProps.endTime,
        date: dateTimeProps.endDate,
        fromTZ: type === "weekday" ? timezone : undefined,
      }),
    [dateTimeProps.endTime, dateTimeProps.endDate, timezone, type],
  );

  // Dynamic participant icon count based on event width
  const participantRowRef = useRef<HTMLDivElement>(null);
  const [numIcons, setNumIcons] = useState(8);
  useEffect(() => {
    if (!participantRowRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const entry = entries[0];
      const width = entry.contentRect.width;
      // Each icon is 24px wide with a -4px overlap, except for the first
      // We also subtract an extra 16 px just for padding in case the "+N" is big
      setNumIcons(Math.floor((width - 4 - 16) / 20));
    });

    observer.observe(participantRowRef.current);

    return () => observer.disconnect();
  });

  return (
    <Link
      href={`/${code}`}
      className={cn(
        "bg-background flex h-fit w-full flex-col rounded-lg p-4",
        "transition-shadow hover:shadow-lg hover:shadow-black/25",
      )}
    >
      <div className="text-lg font-bold leading-tight">{title}</div>
      <div className="text-sm opacity-50">{code}</div>
      <div className="mb-2 mt-1">
        {type === "specific" && (
          <DateRangeRow startDate={start.date} endDate={end.date} />
        )}
        {type === "weekday" && (
          <WeekdayRow startWeekday={start.weekday} endWeekday={end.weekday} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5" />
        {formatTimeRange(start.time, end.time)}
      </div>
      <div className="mt-1.5" ref={participantRowRef}>
        <ParticipantRow participants={participants} numIcons={numIcons} />
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <DashboardCopyButton code={code} />
        {myEvent && (
          <button className="cursor-pointer" onClick={navigateToEdit}>
            <div
              className={
                "border-foreground hover:bg-foreground/25 w-fit rounded-full border p-1.5"
              }
            >
              <Pencil1Icon className="h-4 w-4" />
            </div>
          </button>
        )}
      </div>
    </Link>
  );
}
