import { AvailabilityState } from "@/core/availability/reducers/reducer";
import { MAX_DISPLAY_NAME_LENGTH } from "@/features/event/availability/constants";
import { MESSAGES } from "@/lib/messages";

export async function validateAvailabilityData(
  data: AvailabilityState,
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};
  const { displayName, userAvailability } = data;

  if (!displayName?.trim()) {
    errors.displayName = MESSAGES.ERROR_NAME_MISSING;
  } else if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    errors.displayName = MESSAGES.ERROR_NAME_LENGTH;
  }

  if (!userAvailability || userAvailability.size === 0) {
    errors.availability = MESSAGES.ERROR_AVAILABILITY_MISSING;
  }

  return errors;
}
