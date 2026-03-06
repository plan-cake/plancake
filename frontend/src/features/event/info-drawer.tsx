"use client";

import { useMemo, useState } from "react";

import { InfoCircledIcon } from "@radix-ui/react-icons";
import { addDays } from "date-fns";
import { format } from "date-fns-tz/format";

import { BaseDrawer } from "@/components/layout/base-drawer";
import { EventRange, ALL_WEEKDAYS } from "@/core/event/types";
import ActionButton from "@/features/button/components/action";
import WeekdayRow from "@/features/dashboard/components/weekday-row";
import {
  formatDateRange,
  formatTimeRange,
  getTimezoneDetails,
} from "@/lib/utils/date-time-format";

type EventInfoProps = {
  eventRange: EventRange;
  timezone: string;
};

export default function EventInfoDrawer({
  eventRange,
  timezone,
}: EventInfoProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    return true;
  };

  return (
    <div className="md:hidden">
      <ActionButton
        buttonStyle="frosted glass"
        icon={<InfoCircledIcon />}
        onClick={handleOpen}
      />
      <BaseDrawer
        open={open}
        onOpenChange={setOpen}
        contentClassName="h-1/2"
        title="Event Details"
        description="View details about the event"
      >
        <EventInfo eventRange={eventRange} timezone={timezone} noTitle />
      </BaseDrawer>
    </div>
  );
}

export function EventInfo({
  eventRange,
  timezone,
  noTitle,
}: EventInfoProps & { noTitle?: boolean }) {
  const startTime = eventRange.timeRange.from;
  const endTime = eventRange.timeRange.to;

  let startDate, endDate;
  if (eventRange.type === "specific") {
    startDate = eventRange.dateRange.from;
    endDate = eventRange.dateRange.to;
  } else {
    const activeDays = eventRange.weekdays.map((day) =>
      ALL_WEEKDAYS.indexOf(day),
    );

    if (activeDays.length > 0) {
      const referenceStart = new Date("2012-01-01T00:00:00");
      startDate = format(addDays(referenceStart, activeDays[0]), "yyyy-MM-dd");
      endDate = format(
        addDays(referenceStart, activeDays[activeDays.length - 1]),
        "yyyy-MM-dd",
      );
    }
  }

  const start = useMemo(
    () =>
      getTimezoneDetails({
        time: startTime,
        date: startDate!,
        fromTZ: eventRange.timezone,
        toTZ: timezone,
      }),
    [startTime, startDate, eventRange.timezone, timezone],
  );

  const end = useMemo(
    () =>
      getTimezoneDetails({
        time: endTime,
        date: endDate!,
        fromTZ: eventRange.timezone,
        toTZ: timezone,
      }),
    [endTime, endDate, eventRange.timezone, timezone],
  );

  return (
    <section className="space-y-2 overflow-y-auto">
      {!noTitle && <h1 className="font-semibold">Event Details</h1>}

      {eventRange.type === "specific" ? (
        <InfoRow label="Possible Dates">
          {formatDateRange(start.date, end.date)}
        </InfoRow>
      ) : (
        <InfoRow label="Days of the Week">
          <WeekdayRow startWeekday={start.weekday} endWeekday={end.weekday} />
        </InfoRow>
      )}

      <InfoRow label="Possible Times">
        {formatTimeRange(start.time, end.time)}
      </InfoRow>

      {eventRange.duration > 0 && (
        <InfoRow label="Intended Duration">
          {eventRange.duration} minutes
        </InfoRow>
      )}
    </section>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-400">{label}</div>
      <div className="text-accent">{children}</div>
    </div>
  );
}
