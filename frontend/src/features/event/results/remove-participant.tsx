import { useState, useCallback } from "react";

import { useResultsContext } from "@/features/event/results/context";
import { ConfirmationDialog } from "@/features/system-feedback";

export function useParticipantRemoval() {
  const {
    participants,
    currentUser,
    clearSelectedParticipants,
    handleRemoveParticipant,
  } = useResultsContext();

  const [isRemoving, setIsRemoving] = useState(false);
  const [personToRemove, setPersonToRemove] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const promptRemove = useCallback((person: string) => {
    setPersonToRemove(person);
    setIsConfirmationOpen(true);
  }, []);

  const toggleRemoving = useCallback(() => {
    setIsRemoving((prev) => !prev);
    clearSelectedParticipants();
  }, [clearSelectedParticipants]);

  const confirmRemove = useCallback(async () => {
    if (!personToRemove) return false;
    const success = await handleRemoveParticipant(personToRemove);
    if (success && participants.length <= 1) {
      setIsRemoving(false);
    }
    return success;
  }, [personToRemove, handleRemoveParticipant, participants.length]);

  return {
    isRemoving,
    setIsRemoving,
    personToRemove,
    isConfirmationOpen,
    setIsConfirmationOpen,
    promptRemove,
    toggleRemoving,
    confirmRemove,
    currentUser,
    clearSelectedParticipants,
  };
}

interface RemoveParticipantDialogProps {
  personToRemove: string | null;
  currentUser: string | null | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
  asNestedDrawer?: boolean;
}

export function RemoveParticipantDialog({
  personToRemove,
  currentUser,
  isOpen,
  onOpenChange,
  onConfirm,
  asNestedDrawer,
}: RemoveParticipantDialogProps) {
  return (
    <ConfirmationDialog
      type="delete"
      autoClose={true}
      asNestedDrawer={asNestedDrawer}
      title={
        personToRemove === currentUser
          ? "Remove Yourself"
          : "Remove Participant"
      }
      description={
        personToRemove === currentUser
          ? "Are you sure you want to leave this event?"
          : `Are you sure you want to remove ${personToRemove}?`
      }
      open={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    >
      <div className="text-center">
        {personToRemove == currentUser ? (
          "Are you sure you want to leave this event?"
        ) : (
          <span>
            Are you sure you want to remove{" "}
            <span className="font-bold">{personToRemove}</span>?
          </span>
        )}
      </div>
    </ConfirmationDialog>
  );
}
