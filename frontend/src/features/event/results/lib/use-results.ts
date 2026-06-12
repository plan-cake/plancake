import {
  startTransition,
  useEffect,
  useCallback,
  useMemo,
  useOptimistic,
  useState,
} from "react";

import { ResultsAvailabilityMap } from "@/core/availability/types";
import { removePerson } from "@/features/event/results/lib/remove-person";
import { ResultsInformation } from "@/features/event/results/lib/types";
import { findConsensusAndConflicts } from "@/features/event/results/lib/utils";
import { useToast } from "@/features/system-feedback/toast/context";
import { MESSAGES } from "@/lib/messages";

export function useEventResults(initialData: ResultsInformation) {
  const { addToast } = useToast();
  const { eventCode, isCreator, participants, availability, currentUser } =
    initialData;

  /* STATES */
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
    (state, personToRemove: string) =>
      state.filter((p) => p !== personToRemove),
  );

  const [optimisticAvailabilities, updateOptimisticAvailabilities] =
    useOptimistic(availability || {}, (state, person: string) => {
      const updatedState = { ...state };
      for (const slot in updatedState) {
        updatedState[slot] = updatedState[slot].filter((p) => p !== person);
      }
      return updatedState;
    });

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

  /* FILTERING LOGIC */

  /**
   * Returns a cache of the best timeslots where all participants are available.
   * Since this can be an expensive computation, it is memoized and only recalcuated
   * when availabilities or participants change
   */
  const bestTimesCache = useMemo(() => {
    const { allAvailableSlots } = findConsensusAndConflicts(
      optimisticAvailabilities,
      optimisticParticipants.length,
    );
    return {
      slotsSet: new Set(allAvailableSlots),
      hasNoConsensus: allAvailableSlots.length === 0,
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

    const sourceMap = isHovering ? optimisticAvailabilities : globalFilteredMap;

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
    optimisticAvailabilities,
    globalFilteredMap,
    optimisticParticipants.length,
  ]);

  useEffect(() => {
    if (showOnlyBestTimes && bestTimesCache.hasNoConsensus) {
      addToast("info", MESSAGES.INFO_NO_MUTUAL_AVAILABILITY);
    }
  }, [bestTimesCache.hasNoConsensus, showOnlyBestTimes, addToast]);

  return {
    // Data
    eventType: initialData.eventType,
    participants: optimisticParticipants,
    availabilities: optimisticAvailabilities,
    filteredAvailabilities,
    gridNumParticipants,
    validParticipantsForList,

    // User Info
    currentUser,
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
