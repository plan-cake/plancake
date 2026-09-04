type CalendarGridWeekDay = {
  dayString: string;
  exists: boolean;
  firstOfMonth: boolean;
};

export type CalendarGridWeek = {
  weekStart: string;
  days: [
    CalendarGridWeekDay,
    CalendarGridWeekDay,
    CalendarGridWeekDay,
    CalendarGridWeekDay,
    CalendarGridWeekDay,
    CalendarGridWeekDay,
    CalendarGridWeekDay,
  ];
};
