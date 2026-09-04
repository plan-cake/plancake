import { parse } from "date-fns";

import { ALL_WEEKDAYS, EventRange, Weekday } from "@/core/event/types";
import { EventDetails } from "@/lib/utils/api/types";
import {
  getTimezoneDetails,
  parseIsoDateTime,
} from "@/lib/utils/date-time-format";

export function processEventData(eventData: EventDetails): {
  eventName: string;
  eventRange: EventRange;
  timeslots: Date[];
  isCreator: boolean;
} {
  // If a calendar event, skip all the time zone processing
  if (eventData.event_type === "Calendar") {
    const dateSet = new Set<string>(eventData.dates);
    const eventRange: EventRange = {
      type: "calendar",
      timezone: eventData.time_zone,
      dates: dateSet,
      timeRange: {
        from: eventData.start_time,
        to: eventData.end_time,
      },
    };
    return {
      eventName: eventData.title,
      eventRange,
      timeslots: eventData.timeslots.map((ts) =>
        parse(ts, "yyyy-MM-dd'T'HH:mm:ss", new Date()),
      ),
      isCreator: eventData.is_creator,
    };
  }

  const isWeekEvent = eventData.event_type !== "Date";

  const timeslots: Date[] = eventData.timeslots.map((ts) => {
    return parseIsoDateTime(
      ts,
      eventData.time_zone,
      isWeekEvent ? "weekday" : "specific",
    );
  });

  let eventRange: EventRange;

  // Get all the event range data from the timeslots
  const dates = new Set<string>();
  const weekdays = new Set<Weekday>();
  let startTime: string | null = null;
  let endTime: string | null = null;
  timeslots.forEach((ts) => {
    const [tsDate, tsTime] = ts.toISOString().split("T");
    const { date, time, weekday } = getTimezoneDetails({
      date: tsDate,
      time: tsTime,
      // Don't include fromTZ, since week events are already converted from the event's
      // timezone above in parseIsoDateTime
      toTZ: eventData.time_zone,
    });
    dates.add(date);
    weekdays.add(ALL_WEEKDAYS[weekday]);
    if (!startTime || time < startTime) {
      startTime = time;
    }
    if (!endTime || time > endTime) {
      endTime = time;
    }
  });

  // Move endTime ahead by 15 minutes and intentionally allow 23:45 to move to 24:00 to
  // represent the second midnight of the day
  const [endHour, endMinute] = endTime!.split(":").map(Number);
  if (endMinute === 45) {
    endTime = `${String(endHour + 1).padStart(2, "0")}:00`;
  } else {
    endTime = `${String(endHour).padStart(2, "0")}:${String(
      endMinute + 15,
    ).padStart(2, "0")}`;
  }

  if (eventData.event_type === "Date") {
    eventRange = {
      type: "specific",
      timezone: eventData.time_zone,
      dates: dates,
      timeRange: {
        from: startTime,
        to: endTime,
      },
    };
  } else {
    eventRange = {
      type: "weekday",
      timezone: eventData.time_zone,
      weekdays: weekdays,
      timeRange: {
        from: startTime,
        to: endTime,
      },
    };
  }

  return {
    eventName: eventData.title,
    eventRange,
    timeslots,
    isCreator: eventData.is_creator,
  };
}
