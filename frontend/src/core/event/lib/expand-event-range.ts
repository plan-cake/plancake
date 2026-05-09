import {
  addDays,
  addMinutes,
  eachDayOfInterval,
  endOfWeek,
  format,
  getDay,
  isBefore,
  parseISO,
  startOfWeek,
} from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import checkUnselectedRange from "@/core/event/lib/unselected-range";
import {
  ALL_WEEKDAYS,
  EventRange,
  SpecificDateRange,
  WeekdayRange,
} from "@/core/event/types";
import { checkDateRange } from "@/features/event/editor/validate-data";

/* EXPAND EVENT RANGE UTILITIES */

/**
 * Generates 15-minute slots between two absolute UTC times.
 * range: [start, end)
 */
function generateSlotsBetween(startUTC: Date, endUTC: Date): Date[] {
  const slots: Date[] = [];
  let current = startUTC;

  while (isBefore(current, endUTC)) {
    slots.push(new Date(current));
    current = addMinutes(current, 15);
  }
  return slots;
}

/**
 * Constructs the absolute Start and End UTC times for a specific "calendar day"
 * in the target timezone, given the hour constraints.
 */
function getDailyBoundariesInUTC(
  dateIsoStr: string, // "YYYY-MM-DD"
  timezone: string,
  timeRange: { from: string; to: string },
) {
  // Construct ISO strings for the target timezone
  const startStr = `${dateIsoStr}T${timeRange.from}:00`;
  const startUTC = fromZonedTime(startStr, timezone);

  let endUTC: Date;
  if (timeRange.to === "00:00" || timeRange.to === "24:00") {
    const dateObj = parseISO(dateIsoStr);
    const nextDay = addDays(dateObj, 1);
    const nextDayStr = nextDay.toISOString().split("T")[0];
    endUTC = fromZonedTime(`${nextDayStr}T00:00:00`, timezone);
  } else {
    const endStr = `${dateIsoStr}T${timeRange.to}:00`;
    endUTC = fromZonedTime(endStr, timezone);
  }

  return { startUTC, endUTC };
}

/**
 * Expands a high-level EventRange into a concrete list of UTC time slots,
 * generated based on the event's timezone constraints.
 */
export function expandEventRange(range: EventRange): Date[] {
  if (range.type === "specific") {
    return generateSlotsForSpecificRange(range);
  } else {
    return generateSlotsForWeekdayRange(range);
  }
}

function generateSlotsForSpecificRange(range: SpecificDateRange): Date[] {
  if (checkUnselectedRange(range)) return [];

  // Validate Duration
  const startDate = parseISO(range.dateRange.from!.split("T")[0]);
  const endDate = parseISO(range.dateRange.to!.split("T")[0]);

  if (checkDateRange(startDate, endDate)) {
    return [];
  }

  // Generate Slots
  const slots: Date[] = [];
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nonNullTimeRange = {
    from: range.timeRange.from!,
    to: range.timeRange.to!,
  };

  for (const day of days) {
    const dayStr = format(day, "yyyy-MM-dd");

    const { startUTC, endUTC } = getDailyBoundariesInUTC(
      dayStr,
      range.timezone,
      nonNullTimeRange,
    );

    slots.push(...generateSlotsBetween(startUTC, endUTC));
  }

  return slots;
}

function generateSlotsForWeekdayRange(range: WeekdayRange): Date[] {
  if (range.type !== "weekday") return [];
  if (checkUnselectedRange(range)) return [];

  const slots: Date[] = [];
  const referenceDate = new Date();

  const startOfCurrentWeek = startOfWeek(referenceDate, { weekStartsOn: 0 });
  const endOfCurrentWeek = endOfWeek(referenceDate, { weekStartsOn: 0 });

  const days = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: endOfCurrentWeek,
  });

  const nonNullTimeRange = {
    from: range.timeRange.from!,
    to: range.timeRange.to!,
  };

  for (const currentDay of days) {
    const currentDayIndex = getDay(currentDay);
    const dayName = ALL_WEEKDAYS[currentDayIndex];

    if (range.weekdays.includes(dayName)) {
      const dayStr = format(currentDay, "yyyy-MM-dd");

      const { startUTC, endUTC } = getDailyBoundariesInUTC(
        dayStr,
        range.timezone,
        nonNullTimeRange,
      );

      slots.push(...generateSlotsBetween(startUTC, endUTC));
    }
  }

  return slots;
}
