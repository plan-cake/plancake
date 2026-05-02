import { ResultsAvailabilityMap } from "@/core/availability/types";
import { hasMutualAvailability } from "@/features/event/results/lib/utils";
import { Banner } from "@/features/system-feedback/banner/base";
import { MESSAGES } from "@/lib/messages";
import { AllAvailability } from "@/lib/utils/api/types";

export function getResultBanner(
  availabilities: ResultsAvailabilityMap,
  participants: AllAvailability["participants"],
  timeslots: Date[],
  isWeekEvent: boolean,
  participated: boolean,
): { element: React.ReactNode; id: string | null } {
  if (
    !isWeekEvent &&
    timeslots.length > 0 &&
    timeslots[timeslots.length - 1] < new Date()
  ) {
    return {
      element: (
        <Banner type="info" subtitle={MESSAGES.INFO_EVENT_PASSED} showPing />
      ),
      id: "event-passed",
    };
  } else if (participants.length === 0) {
    return {
      element: (
        <Banner
          type="info"
          subtitle="No one has submitted availability!"
          showPing
        >
          <p className="md:hidden">{MESSAGES.INFO_ADD_AVAILABILITY_MOBILE}</p>
          <p className="hidden md:block">{MESSAGES.INFO_ADD_AVAILABILITY}</p>
        </Banner>
      ),
      id: "no-participants",
    };
  } else if (!hasMutualAvailability(availabilities, participants)) {
    return {
      element: (
        <Banner type="info" subtitle="Oh dear :(" showPing>
          <p>{MESSAGES.INFO_NO_MUTUAL_AVAILABILITY}</p>
        </Banner>
      ),
      id: "no-mutual-availability",
    };
  } else if (participated && participants.length === 1) {
    return {
      element: (
        <Banner type="info" subtitle="Waiting for others..." showPing>
          <p>{MESSAGES.INFO_COPY_SHARE_LINK}</p>
        </Banner>
      ),
      id: "share-link",
    };
  } else if (!participated) {
    return {
      element: (
        <Banner type="info" subtitle="Don't be a stranger!" showPing>
          <p className="md:hidden">{MESSAGES.INFO_ADD_AVAILABILITY_MOBILE}</p>
          <p className="hidden md:block">{MESSAGES.INFO_ADD_AVAILABILITY}</p>
        </Banner>
      ),
      id: "add-availability",
    };
  }

  return { element: null, id: null };
}
