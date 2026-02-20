import { useEffect, useMemo, useState } from "react";

import { ResultsAvailabilityMap } from "@/core/availability/types";
import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import { ConfirmationDialog } from "@/features/system-feedback";

type AttendeesPanelProps = {
  // Data
  hoveredSlot: string | null;
  participants: string[];
  availabilities: ResultsAvailabilityMap;
  selectedParticipants: string[];

  // State Handlers
  clearSelectedParticipants: () => void;
  onParticipantToggle: (participant: string) => void;
  setHoveredParticipant: (participant: string | null) => void;

  // Context / Actions
  isCreator: boolean;
  currentUser: string;
  onRemoveParticipant: (person: string) => Promise<boolean>;
};

export default function AttendeesPanel({
  hoveredSlot,
  participants,
  availabilities,
  selectedParticipants,
  clearSelectedParticipants,
  onParticipantToggle,
  setHoveredParticipant,
  isCreator,
  currentUser,
  onRemoveParticipant,
}: AttendeesPanelProps) {
  /* REMOVING STATES */
  const [isRemoving, setIsRemoving] = useState(false);
  const showSelfRemove =
    !isCreator && currentUser && participants.includes(currentUser);

  const [personToRemove, setPersonToRemove] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const hasSelection = selectedParticipants.length > 0;

  const displayParticipants = useMemo(() => {
    if (selectedParticipants.length === 0) return participants;
    return selectedParticipants;
  }, [selectedParticipants, participants]);

  const activeCount = useMemo(() => {
    if (!hoveredSlot) return null;
    return displayParticipants.filter((p) =>
      availabilities[hoveredSlot]?.includes(p),
    ).length;
  }, [hoveredSlot, displayParticipants, availabilities]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsRemoving(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const promptRemove = (person: string) => {
    setPersonToRemove(person);
    setIsConfirmationOpen(true);
  };

  const toggleRemoving = () => {
    setIsRemoving(!isRemoving);
    clearSelectedParticipants();
  };

  return (
    <div className="max-h-53 bg-panel flex flex-col gap-2 overflow-hidden rounded-3xl shadow-md md:shadow-none">
      <PanelHeader
        isRemoving={isRemoving}
        activeCount={activeCount}
        displayCount={displayParticipants.length}
        totalParticipants={participants.length}
        hasSelection={hasSelection}
        isCreator={isCreator}
        showSelfRemove={!!showSelfRemove}
        currentUser={currentUser}
        clearSelectedParticipants={clearSelectedParticipants}
        toggleRemoving={toggleRemoving}
        promptRemove={promptRemove}
      />

      <ParticipantList
        participants={participants}
        hoveredSlot={hoveredSlot}
        availabilities={availabilities}
        selectedParticipants={selectedParticipants}
        isRemoving={isRemoving}
        isCreator={isCreator}
        promptRemove={promptRemove}
        setHoveredParticipant={setHoveredParticipant}
        onParticipantToggle={onParticipantToggle}
      />

      <ConfirmationDialog
        type="delete"
        autoClose={true}
        title={
          personToRemove === currentUser
            ? "Remove Yourself"
            : "Remove Participant"
        }
        description={
          personToRemove == currentUser ? (
            "Are you sure you want to remove yourself from this event?"
          ) : (
            <span>
              Are you sure you want to remove{" "}
              <span className="font-bold">{personToRemove}</span>?
            </span>
          )
        }
        // Controlled Props
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={async () => {
          if (!personToRemove) return false;
          const success = await onRemoveParticipant(personToRemove);
          if (success) {
            if (participants.length === 1) setIsRemoving(false);
          }
          return success;
        }}
      />
    </div>
  );
}
