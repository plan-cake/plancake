import {
  startTransition,
  useCallback,
  useMemo,
  useOptimistic,
  useState,
} from "react";

import { ResultsAvailabilityMap } from "@/core/availability/types";
import { removePerson } from "@/features/event/results/remove-person";
import { useToast } from "@/features/system-feedback/toast/context";
import { AllAvailability } from "@/lib/utils/api/types";

export function useEventResults(
  initialData: AllAvailability,
  eventCode: string,
  isCreator: boolean,
  userName: string | null,
) {
  const { addToast } = useToast();

  /* STATES */
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(
    null,
  );
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const [optimisticParticipants, removeOptimisticParticipant] = useOptimistic(
    initialData.participants || [],
    (state, personToRemove: string) => {
      return state.filter((p) => p !== personToRemove);
    },
  );

  const [optimisticAvailabilities, updateOptimisticAvailabilities] =
    useOptimistic(initialData.availability || {}, (state, person: string) => {
      const updatedState = { ...state };
      for (const slot in updatedState) {
        updatedState[slot] = updatedState[slot].filter((p) => p !== person);
      }
      return updatedState;
    });

  /* ACTIONS */
  const handleSetHoveredParticipant = useCallback((person: string | null) => {
    setHoveredParticipant(person);
    if (person) {
      setHoveredSlot(null);
    }
  }, []);

  const toggleParticipant = (person: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person],
    );
  };

  const handleRemoveParticipant = async (person: string) => {
    const isRemovingSelf = userName === person;

    // Immediate UI update
    if (selectedParticipants.includes(person)) {
      setSelectedParticipants((prev) => prev.filter((p) => p !== person));
    }

    startTransition(() => {
      removeOptimisticParticipant(person);
      updateOptimisticAvailabilities(person);
    });

    // Server Action
    const result = await removePerson(eventCode, person, isCreator);

    if (!result.success) {
      addToast("error", result.error || "Error removing participant");
    } else {
      addToast(
        "success",
        isRemovingSelf
          ? "You have been removed from the event."
          : `${person} has been removed from the event.`,
      );
    }

    return result.success;
  };

  /* DERIVED LOGIC */
  const { filteredAvailabilities, gridNumParticipants } = useMemo(() => {
    let activeParticipants: string[] = [];

    if (selectedParticipants.length > 0) {
      activeParticipants = selectedParticipants;
    } else if (hoveredParticipant) {
      activeParticipants = [hoveredParticipant];
    } else {
      return {
        filteredAvailabilities: optimisticAvailabilities,
        gridNumParticipants: optimisticParticipants.length,
      };
    }

    const filtered: ResultsAvailabilityMap = {};
    for (const slot in optimisticAvailabilities) {
      const availablePeople = optimisticAvailabilities[slot];
      const intersection = availablePeople.filter((p) =>
        activeParticipants.includes(p),
      );
      if (intersection.length > 0) {
        filtered[slot] = intersection;
      }
    }

    return {
      filteredAvailabilities: filtered,
      gridNumParticipants: activeParticipants.length,
    };
  }, [
    optimisticAvailabilities,
    optimisticParticipants.length,
    selectedParticipants,
    hoveredParticipant,
  ]);

  return {
    // Data
    participants: optimisticParticipants,
    availabilities: optimisticAvailabilities,
    filteredAvailabilities,
    gridNumParticipants,

    // UI State
    hoveredSlot,
    hoveredParticipant,
    selectedParticipants,

    // Actions
    clearSelectedParticipants: () => setSelectedParticipants([]),
    setHoveredSlot,
    setHoveredParticipant: handleSetHoveredParticipant,
    toggleParticipant,
    handleRemoveParticipant,
  };
}
