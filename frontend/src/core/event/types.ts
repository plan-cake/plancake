// app/_types/schedule.ts

export type EventInformation = {
  title: string;
  customCode: string;
  eventRange: EventRange;
  originalEventRange?: EventRange; // only used for editing, to compare against changes
  timeslots: Date[];
};

// discriminated union for event ranges - this is your single source of truth
export type EventRange = SpecificDateRange | WeekdayRange;

// represents selected weekdays
export type Weekday = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
export const ALL_WEEKDAYS: Weekday[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

/* EVENT RANGE MODELS */

export type SpecificDateRange = {
  type: "specific";
  duration: number;
  timezone: string;
  dateRange: {
    from: string;
    to: string;
  };
  timeRange: {
    from: string;
    to: string;
  };
};

export type WeekdayRange = {
  type: "weekday";
  duration: number;
  timezone: string;
  weekdays: Weekday[];
  timeRange: {
    from: string;
    to: string;
  };
};

/* SLOTS TYPES FOR UI */
// these types are generated from the core models above for rendering

export type DaySlot = {
  date: Date; // date for the entire day
  dayLabel: string; // e.g., "MON MAY 10"
  dayKey: string; // e.g., "2025-05-10"
  timeslots: Date[];
};
