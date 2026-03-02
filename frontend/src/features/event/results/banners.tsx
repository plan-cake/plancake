import { ResultsAvailabilityMap } from "@/core/availability/types";
import { hasMutualAvailability } from "@/features/event/results/utils";
import { Banner } from "@/features/system-feedback/banner/base";
import { MESSAGES } from "@/lib/messages";

export function getResultBanners(
  availabilities: ResultsAvailabilityMap,
  participants: string[],
  timeslots: Date[],
  isWeekEvent: boolean,
  participated: boolean,
) {
  if (
    !isWeekEvent &&
    timeslots.length > 0 &&
    timeslots[timeslots.length - 1] < new Date()
  ) {
    return (
      <Banner type="info" subtitle={MESSAGES.INFO_EVENT_PASSED} showPing />
    );
  } else if (participants.length === 0) {
    return (
      <Banner
        type="info"
        subtitle="No one has submitted availability!"
        showPing
      >
        <p>{MESSAGES.INFO_ADD_AVAILABILITY}</p>
      </Banner>
    );
  } else if (participated && participants.length === 1) {
    return (
      <Banner type="info" subtitle="Waiting for others..." showPing>
        <p>{MESSAGES.INFO_COPY_SHARE_LINK}</p>
      </Banner>
    );
  } else if (!participated) {
    return (
      <Banner type="info" subtitle="Don't be a stranger!" showPing>
        <p>{MESSAGES.INFO_ADD_AVAILABILITY}</p>
      </Banner>
    );
  } else if (!hasMutualAvailability(availabilities, participants)) {
    return (
      <Banner type="info" subtitle="Oh dear :(" showPing>
        <p>{MESSAGES.INFO_NO_MUTUAL_AVAILABILITY}</p>
      </Banner>
    );
  }
}
