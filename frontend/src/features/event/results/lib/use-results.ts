import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from "react";

import { ResultsAvailabilityMap } from "@/core/availability/types";
import { removePerson } from "@/features/event/results/lib/remove-person";
import { ResultsInformation } from "@/features/event/results/lib/types";
import { useLiveUpdates } from "@/features/event/results/lib/use-live-updates";
import { findConsensusAndConflicts } from "@/features/event/results/lib/utils";
import { useToast } from "@/features/system-feedback/toast/context";
import {
  LiveUpdateAddUpdateEvent,
  LiveUpdateRemoveEvent,
} from "@/lib/utils/api/live-updates/types";
import { formatDateTime } from "@/lib/utils/date-time-format";

export function useEventResults(initialData: ResultsInformation) {
  const { addToast } = useToast();

  const { eventCode, isCreator } = initialData;

  /* STATES */
  const [participants, setParticipants] = useState(initialData.participants);
  const [availability, setAvailability] = useState(initialData.availability);
  const [currentUser, setCurrentUser] = useState(initialData.currentUser);
  useEffect(() => {
    // Sync if initialData changes, which only happens if data is completely refetched
    setParticipants(initialData.participants);
    setAvailability(initialData.availability);
    setCurrentUser(initialData.currentUser);
  }, [initialData]);

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(
    null,
  );
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [showOnlyBestTimes, setShowOnlyBestTimes] = useState<boolean>(false);
  const [minAvailability, setMinAvailability] = useState<number>(1);

  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  /* OPTIMISTIC STATES */
  const [optimisticParticipants, removeOptimisticParticipant] = useOptimistic(
    participants || [],
    (state, personToRemove: string) => {
      return state.filter((p) => p.display_name !== personToRemove);
    },
  );
  const [optimisticAvailabilities, updateOptimisticAvailabilities] =
    useOptimistic(availability || {}, (state, person: string) => {
      const updatedState = { ...state };
      for (const slot in updatedState) {
        updatedState[slot] = updatedState[slot].filter((p) => p !== person);
      }
      return updatedState;
    });
  const [optimisticCurrentUser, removeOptimisticCurrentUser] = useOptimistic(
    currentUser,
    () => null,
  );

  /* ACTIONS */
  const handleSetHoveredParticipant = useCallback((person: string | null) => {
    setHoveredParticipant(person);
    if (person) setHoveredSlot(null);
  }, []);

  const toggleParticipant = (person: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person],
    );
  };

  const handleRemoveParticipant = async (person: string) => {
    const isRemovingSelf = currentUser === person;

    if (selectedParticipants.includes(person)) {
      setSelectedParticipants((prev) => prev.filter((p) => p !== person));
    }

    startTransition(() => {
      removeOptimisticParticipant(person);
      updateOptimisticAvailabilities(person);
      if (isRemovingSelf) {
        removeOptimisticCurrentUser(null);
      }
    });

    const result = await removePerson(eventCode, person, isCreator);
    if (!result.success) {
      addToast("error", result.error || "Error removing participant");
    } else {
      addToast(
        "success",
        isRemovingSelf ? "You have been removed." : `${person} removed.`,
      );
    }
    return result.success;
  };

  const liveAddParticipant = useCallback(
    /**
     * Given data from a live update event, adds a participant with their availability to
     * the participant list and availability map.
     *
     * @param eventData Data from the live update event.
     */
    (eventData: LiveUpdateAddUpdateEvent) => {
      const {
        public_id,
        display_name,
        joined_at,
        updated_at,
        time_zone,
        availability,
        is_you,
      } = eventData;

      setParticipants((prev) => [
        ...prev,
        {
          public_id: public_id,
          display_name: display_name,
          joined_at: joined_at,
          updated_at: updated_at,
          time_zone: time_zone,
        },
      ]);
      if (is_you) {
        setCurrentUser(display_name);
      }

      setAvailability((prev) => {
        const updated = { ...prev };
        availability.forEach((slot) => {
          slot = formatDateTime(
            slot,
            initialData.timezone,
            initialData.eventType,
          );

          if (!updated[slot]) {
            // Ignore
            return;
          }
          updated[slot] = [...updated[slot], display_name];
        });
        return updated;
      });
    },
    [initialData],
  );

  const liveRemoveParticipant = useCallback(
    /**
     * Given data from a live update event, removes a participant from the results.
     *
     * @param eventData Data from the live update event.
     * @returns `true` if the participant was removed, `false` otherwise.
     */
    (eventData: LiveUpdateRemoveEvent): boolean => {
      const { public_id, is_you } = eventData;

      const participant = optimisticParticipants.find(
        (p) => p.public_id === public_id,
      )?.display_name;

      if (optimisticParticipants.every((p) => p.display_name !== participant)) {
        // Check if the current user already removed the participant
        return false;
      }
      setParticipants((prev) =>
        prev.filter((p) => p.display_name !== participant),
      );
      setAvailability((prev) => {
        const updated = { ...prev };
        for (const slot in updated) {
          updated[slot] = updated[slot].filter((p) => p !== participant);
        }
        return updated;
      });
      setSelectedParticipants((prev) => prev.filter((p) => p !== participant));
      if (is_you) {
        setCurrentUser(null);
      }
      return true;
    },
    [optimisticParticipants],
  );

  const liveUpdateParticipant = useCallback(
    /**
     * Given data from a live update event, updates a participant's display name and/or
     * availability slots.
     *
     * @param eventData Data from the live update event.
     * @returns `true` if the availability slots were updated, `false` otherwise.
     */
    (eventData: LiveUpdateAddUpdateEvent): boolean => {
      const {
        public_id,
        display_name,
        joined_at,
        updated_at,
        time_zone,
        availability,
        is_you,
      } = eventData;

      // Format new slots
      const newSlotSet = new Set(
        availability.map((slot) =>
          formatDateTime(slot, initialData.timezone, initialData.eventType),
        ),
      );

      // Get existing participant display name
      const participant = optimisticParticipants.find(
        (p) => p.public_id === public_id,
      )?.display_name;
      if (!participant) {
        // Participant not found, ignore the update
        return false;
      }

      const nameChanged = participant !== display_name;
      const currentSlots = Object.keys(optimisticAvailabilities).filter((s) =>
        optimisticAvailabilities[s].includes(participant),
      );

      const slotsChanged =
        newSlotSet.size !== currentSlots.length ||
        currentSlots.some((s) => !newSlotSet.has(s));

      if (nameChanged) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.display_name === participant
              ? {
                  public_id: public_id,
                  display_name: display_name,
                  joined_at: joined_at,
                  updated_at: updated_at,
                  time_zone: time_zone,
                }
              : p,
          ),
        );
        setSelectedParticipants((prev) =>
          prev.map((p) => (p === participant ? display_name : p)),
        );
        if (is_you) {
          setCurrentUser(display_name);
        }
      }

      setAvailability((prev) => {
        const updated = { ...prev };
        for (const slot in updated) {
          const hasPerson = updated[slot].includes(participant);
          const shouldHavePerson = newSlotSet.has(slot);

          if (hasPerson && !shouldHavePerson) {
            updated[slot] = updated[slot].filter((p) => p !== participant);
          } else if (!hasPerson && shouldHavePerson) {
            updated[slot] = [...updated[slot], display_name];
          } else if (hasPerson && shouldHavePerson && nameChanged) {
            // Update the name in the slot
            updated[slot] = updated[slot].map((p) =>
              p === participant ? display_name : p,
            );
          }
        }
        return updated;
      });

      return slotsChanged;
    },
    [optimisticParticipants, optimisticAvailabilities, initialData],
  );

  /* FILTERING LOGIC */

  /**
   * Returns a cache of the best timeslots where all participants are available.
   * Since this can be an expensive computation, it is memoized and only recalculated
   * when availabilities or participants change
   */
  const bestTimesCache = useMemo(() => {
    const { allAvailableSlots } = findConsensusAndConflicts(
      optimisticAvailabilities,
      optimisticParticipants,
    );
    return {
      slotsSet: new Set(allAvailableSlots),
    };
  }, [optimisticAvailabilities, optimisticParticipants]);

  const { globalFilteredMap, validParticipantsForList } = useMemo(() => {
    const map: ResultsAvailabilityMap = {};
    const validSet = new Set<string>();

    for (const [slot, availablePeople] of Object.entries(
      optimisticAvailabilities,
    )) {
      if (availablePeople.length < minAvailability) continue;
      if (showOnlyBestTimes && !bestTimesCache.slotsSet.has(slot)) continue;

      map[slot] = availablePeople;
      availablePeople.forEach((p) => validSet.add(p));
    }

    return {
      globalFilteredMap: map,
      validParticipantsForList: Array.from(validSet),
    };
  }, [
    optimisticAvailabilities,
    minAvailability,
    showOnlyBestTimes,
    bestTimesCache,
  ]);

  /**
   * This is the final filtered availabilities map that is used for rendering the
   * grid. It applies the following filters before rendering:
   *  - slider filter (based on min availability)
   *  - best times filter (if showOnlyBestTimes is true)
   *
   * @returns The filtered availabilities map and the list of valid participants to
   *          show in the participant list.
   */
  const { filteredAvailabilities, gridNumParticipants } = useMemo(() => {
    const hasSelections = selectedParticipants.length > 0;
    const isHovering = !hasSelections && hoveredParticipant !== null;

    const active = hasSelections
      ? selectedParticipants
      : isHovering
        ? [hoveredParticipant]
        : [];

    const targetSet = new Set(active);
    const isFiltering = active.length > 0;

    const sourceMap = globalFilteredMap;

    if (!isFiltering) {
      return {
        filteredAvailabilities: sourceMap,
        gridNumParticipants: optimisticParticipants.length,
      };
    }

    const finalMap: ResultsAvailabilityMap = {};
    for (const [slot, availablePeople] of Object.entries(sourceMap)) {
      const relevantPeople = availablePeople.filter((p) => targetSet.has(p));
      if (relevantPeople.length > 0) finalMap[slot] = relevantPeople;
    }

    return {
      filteredAvailabilities: finalMap,
      gridNumParticipants: active.length,
    };
  }, [
    selectedParticipants,
    hoveredParticipant,
    globalFilteredMap,
    optimisticParticipants.length,
  ]);

  // Clamp min availability to never be higher than the total participants.
  // Keep it within the slider's [1..N] bounds, even if the list becomes empty.
  useEffect(() => {
    setMinAvailability((prev) => {
      const max = optimisticParticipants.length;
      if (max === 0) return 1;
      return Math.min(Math.max(prev, 1), max);
    });
  }, [optimisticParticipants.length]);

  useLiveUpdates(
    eventCode,
    liveAddParticipant,
    liveUpdateParticipant,
    liveRemoveParticipant,
  );

  return {
    // Data
    eventType: initialData.eventType,
    participants: optimisticParticipants,
    availabilities: optimisticAvailabilities,
    filteredAvailabilities,
    gridNumParticipants,
    validParticipantsForList,

    // User Info
    currentUser: optimisticCurrentUser,
    isCreator,

    // UI State
    hoveredSlot,
    hoveredParticipant,
    selectedParticipants,
    showOnlyBestTimes,
    timezone,
    minAvailability,

    // Actions
    clearSelectedParticipants: () => setSelectedParticipants([]),
    setHoveredSlot,
    setHoveredParticipant: handleSetHoveredParticipant,
    toggleParticipant,
    handleRemoveParticipant,
    setShowOnlyBestTimes,
    setTimezone,
    setMinAvailability,
  };
}
