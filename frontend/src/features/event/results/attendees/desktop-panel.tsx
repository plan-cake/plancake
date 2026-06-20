"use client";

import { useEffect } from "react";

import { motion } from "framer-motion";

import PanelHeader from "@/features/event/results/attendees/panel-header";
import ParticipantList from "@/features/event/results/attendees/participant-list";
import {
  useParticipantRemoval,
  RemoveParticipantDialog,
} from "@/features/event/results/attendees/remove-participant";
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
    <motion.div
      layout
      key="attendees-panel"
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
    </motion.div>
  );
}
