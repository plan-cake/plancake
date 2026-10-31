import { useMemo } from "react";

import { formatInTimeZone } from "date-fns-tz";

import { CalendarGridMonth } from "@/features/event/grid/calendar/types";
import { MESSAGES } from "@/lib/messages";

export default function useCalendarGridInfo(timeslots: Date[]) {
  // Organize into weekblocks
  return useMemo(() => {
    if (!timeslots || timeslots.length === 0)
      return {
        monthBlocks: [] as CalendarGridMonth[],
        error: MESSAGES.ERROR_EVENT_RANGE_INVALID,
      };

    const sortedDates = [...timeslots].sort(
      (a, b) => a.getTime() - b.getTime(),
    );

    const months = {} as Record<string, CalendarGridMonth>;
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    // Calendar dates are represented as UTC midnight, so format and step in UTC
    for (let currentDate = firstDate; currentDate <= lastDate; ) {
      const monthString = formatInTimeZone(currentDate, "UTC", "yyyy-MM");
      if (!months[monthString]) {
        months[monthString] = {
          month: monthString,
          activeDays: new Set<string>(),
        };
      }
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    for (const date of sortedDates) {
      const monthString = formatInTimeZone(date, "UTC", "yyyy-MM");
      months[monthString].activeDays.add(
        formatInTimeZone(date, "UTC", "yyyy-MM-dd"),
      );
    }

    return { monthBlocks: Object.values(months), error: null };
  }, [timeslots]);
}
