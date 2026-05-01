import { ResultsAvailabilityMap } from "@/core/availability/types";

/**
 * Determines if there is at least one timeslot where all participants are
 * available.
 *
 * @returns True if there is at least one timeslot with full availability,
 * false otherwise.
 */
export function hasMutualAvailability(
  availabilities: ResultsAvailabilityMap,
  participantCount: number,
): boolean {
  if (participantCount === 0) return false;

  for (const slot in availabilities) {
    if (availabilities[slot].length === participantCount) {
      return true;
    }
  }
  return false;
}

/**
 * Finds timeslots where either all participants are available or no
 * participants are available.
 *
 * @returns An object containing:
 * - allAvailableSlots: array of timeslot ISO strings where everyone is available
 * - noOneAvailableSlots: array of timeslot ISO strings where no one is available
 */
export function findConsensusAndConflicts(
  availabilities: ResultsAvailabilityMap,
  participantCount: number,
): {
  allAvailableSlots: string[];
  noOneAvailableSlots: string[];
} {
  const allAvailableSlots: string[] = [];
  const noOneAvailableSlots: string[] = [];

  // early return for no participants
  if (participantCount === 0) {
    return { allAvailableSlots, noOneAvailableSlots };
  }

  for (const [slot, availableParticipants] of Object.entries(availabilities)) {
    const count = availableParticipants.length;

    if (count === participantCount) {
      allAvailableSlots.push(slot);
    } else if (count === 0) {
      noOneAvailableSlots.push(slot);
    }
  }

  return { allAvailableSlots, noOneAvailableSlots };
}
