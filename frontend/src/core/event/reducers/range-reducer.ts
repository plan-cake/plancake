// import { format, addDays, differenceInCalendarDays, parseISO } from "date-fns";
// import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import {
  DEFAULT_RANGE_SPECIFIC,
  DEFAULT_RANGE_WEEKDAY,
} from "@/core/event/lib/default-range";
import { EventRange, EventType, Weekday } from "@/core/event/types";

export type EventRangeAction =
  | { type: "SET_RANGE_INFO"; payload: EventRange }
  | { type: "SET_RANGE_TYPE"; payload: EventType }
  | { type: "SET_DATE_RANGE"; payload: { from: string; to: string } }
  | { type: "SET_START_TIME"; payload: string }
  | { type: "SET_END_TIME"; payload: string }
  | { type: "SET_WEEKDAYS"; payload: Weekday[] }
  | { type: "SET_DURATION"; payload: number }
  | { type: "SET_TIMEZONE"; payload: string }
  | { type: "RESET" };

export function EventRangeReducer(
  state: EventRange,
  action: EventRangeAction,
): EventRange {
  switch (action.type) {
    case "SET_RANGE_INFO": {
      return {
        ...action.payload,
      };
    }

    case "SET_RANGE_TYPE": {
      if (action.payload === state.type) {
        return state;
      }

      const baseEvent = {
        duration: state.duration,
        timezone: state.timezone,
        timeRange: state.timeRange,
      };

      if (action.payload === "specific") {
        return {
          ...baseEvent,
          type: "specific",
          dateRange: DEFAULT_RANGE_SPECIFIC.dateRange,
        };
      } else {
        return {
          ...baseEvent,
          type: "weekday",
          weekdays: DEFAULT_RANGE_WEEKDAY.weekdays,
        };
      }
    }

    case "SET_DATE_RANGE": {
      if (state.type !== "specific") {
        return state;
      }

      return {
        ...state,
        dateRange: {
          from: action.payload.from,
          to: action.payload.to,
        },
      };
    }

    case "SET_START_TIME": {
      return {
        ...state,
        timeRange: {
          from: action.payload,
          to: state.timeRange.to,
        },
      };
    }

    case "SET_END_TIME": {
      return {
        ...state,
        timeRange: {
          from: state.timeRange.from,
          to: action.payload,
        },
      };
    }

    case "SET_WEEKDAYS": {
      if (state.type !== "weekday") {
        return state;
      }

      return {
        ...state,
        weekdays: action.payload,
      };
    }

    case "SET_DURATION": {
      return {
        ...state,
        duration: action.payload,
      };
    }

    case "SET_TIMEZONE": {
      const newTz = action.payload;

      // Logic: If Specific Date, ensure the Start Time is not in the past in the new TZ.
      // If it is, shift the dates forward so they are valid.
      // if (state.type === "specific") {
      //   const { dateRange, timeRange } = state;
      //   const now = new Date();

      //   // 1. Interpret existing "Wall Time" in the New Timezone
      //   // e.g., "2025-01-11 09:00" interpreted as Shanghai Time
      //   const wallStartIso = `${dateRange.from}T${timeRange.from}`;
      //   const startInNewZone = fromZonedTime(wallStartIso, newTz);

      //   // 2. Check if that time has already passed
      //   if (startInNewZone < now) {
      //     // 3. Find "Today" and "Tomorrow" in the new timezone
      //     const todayInNewZoneStr = formatInTimeZone(now, newTz, "yyyy-MM-dd");

      //     // Check if we can still make it "Today" (is Now < 9am Today in New Zone?)
      //     const potentialStartToday = fromZonedTime(
      //       `${todayInNewZoneStr}T${timeRange.from}`,
      //       newTz,
      //     );

      //     let newStartDateStr = todayInNewZoneStr;

      //     if (potentialStartToday < now) {
      //       // 9am Today has passed. Move to Tomorrow.
      //       const tomorrow = addDays(parseISO(todayInNewZoneStr), 1);
      //       newStartDateStr = format(tomorrow, "yyyy-MM-dd");
      //     }

      //     // 4. Calculate existing duration to preserve it
      //     const oldStart = parseISO(dateRange.from);
      //     const oldEnd = parseISO(dateRange.to);
      //     const daysLength = differenceInCalendarDays(oldEnd, oldStart);

      //     // 5. Construct new range
      //     const newStart = parseISO(newStartDateStr);
      //     const newEnd = addDays(newStart, daysLength);

      //     return {
      //       ...state,
      //       timezone: newTz,
      //       dateRange: {
      //         from: format(newStart, "yyyy-MM-dd"),
      //         to: format(newEnd, "yyyy-MM-dd"),
      //       },
      //     };
      //   }
      // }

      // Default behavior: just update the string
      return {
        ...state,
        timezone: newTz,
      };
    }

    case "RESET": {
      if (state.type === "specific") {
        return DEFAULT_RANGE_SPECIFIC;
      } else {
        return DEFAULT_RANGE_WEEKDAY;
      }
    }

    default:
      return state;
  }
}
