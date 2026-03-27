import { EventInformation, WeekdayRange } from "@/core/event/types";
import { findRangeFromWeekdayArray } from "@/core/event/weekday-utils";
import { EventEditorType } from "@/features/event/editor/types";
import { MESSAGES } from "@/lib/messages";

export const MAX_DURATION_MS = 64 * 24 * 60 * 60 * 1000;
export const MAX_DURATION = "64 days";

export const MAX_TITLE_LENGTH = 50;

export async function validateEventData(
  editorType: EventEditorType,
  data: EventInformation,
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};
  const { title, eventRange } = data;

  // Validate title
  if (!title?.trim()) {
    errors.title = MESSAGES.ERROR_EVENT_NAME_MISSING;
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = MESSAGES.ERROR_EVENT_NAME_LENGTH;
  }

  // Validate event range
  if (eventRange.type === "specific") {
    if (!eventRange.dateRange?.from || !eventRange.dateRange?.to) {
      errors.dateRange = MESSAGES.ERROR_EVENT_RANGE_INVALID;
    } else {
      // check if the date range is more than 64 days
      const fromDate = new Date(eventRange.dateRange.from);
      const toDate = new Date(eventRange.dateRange.to);
      if (checkDateRange(fromDate, toDate)) {
        errors.dateRange = MESSAGES.ERROR_EVENT_RANGE_TOO_LONG;
      }
    }
  }

  if (eventRange.type === "weekday") {
    const weekdayRange = findRangeFromWeekdayArray(
      (data.eventRange as WeekdayRange).weekdays,
    );
    if (weekdayRange.startDay === null || weekdayRange.endDay === null) {
      errors.weekdayRange = MESSAGES.ERROR_EVENT_RANGE_INVALID;
    }
  }

  // Validate time range
  if (!checkTimeRange(eventRange.timeRange.from, eventRange.timeRange.to)) {
    errors.timeRange = MESSAGES.ERROR_EVENT_RANGE_INVALID;
  }

  return errors;
}

export function checkDateRange(
  start: Date | undefined,
  end: Date | undefined,
): boolean {
  if (start && end) {
    const diffTime = end.getTime() - start.getTime();
    return diffTime > MAX_DURATION_MS;
  }
  return false;
}

export function checkTimeRange(startTime: string, endTime: string): boolean {
  if (endTime === "00:00") return true;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if (endHour > startHour) return true;
  if (endHour === startHour && endMinute > startMinute) return true;
  return false;
}
