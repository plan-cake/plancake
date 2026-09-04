import { differenceInCalendarMonths, format, parse, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { ALL_WEEKDAYS, EventType, Weekday } from "@/core/event/types";

/* TIMEZONE UTILS */

// expects a timezone value (e.g., "America/New_York") and returns
// its full label (e.g., "Eastern Daylight Time")
export function findTimezoneLabel(tzValue: string): string {
  return formatInTimeZone(new Date(), tzValue, "zzzz");
}

// Expects time and date strings along with optional source and target timezones
// Returns an object with time, date, and weekday number converted between timezones
// If there are no timezones provided, it assumes inputs are in UTC and returns them
// formatted in the local timezone.
type TimezoneDetailsInput = {
  time: string;
  date: string;
  fromTZ?: string;
  toTZ?: string;
};
export function getTimezoneDetails({
  time,
  date,
  fromTZ,
  toTZ,
}: TimezoneDetailsInput): { time: string; date: string; weekday: number } {
  let dateObj: Date;

  if (fromTZ) {
    const tzIso = `${date}T${time}`;
    dateObj = fromZonedTime(tzIso, fromTZ);
  } else {
    const utcIsoString = `${date}T${time}Z`;
    dateObj = parseISO(utcIsoString);
  }

  if (toTZ) {
    const convertedTime = formatInTimeZone(dateObj, toTZ, "HH:mm");
    const convertedDate = formatInTimeZone(dateObj, toTZ, "yyyy-MM-dd");
    const convertedWeekday = parseInt(formatInTimeZone(dateObj, toTZ, "i")) % 7; // 0-6 (Sun-Sat)
    return {
      time: convertedTime,
      date: convertedDate,
      weekday: convertedWeekday,
    };
  } else {
    return {
      time: format(dateObj, "HH:mm"),
      date: format(dateObj, "yyyy-MM-dd"),
      weekday: dateObj.getDay(),
    };
  }
}

// Expects a timeslot Date object, timezone string, and event type
// Returns an ISO string representation of the timeslot. If this is
// specific date event, it returns the standard ISO string. If it's a
// weekday event, then the ISO string will be formatted in the
// event's timezone.
export function timeslotToISOString(
  timeslot: Date,
  timezone: string,
  eventType: EventType,
): string {
  if (eventType === "specific") {
    return timeslot.toISOString();
  } else {
    return formatInTimeZone(timeslot, timezone, "yyyy-MM-dd'T'HH:mm:ss");
  }
}

/**
 * Converts a date string in "YYYY-MM-DD" format to an ISO string at midnight UTC.
 *
 * @param dateString A date string in "YYYY-MM-DD" format
 * @returns An ISO string representation of the date at midnight UTC.
 */
export function dateToISOString(dateString: string): string {
  return new Date(dateString + "T00:00Z").toISOString();
}

/**
 * Checks if two timezones are equivalent even if they represent different locations.
 *
 * For example, "America/New_York" and "America/Detroit" are equal because they are both
 * in Eastern Time.
 *
 * IMPORTANT: This function also checks if the timezones have the same DST rules by
 * comparing offsets in January and July.
 *
 * For example, "America/New_York" and "America/Caracas" are NOT equal because Caracas
 * does not observe DST, despite both having the same offset during part of the year.
 *
 * @param tz1 The first timezone to compare
 * @param tz2 The second timezone to compare
 * @returns `true` if the timezones are equivalent, `false` otherwise
 */
export function tzEqual(tz1: string, tz2: string): boolean {
  if (tz1 === tz2) return true;

  const currentYear = new Date().getUTCFullYear();
  const jan1 = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
  const jul1 = new Date(Date.UTC(currentYear, 6, 1, 0, 0, 0));

  const tz1OffsetJan = formatInTimeZone(jan1, tz1, "xxx");
  const tz1OffsetJul = formatInTimeZone(jul1, tz1, "xxx");
  const tz2OffsetJan = formatInTimeZone(jan1, tz2, "xxx");
  const tz2OffsetJul = formatInTimeZone(jul1, tz2, "xxx");

  return tz1OffsetJan === tz2OffsetJan && tz1OffsetJul === tz2OffsetJul;
}

/*
 * DATETIME CONVERSION UTILS
 * from python datetime string (ISO 8601) to Date object.
 *
 * Both function expect a datetime string without timezone information
 * (e.g., "2024-01-15T10:30:00"), the event's timezone, and event type.
 * If the event type is "specific", it appends "Z" to interpret it as UTC
 * and returns the corresponding Date object or string. If the event type
 * is "weekday", it interprets the datetime string in the event's timezone.
 */

// return Date object
export function parseIsoDateTime(
  slotIso: string,
  timezone: string,
  eventType: EventType,
): Date {
  if (eventType === "weekday") {
    const localIso = slotIso;
    return fromZonedTime(localIso, timezone);
  } else {
    return parseISO(slotIso + "Z");
  }
}

// return ISO string
export function formatDateTime(
  timeslot: string,
  timezone: string,
  eventType: EventType,
): string {
  return parseIsoDateTime(timeslot, timezone, eventType).toISOString();
}

/* DATE UTILS */

// expects two date strings in "YYYY-MM-DD" format
// returns a formatted date range string.
// If both dates are the same, return a single date. If both dates are
// in the same month, omit the month from the 'to' date. Otherwise, the
// full range is shown.
// If the dates are more than 11 months apart, the range will include years.
export function formatDateRange(fromDate: string, toDate: string): string {
  const dateFormat = "MMM d";
  const fromFormatted = formatDate(fromDate, dateFormat);
  const toFormatted = formatDate(toDate, dateFormat);
  const fromDateObj = parse(fromDate, "yyyy-MM-dd", new Date());
  const toDateObj = parse(toDate, "yyyy-MM-dd", new Date());
  const monthDiff = differenceInCalendarMonths(toDateObj, fromDateObj);

  if (fromDate === toDate) {
    return fromFormatted;
  } else if (fromDate.slice(0, 7) === toDate.slice(0, 7)) {
    const fromDay = formatDate(fromDate, "d");
    const toDay = formatDate(toDate, "d");
    const monthStr = formatDate(fromDate, "MMM");
    return `${monthStr} ${fromDay}-${toDay}`;
  } else if (monthDiff > 11) {
    return `${formatDate(fromDate, "MMM d, ''yy")} - ${formatDate(toDate, "MMM d, ''yy")}`;
  }
  return `${fromFormatted} - ${toFormatted}`;
}

// expects a date string in "YYYY-MM-DD" format and a format string
// returns the formatted date string
export function formatDate(date: string, fmt: string): string {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  return format(parsedDate, fmt);
}

/**
 * Formats an arbitrary set of dates into a readable string. The dates are not expected to
 * be contiguous, and the function will group them into ranges.
 *
 * @param dates A set of date strings in "YYYY-MM-DD" format
 * @returns A human-readable string representation of the date set, or null if empty
 */
export function formatDateSet(dates: Set<string>): string | null {
  if (dates.size === 0) return null;

  const sortedDates = Array.from(dates).sort((a, b) => (a < b ? -1 : 1));
  const dateObjects = Array.from(sortedDates).map((date) => parseISO(date));
  const firstDateObj = dateObjects[0];
  const lastDateObj = dateObjects[dateObjects.length - 1];
  const monthDiff = differenceInCalendarMonths(lastDateObj, firstDateObj);

  const groups = new Set<{ start: string; end: string }>();
  const months = new Set<string>();
  let rangeStart = firstDateObj;
  months.add(format(firstDateObj, "yyyy-MM"));

  for (let i = 1; i < dateObjects.length; i++) {
    const prevDate = dateObjects[i - 1];
    const currentDate = dateObjects[i];
    const diffInDays =
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      ) -
        Date.UTC(
          prevDate.getFullYear(),
          prevDate.getMonth(),
          prevDate.getDate(),
        )) /
      (1000 * 60 * 60 * 24);
    if (diffInDays !== 1) {
      groups.add({
        start: format(rangeStart, "yyyy-MM-dd"),
        end: format(prevDate, "yyyy-MM-dd"),
      });
      rangeStart = currentDate;
    }
    months.add(format(currentDate, "yyyy-MM"));
  }

  groups.add({
    start: format(rangeStart, "yyyy-MM-dd"),
    end: format(lastDateObj, "yyyy-MM-dd"),
  });

  const fallbackFormat = () =>
    `${sortedDates.length} days between ${formatDateRange(sortedDates[0], sortedDates[sortedDates.length - 1])}`;

  if (sortedDates.length === 1) {
    return formatDate(sortedDates[0], "MMM d");
  } else if (groups.size === 1) {
    return formatDateRange(sortedDates[0], sortedDates[sortedDates.length - 1]);
  } else if (months.size === 1 && groups.size <= 5) {
    return `${formatDate(sortedDates[0], "MMM")} ${Array.from(groups)
      .map((group) => {
        if (group.start === group.end) return formatDate(group.start, "d");
        return `${formatDate(group.start, "d")}-${formatDate(group.end, "d")}`;
      })
      .join(", ")}`;
  } else if (monthDiff > 11) {
    return fallbackFormat();
  } else if (groups.size <= 3) {
    return Array.from(groups)
      .map((group) => {
        return formatDateRange(group.start, group.end);
      })
      .join(", ");
  } else {
    return fallbackFormat();
  }
}

/* WEEKDAY UTILS */

/**
 * Returns the full name of a weekday given its abbreviation.
 *
 * @param abbrev A weekday abbreviation (from the Weekday type)
 * @returns The full name of the weekday
 */
export function getFullWeekdayName(abbrev: Weekday): string {
  switch (abbrev) {
    case "Tue":
      return "Tuesday";
    case "Wed":
      return "Wednesday";
    case "Thu":
      return "Thursday";
    case "Sat":
      return "Saturday";
    default:
      return abbrev + "day";
  }
}

export function formatWeekdaySet(weekdays: Set<Weekday>): string | null {
  if (weekdays.size === 0) {
    return null;
  } else if (weekdays.size === 7) {
    return "All Week";
  } else if (
    weekdays.size === 2 &&
    weekdays.has("Sat") &&
    weekdays.has("Sun")
  ) {
    return "Weekends";
  } else if (
    weekdays.size === 5 &&
    !weekdays.has("Sat") &&
    !weekdays.has("Sun")
  ) {
    return "Weekdays";
  } else if (weekdays.size === 6) {
    const lastDay = ALL_WEEKDAYS.filter((day) => !weekdays.has(day))[0];
    return "All days except " + getFullWeekdayName(lastDay);
  }

  const dayGroups = [];
  let currentGroup: Weekday[] = [];
  for (const day of ALL_WEEKDAYS) {
    if (weekdays.has(day)) {
      currentGroup.push(day);
    } else if (currentGroup.length > 0) {
      dayGroups.push(currentGroup);
      currentGroup = [];
    }
  }
  if (currentGroup.length > 0) {
    dayGroups.push(currentGroup);
  }

  return dayGroups
    .map((group) => {
      if (group.length === 1) {
        return group[0];
      } else {
        return group[0] + " - " + group[group.length - 1];
      }
    })
    .join(", ");
}

/* TIME UTILS */

// expects two time strings in "HH:mm" format
// returns a formatted time range string.
// If the time range is the full day (00:00 - 24:00), it returns "All day".
export function formatTimeRange(
  startTime: string,
  endTime: string,
): { display: string; pastMidnight: boolean } {
  if (!startTime || !endTime) return { display: "", pastMidnight: false };

  let pastMidnight = false;

  if (startTime === "00:00" && endTime === "00:00") {
    return { display: "All day", pastMidnight: false };
  } else if (endTime <= startTime) {
    pastMidnight = true;
  }

  const sameMeridiem =
    format(parse(startTime, "HH:mm", new Date()), "a") ===
    format(parse(endTime, "HH:mm", new Date()), "a");

  return {
    display: `${formatTime(startTime, !sameMeridiem || pastMidnight)} - ${formatTime(endTime)}`,
    pastMidnight,
  };
}

/**
 * Formats a time to a minimal representation.
 *
 * If the time is exactly on the hour, it will be formatted as "haaa" (e.g., "2pm").
 *
 * If the time is not on the hour, it will be formatted as "h:mmaaa" (e.g., "2:30pm").
 *
 * The meridiem (AM/PM) is included by default, but can be excluded by setting
 * `includeMeridiem` to false.
 *
 * @param time A time string in "HH:mm" format
 * @param includeMeridiem Whether to include the meridiem (AM/PM). Defaults to true.
 * @returns A string of the formatted time.
 */
export function formatTime(
  time: string,
  includeMeridiem: boolean = true,
): string {
  const parsedDate = parse(time, "HH:mm", new Date());
  if (time.endsWith(":00")) {
    return format(parsedDate, `h${includeMeridiem ? "aaa" : ""}`);
  } else {
    return format(parsedDate, `h:mm${includeMeridiem ? "aaa" : ""}`);
  }
}

// expects a time string in "HH:mm" (24-hour) format
// returns the time converted to "hh:mm AM/PM" (12-hour) format
export function convert24To12(time24: string): string {
  if (!time24) return "";

  const date = parse(time24, "HH:mm", new Date());
  return format(date, "hh:mm a");
}

// expects a time string in "hh:mm AM/PM" (12-hour) format
// returns the time converted to "HH:mm" (24-hour) format
export function convert12To24(time12: string): string {
  if (!time12) return "";

  const date = parse(time12, "hh:mm a", new Date());
  return format(date, "HH:mm");
}
