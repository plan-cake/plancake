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
  const [timezone, setTimezone] = useState(
    // Lazy initialization to avoid the lookup on every render
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

  const liveAddParticipant = useCallback(
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
    (
      eventData: LiveUpdateAddUpdateEvent,
    ): { nameUpdated: boolean; slotsUpdated: boolean } => {
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
        return { nameUpdated: false, slotsUpdated: false };
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

      return { nameUpdated: nameChanged, slotsUpdated: slotsChanged };
    },
    [optimisticParticipants, optimisticAvailabilities, initialData],
  );

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
    liveAddParticipant,
    liveUpdateParticipant,
    liveRemoveParticipant,
  };
}
