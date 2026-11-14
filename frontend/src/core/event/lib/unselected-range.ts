import { EventRange } from "@/core/event/types";

/**
 * Checks if the given event range has unselected dates or times.
 *
 * @param eventRange The event range to check
 * @returns `true` if the event range has unselected dates or times, `false` otherwise
 */
export default function checkUnselectedRange(eventRange: EventRange) {
  const unselectedTimes =
    eventRange.timeRange.from === null || eventRange.timeRange.to === null;

  if (eventRange.type === "specific") {
    if (!eventRange.dates.size || unselectedTimes) {
      return true;
    }
  } else if (eventRange.type === "weekday") {
    if (!eventRange.weekdays.size || unselectedTimes) {
      return true;
    }
  } else {
    if (!eventRange.dates.size) {
      return true;
    }
  }
  return false;
}
