import { EventRange } from "@/core/event/types";

/**
 * Checks if the given event range has unselected dates or times.
 *
 * @param eventRange The event range to check
 * @returns `true` if the event range has unselected dates or times, `false` otherwise
 */
export default function checkUnselectedRange(eventRange: EventRange) {
  if (eventRange.type === "specific") {
    if (
      eventRange.dateRange.from === null ||
      eventRange.dateRange.to === null
    ) {
      return true;
    }
  } else {
    if (eventRange.weekdays.length === 0) {
      return true;
    }
  }
  if (eventRange.timeRange.from === null || eventRange.timeRange.to === null) {
    return true;
  }
  return false;
}
