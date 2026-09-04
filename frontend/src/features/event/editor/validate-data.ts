import { EventInformation } from "@/core/event/types";
import { MAX_DAYS, MAX_TITLE_LENGTH } from "@/features/event/editor/constants";
import { EventEditorType } from "@/features/event/editor/types";
import { MESSAGES } from "@/lib/messages";

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
  if (eventRange.type === "specific" || eventRange.type === "calendar") {
    if (!eventRange.dates.size) {
      errors.dateRange = MESSAGES.ERROR_EVENT_DATES_MISSING;
    } else {
      // check if there are more than 64 days selected
      if (eventRange.dates.size > MAX_DAYS) {
        errors.dateRange = MESSAGES.ERROR_EVENT_RANGE_TOO_LONG;
      }
    }
  }

  if (eventRange.type === "weekday") {
    if (!eventRange.weekdays.size) {
      errors.weekdayRange = MESSAGES.ERROR_EVENT_WEEKDAYS_MISSING;
    }
  }

  if (eventRange.type === "specific" || eventRange.type === "weekday") {
    // Validate time range
    if (!eventRange.timeRange.from || !eventRange.timeRange.to) {
      errors.timeRange = MESSAGES.ERROR_EVENT_TIMES_MISSING;
    } else if (
      !checkTimeRange(eventRange.timeRange.from, eventRange.timeRange.to)
    ) {
      errors.timeRange = MESSAGES.ERROR_EVENT_TIMES_INVALID;
    }
  }

  return errors;
}

export function checkDateRange(dates: Set<string>): boolean {
  return dates.size > MAX_DAYS;
}

export function checkTimeRange(startTime: string, endTime: string): boolean {
  if (endTime === "00:00") return true;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if (endHour > startHour) return true;
  if (endHour === startHour && endMinute > startMinute) return true;
  return false;
}
