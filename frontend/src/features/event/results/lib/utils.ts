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
  participants: string[],
): boolean {
  for (const slot in availabilities) {
    if (availabilities[slot].length === participants.length) {
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
  participants: string[],
): {
  allAvailableSlots: string[];
  noOneAvailableSlots: string[];
} {
  const allAvailableSlots: string[] = [];
  const noOneAvailableSlots: string[] = [];

  for (const slot in availabilities) {
    const availableParticipants = availabilities[slot];

    if (availableParticipants.length === participants.length) {
      allAvailableSlots.push(slot);
    }

    if (availableParticipants.length === 0) {
      noOneAvailableSlots.push(slot);
    }
  }

  return { allAvailableSlots, noOneAvailableSlots };
}
