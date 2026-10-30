import { useMemo } from "react";

import { addDays } from "date-fns";
import { format } from "date-fns-tz";

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

    const sortedDates = timeslots.sort((a, b) => a.getTime() - b.getTime());

    const months = {} as Record<string, CalendarGridMonth>;
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    for (let currentDate = firstDate; currentDate <= lastDate;) {
      const monthString = format(currentDate, "yyyy-MM");
      if (!months[monthString]) {
        months[monthString] = {
          month: monthString,
          activeDays: new Set<string>(),
        };
      }
      currentDate = addDays(currentDate, 1);
    }

    for (const date of sortedDates) {
      const monthString = format(date, "yyyy-MM");
      months[monthString].activeDays.add(format(date, "yyyy-MM-dd"));
    }

    return { monthBlocks: Object.values(months), error: null };
  }, [timeslots]);
}
