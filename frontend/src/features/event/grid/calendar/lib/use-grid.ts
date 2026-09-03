import { useMemo } from "react";

import { format } from "date-fns-tz";

import { MESSAGES } from "@/lib/messages";

const EMPTY_WEEK_BLOCK = [null, null, null, null, null, null, null];

type Week = {
  weekStart: string;
  days: (string | null)[];
};

export default function useCalendarGridInfo(timeslots: Date[]) {
  // Organize into weekblocks
  return useMemo(() => {
    if (!timeslots || timeslots.length === 0)
      return {
        weekBlocks: [] as (string | null)[][][],
        error: MESSAGES.ERROR_EVENT_RANGE_INVALID,
      };

    const sortedDates = timeslots.sort();

    const weeks = {} as Record<string, Week>;
    for (const date of sortedDates) {
      const dayOfWeek = new Date(date).getDay();
      const weekStart = getWeekStart(new Date(date));

      if (!weeks[weekStart]) {
        weeks[weekStart] = { weekStart, days: [...EMPTY_WEEK_BLOCK] };
      }
      const currentBlock = weeks[weekStart];
      currentBlock.days[dayOfWeek] = format(date, "yyyy-MM-dd");
    }

    const sortedWeeks = Object.values(weeks).sort((a, b) =>
      a.weekStart < b.weekStart ? -1 : 1,
    );

    const weekBlocks: (string | null)[][][] = [];
    let currentWeekBlock = [sortedWeeks[0].days];
    for (let i = 1; i < sortedWeeks.length; i++) {
      const week = sortedWeeks[i];
      const weekStart = new Date(week.weekStart);
      const prevWeekStart = new Date(sortedWeeks[i - 1].weekStart);
      const dateDiff =
        (Date.UTC(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate(),
        ) -
          Date.UTC(
            prevWeekStart.getFullYear(),
            prevWeekStart.getMonth(),
            prevWeekStart.getDate(),
          )) /
        (1000 * 60 * 60 * 24);

      if (dateDiff > 7) {
        weekBlocks.push(currentWeekBlock);
        currentWeekBlock = [week.days];
      } else {
        currentWeekBlock.push(week.days);
      }
    }
    weekBlocks.push(currentWeekBlock);

    return { weekBlocks, error: null };
  }, [timeslots]);
}

function getWeekStart(date: Date) {
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek;
  return format(new Date(date.setDate(diff)), "yyyy-MM-dd");
}
