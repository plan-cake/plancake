import { useEffect, useState } from "react";

import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import { useResultsContext } from "@/features/event/results/context";
import { ConfirmationDialog } from "@/features/system-feedback";

export default function AttendeesPanel() {
  const {
    participants,
    currentUser,
    clearSelectedParticipants,
    handleRemoveParticipant: onRemoveParticipant,
  } = useResultsContext();

  /* REMOVING STATES */
  const [isRemoving, setIsRemoving] = useState(false);
  const [personToRemove, setPersonToRemove] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

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
        toggleRemoving={toggleRemoving}
        promptRemove={promptRemove}
      />

      <ParticipantList isRemoving={isRemoving} promptRemove={promptRemove} />

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
