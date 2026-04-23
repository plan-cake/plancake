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
import { findConsensusAndConflicts } from "@/features/event/results/lib/utils";
import { useToast } from "@/features/system-feedback/toast/context";
import { MESSAGES } from "@/lib/messages";
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
  const [timezone, setTimezone] = useState(
    // Lazy initialization to avoid the lookup on every render
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  /* OPTIMISTIC STATES */
  const [optimisticParticipants, removeOptimisticParticipant] = useOptimistic(
    participants || [],
    (state, personToRemove: string) => {
      return state.filter((p) => p !== personToRemove);
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
    const isRemovingSelf = currentUser === person;

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

  const liveUpdateAvailability = useCallback(
    (action: "add" | "update", displayName: string, isYou: boolean, newSlots: string[]) => {
      if (action === "add") {
        setParticipants((prev) => [...prev, displayName]);
        if (isYou) {
          setCurrentUser(displayName);
        }
      }

      setAvailability((prev) => {
        const updated = { ...prev };
        if (action === "update") {
          // Remove user from existing slots they are no longer in
          for (const slot in updated) {
            updated[slot] = updated[slot].filter((p) => p !== displayName);
          }
        }

        // Add user to their new slots
        newSlots.forEach((slot) => {
          slot = formatDateTime(slot, initialData.timezone, initialData.eventType);

          if (!updated[slot]) {
            // Ignore
            return;
          }
          if (action === "add" || !updated[slot].includes(displayName)) {
            updated[slot] = [...updated[slot], displayName];
          }
        });
        return updated;
      });
    },
    [initialData],
  );

  const liveRemoveParticipant = useCallback((displayName: string, isYou: boolean): boolean => {
    if (!optimisticParticipants.includes(displayName)) {
      // Check if the current user already removed the participant
      return false;
    }
    setParticipants((prev) => prev.filter((p) => p !== displayName));
    setAvailability((prev) => {
      const updated = { ...prev };
      for (const slot in updated) {
        updated[slot] = updated[slot].filter((p) => p !== displayName);
      }
      return updated;
    });
    setSelectedParticipants((prev) => prev.filter((p) => p !== displayName));
    if (isYou) {
      setCurrentUser(null);
    }
    return true;
  }, [optimisticParticipants]);

  /* DERIVED LOGIC */
  const { filteredAvailabilities, gridNumParticipants, hasNoConsensus } =
    useMemo(() => {
      if (showOnlyBestTimes) {
        const { allAvailableSlots } = findConsensusAndConflicts(
          optimisticAvailabilities,
          optimisticParticipants,
        );

        const noConsensus = allAvailableSlots.length === 0;

        const filtered: ResultsAvailabilityMap = {};
        for (const slot of allAvailableSlots) {
          filtered[slot] = optimisticAvailabilities[slot];
        }

        return {
          filteredAvailabilities: filtered,
          gridNumParticipants: optimisticParticipants.length,
          hasNoConsensus: noConsensus,
        };
      }

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
        hasNoConsensus: false,
      };
    }, [
      showOnlyBestTimes,
      optimisticAvailabilities,
      optimisticParticipants,
      selectedParticipants,
      hoveredParticipant,
    ]);

  useEffect(() => {
    if (showOnlyBestTimes && hasNoConsensus) {
      addToast("info", MESSAGES.INFO_NO_MUTUAL_AVAILABILITY);
    }
  }, [hasNoConsensus, showOnlyBestTimes, addToast]);

  return {
    // Data
    eventType: initialData.eventType,
    participants: optimisticParticipants,
    availabilities: optimisticAvailabilities,
    filteredAvailabilities,
    gridNumParticipants,

    // User Info
    currentUser,
    isCreator,

    // UI State
    hoveredSlot,
    hoveredParticipant,
    selectedParticipants,
    showOnlyBestTimes,
    timezone,

    // Actions
    clearSelectedParticipants: () => setSelectedParticipants([]),
    setHoveredSlot,
    setHoveredParticipant: handleSetHoveredParticipant,
    toggleParticipant,
    handleRemoveParticipant,
    setShowOnlyBestTimes,
    setTimezone,

    // Live Updates
    liveUpdateAvailability,
    liveRemoveParticipant,
  };
}
