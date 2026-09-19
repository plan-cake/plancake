export type CalendarGridMonth = {
  month: string;
  activeDays: Set<string>;
};

export type CalendarGridDayDisplay = "empty" | "disabled" | "active";
