import { useMemo } from "react";

import { format } from "date-fns-tz";

import { CalendarGridWeek } from "@/features/event/grid/calendar/types";
import { MESSAGES } from "@/lib/messages";

function createWeek(weekStart: Date): CalendarGridWeek {
  const days: string[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(currentDate.getDate() + i);
    const dayString = format(currentDate, "yyyy-MM-dd");
    days[i] = dayString;
  }

  const weekDays: CalendarGridWeek["days"] = [
    { dayString: days[0], exists: false, firstOfMonth: false },
    { dayString: days[1], exists: false, firstOfMonth: false },
    { dayString: days[2], exists: false, firstOfMonth: false },
    { dayString: days[3], exists: false, firstOfMonth: false },
    { dayString: days[4], exists: false, firstOfMonth: false },
    { dayString: days[5], exists: false, firstOfMonth: false },
    { dayString: days[6], exists: false, firstOfMonth: false },
  ];

  return {
    weekStart: format(weekStart, "yyyy-MM-dd"),
    days: weekDays,
  };
}

export default function useCalendarGridInfo(timeslots: Date[]) {
  // Organize into weekblocks
  return useMemo(() => {
    if (!timeslots || timeslots.length === 0)
      return {
        weekBlocks: [] as CalendarGridWeek[][],
        error: MESSAGES.ERROR_EVENT_RANGE_INVALID,
      };

    const sortedDates = timeslots.sort((a, b) => a.getTime() - b.getTime());

    const weeks = {} as Record<string, CalendarGridWeek>;
    const months = new Set<string>();
    for (const date of sortedDates) {
      const weekStart = getWeekStart(new Date(date));
      const weekStartString = format(weekStart, "yyyy-MM-dd");

      if (!weeks[weekStartString]) {
        weeks[weekStartString] = createWeek(weekStart);
      }
      const currentBlock = weeks[weekStartString];
      const dayBlock = currentBlock.days[date.getDay()];
      const monthString = format(date, "yyyy-MM");
      const newMonth = !months.has(monthString);
      months.add(monthString);
      dayBlock.exists = true;
      dayBlock.firstOfMonth = newMonth;
    }

    const sortedWeeks = Object.values(weeks).sort((a, b) =>
      a.weekStart < b.weekStart ? -1 : 1,
    );

    const weekBlocks: CalendarGridWeek[][] = [];
    let currentWeekBlock = [sortedWeeks[0]];
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
        currentWeekBlock = [week];
      } else {
        currentWeekBlock.push(week);
      }
    }
    weekBlocks.push(currentWeekBlock);

    return { weekBlocks, error: null };
  }, [timeslots]);
}

function getWeekStart(date: Date) {
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek;
  return new Date(date.setDate(diff));
}
