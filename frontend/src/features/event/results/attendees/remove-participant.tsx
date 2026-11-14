import { useCallback, useRef, useState } from "react";

import { isHotkeyPressed } from "react-hotkeys-hook";

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
  const personToRemove = useRef<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const confirmRemove = useCallback(async () => {
    if (!personToRemove.current) return false;
    const success = await handleRemoveParticipant(personToRemove.current);
    if (success && participants.length <= 1) {
      setIsRemoving(false);
    }
    return success;
  }, [personToRemove, handleRemoveParticipant, participants.length]);

  const promptRemove = useCallback(
    async (person: string) => {
      personToRemove.current = person;
      // Skip the confirmation dialog if shift is held down
      if (isHotkeyPressed("shift")) {
        await confirmRemove();
        return;
      }
      setIsConfirmationOpen(true);
    },
    [confirmRemove],
  );

  const toggleRemoving = useCallback(() => {
    setIsRemoving((prev) => !prev);
    clearSelectedParticipants();
  }, [clearSelectedParticipants]);

  return {
    isRemoving,
    setIsRemoving,
    personToRemove: personToRemove.current,
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
      <div className="flex flex-col gap-2">
        <div className="text-center">
          {personToRemove === currentUser ? (
            "Are you sure you want to leave this event?"
          ) : (
            <span>
              Are you sure you want to remove{" "}
              <span className="font-bold">{personToRemove}</span>?
            </span>
          )}
        </div>
        <div className="hidden text-center text-sm opacity-75 md:block">
          You can hold shift when selecting a participant to skip this
          confirmation.
        </div>
      </div>
    </ConfirmationDialog>
  );
}
