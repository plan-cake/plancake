import { useEffect, useMemo, useState } from "react";

import {
  CheckIcon,
  EraserIcon,
  ExitIcon,
  ResetIcon,
} from "@radix-ui/react-icons";

import { ResultsAvailabilityMap } from "@/core/availability/types";
import ActionButton from "@/features/button/components/action";
import ParticipantChip from "@/features/event/results/participant-chip";
import { ConfirmationDialog } from "@/features/system-feedback";
import { cn } from "@/lib/utils/classname";

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

  return (
    <div className="max-h-53 bg-panel flex flex-col gap-2 overflow-hidden rounded-3xl shadow-md md:shadow-none">
      <div className="flex touch-none select-none justify-between px-6 pt-6">
        <div className="flex flex-col">
          <h2 className="text-md font-semibold">
            {isRemoving ? "Removing a" : "A"}ttendees
          </h2>
          {displayParticipants.length > 0 && (
            <span className="text-sm opacity-75">
              {isRemoving
                ? `Select to remove`
                : activeCount === null
                  ? "Hover grid for availability"
                  : `${activeCount}/${displayParticipants.length} available`}
            </span>
          )}
        </div>
        {participants.length > 0 && (
          // Don't render buttons if there are no participants to avoid taking up space
          <div className="space-x-2">
            <ActionButton
              buttonStyle="semi-transparent"
              icon={<ResetIcon />}
              onClick={() => {
                clearSelectedParticipants();
                return true;
              }}
              disabled={!hasSelection}
              className={cn(
                "transition-opacity duration-200",
                !hasSelection && "pointer-events-none opacity-0",
              )}
              aria-label="Clear Selection"
            />

            {isCreator && (
              <ActionButton
                buttonStyle="semi-transparent"
                icon={isRemoving ? <CheckIcon /> : <EraserIcon />}
                onClick={() => {
                  setIsRemoving(!isRemoving);
                  clearSelectedParticipants();
                  return true;
                }}
                aria-label={
                  isRemoving ? "Stop Removing" : "Remove Participants"
                }
                className={cn(
                  !isRemoving &&
                    "hover:bg-error/25 hover:text-error active:bg-error/40",
                )}
              />
            )}

            {showSelfRemove && (
              <ActionButton
                buttonStyle="semi-transparent"
                icon={<ExitIcon />}
                onClick={() => {
                  promptRemove(currentUser);
                  return true;
                }}
                aria-label="Remove Self from Event"
                className="hover:bg-error/25 hover:text-error active:bg-error/40"
              />
            )}
          </div>
        )}
      </div>

      <ul className="flex flex-wrap gap-3 overflow-y-auto px-6 pb-6 pt-1 md:max-h-none md:gap-2.5">
        {participants.length === 0 && (
          <li className="text-sm italic opacity-50">No attendees yet</li>
        )}
        {participants.map((person: string, index: number) => {
          return (
            <ParticipantChip
              key={person}
              index={index}
              person={person}
              isAvailable={
                !hoveredSlot || availabilities[hoveredSlot]?.includes(person)
              }
              isSelected={selectedParticipants.includes(person)}
              areSelected={selectedParticipants.length > 0}
              isRemoving={isRemoving && isCreator}
              onRemove={() => promptRemove(person)}
              onHoverChange={(isHovering) =>
                !isRemoving && setHoveredParticipant(isHovering ? person : null)
              }
              onClick={() => !isRemoving && onParticipantToggle(person)}
            />
          );
        })}
      </ul>

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
