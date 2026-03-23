import { format, parse, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { EventType } from "@/core/event/types";

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

// Checks if two timezones are equivalent even if they represent different locations
// For example, "America/New_York" and "America/Detroit" are both Eastern Time
export function tzEqual(tz1: string, tz2: string): boolean {
  const now = new Date();
  return (
    formatInTimeZone(now, tz1, "yyyy-MM-dd'T'HH:mm:ssXXX") ===
    formatInTimeZone(now, tz2, "yyyy-MM-dd'T'HH:mm:ssXXX")
  );
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
  if (eventType === "specific") {
    return parseISO(slotIso + "Z");
  } else {
    const localIso = slotIso;
    return fromZonedTime(localIso, timezone);
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
export function formatDateRange(fromDate: string, toDate: string): string {
  const dateFormat = "MMMM d";
  const fromFormatted = formatDate(fromDate, dateFormat);
  const toFormatted = formatDate(toDate, dateFormat);

  if (fromDate === toDate) {
    return fromFormatted;
  } else if (fromDate.slice(0, 7) === toDate.slice(0, 7)) {
    const fromDay = parse(fromDate, "yyyy-MM-dd", new Date()).getDate();
    const toDay = parse(toDate, "yyyy-MM-dd", new Date()).getDate();
    const monthStr = formatDate(fromDate, "MMMM");
    return `${monthStr} ${fromDay}-${toDay}`;
  }
  return `${fromFormatted} - ${toFormatted}`;
}

// expects a date string in "YYYY-MM-DD" format and a format string
// returns the formatted date string
export function formatDate(date: string, fmt: string): string {
  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  return format(parsedDate, fmt);
}

/* TIME UTILS */

// expects two time strings in "HH:mm" format
// returns a formatted time range string.
// If the time range is the full day (00:00 - 24:00), it returns "All day".
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";

  if (startTime === "00:00" && endTime === "00:00") {
    return "All day";
  }

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

// expects a time string in "HH:mm" format
// returns the time formatted in "h:mm aaa" format (e.g., "2:30 PM")
export function formatTime(time: string): string {
  const parsedDate = parse(time, "HH:mm", new Date());
  return format(parsedDate, "h:mm aaa");
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
