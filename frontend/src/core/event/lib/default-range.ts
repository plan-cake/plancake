import {
  CalendarRange,
  SpecificDateRange,
  Weekday,
  WeekdayRange,
} from "@/core/event/types";

const emptyRange = { from: null, to: null };

export const DEFAULT_RANGE_SPECIFIC: SpecificDateRange = {
  type: "specific" as const,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dates: new Set<string>(),
  timeRange: emptyRange,
};

export const DEFAULT_RANGE_WEEKDAY: WeekdayRange = {
  type: "weekday" as const,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekdays: new Set<Weekday>(),
  timeRange: emptyRange,
};

export const DEFAULT_RANGE_CALENDAR: CalendarRange = {
  type: "calendar" as const,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dates: new Set<string>(),
  timeRange: emptyRange,
};
