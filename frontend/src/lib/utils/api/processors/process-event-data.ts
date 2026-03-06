import { EventRange } from "@/core/event/types";
import { createWeekdayArray } from "@/core/event/weekday-utils";
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
  const isWeekEvent = eventData.event_type !== "Date";

  const eventName: string = eventData.title;
  const timeslots: Date[] = eventData.timeslots.map((ts) => {
    return parseIsoDateTime(
      ts,
      eventData.time_zone,
      isWeekEvent ? "weekday" : "specific",
    );
  });

  let eventRange: EventRange;

  const start = getTimezoneDetails({
    time: eventData.start_time,
    date: eventData.start_date!,
    fromTZ: isWeekEvent ? eventData.time_zone : undefined,
    toTZ: eventData.time_zone,
  });

  const end = getTimezoneDetails({
    time: eventData.end_time,
    date: eventData.end_date!,
    fromTZ: isWeekEvent ? eventData.time_zone : undefined,
    toTZ: eventData.time_zone,
  });

  if (eventData.event_type === "Date") {
    eventRange = {
      type: "specific",
      duration: eventData.duration || 0,
      timezone: eventData.time_zone,
      dateRange: {
        from: start.date,
        to: end.date,
      },
      timeRange: {
        from: start.time,
        to: end.time,
      },
    };
  } else {
    const weekdays = createWeekdayArray(start.weekday, end.weekday);
    eventRange = {
      type: "weekday",
      duration: eventData.duration || 0,
      timezone: eventData.time_zone,
      weekdays: weekdays,
      timeRange: {
        from: start.time,
        to: end.time,
      },
    };
  }

  return { eventName, eventRange, timeslots, isCreator: eventData.is_creator };
}
