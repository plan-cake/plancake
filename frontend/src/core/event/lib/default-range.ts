import { format } from "date-fns";

import { SpecificDateRange, WeekdayRange } from "@/core/event/types";

const defaultTimeRange = { from: "09:00", to: "17:00" };

export const DEFAULT_RANGE_SPECIFIC: SpecificDateRange = {
  type: "specific" as const,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateRange: {
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  },

  timeRange: defaultTimeRange,
};

export const DEFAULT_RANGE_WEEKDAY: WeekdayRange = {
  type: "weekday" as const,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekdays: ["Mon", "Tue", "Wed"],
  timeRange: defaultTimeRange,
};
