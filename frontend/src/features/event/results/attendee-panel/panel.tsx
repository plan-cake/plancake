"use client";

import { useEffect } from "react";

import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import {
  useParticipantRemoval,
  RemoveParticipantDialog,
} from "@/features/event/results/remove-participant";
import { cn } from "@/lib/utils/classname";

export default function AttendeesPanel() {
  const {
    isRemoving,
    setIsRemoving,
    personToRemove,
    isConfirmationOpen,
    setIsConfirmationOpen,
    promptRemove,
    toggleRemoving,
    confirmRemove,
    currentUser,
  } = useParticipantRemoval();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsRemoving(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setIsRemoving]);

  return (
    <div
      className={cn(
        "bg-panel rounded-3xl",
        "flex min-h-0 w-full shrink flex-col gap-2 overflow-hidden",
      )}
    >
      <PanelHeader
        isRemoving={isRemoving}
        toggleRemoving={toggleRemoving}
        promptRemove={promptRemove}
      />

      <ParticipantList isRemoving={isRemoving} promptRemove={promptRemove} />

      <RemoveParticipantDialog
        personToRemove={personToRemove}
        currentUser={currentUser}
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
