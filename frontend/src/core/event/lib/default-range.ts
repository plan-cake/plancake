import { SpecificDateRange, WeekdayRange } from "@/core/event/types";

const emptyRange = { from: null, to: null };

export const DEFAULT_RANGE_SPECIFIC: SpecificDateRange = {
  type: "specific" as const,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateRange: emptyRange,
  timeRange: emptyRange,
};

export const DEFAULT_RANGE_WEEKDAY: WeekdayRange = {
  type: "weekday" as const,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekdays: [],
  timeRange: emptyRange,
};
