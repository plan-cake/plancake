import { useMemo } from "react";

import {
  CheckIcon,
  EraserIcon,
  ExitIcon,
  ResetIcon,
} from "@radix-ui/react-icons";

import { useResultsContext } from "@/features/event/results/context";
import { cn } from "@/lib/utils/classname";

type PanelHeaderProps = {
  isRemoving: boolean;
  toggleRemoving: () => void;
  promptRemove: (person: string) => void;
};

export default function PanelHeader({
  isRemoving,
  toggleRemoving,
  promptRemove,
}: PanelHeaderProps) {
  const {
    hoveredSlot,
    availabilities,
    participants,
    selectedParticipants,
    isCreator,
    clearSelectedParticipants,
    currentUser,
  } = useResultsContext();

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

  const displayCount = displayParticipants.length;
  const totalParticipants = participants.length;
  const hasSelection = selectedParticipants.length > 0;
  const showSelfRemove =
    !isCreator && currentUser && participants.includes(currentUser);

  return (
    <div className="flex touch-none select-none justify-between px-6 pt-6">
      <div className="flex flex-col">
        <h2 className="text-md font-semibold">
          {isRemoving ? "Removing a" : "A"}ttendees
        </h2>
        {displayCount > 0 && (
          <span className="text-sm opacity-75">
            {isRemoving
              ? `Select to remove`
              : activeCount === null
                ? "Hover grid for availability"
                : `${activeCount}/${displayCount} available`}
          </span>
        )}
      </div>
      {totalParticipants > 0 && (
        <div className="space-x-2">
          <button
            tabIndex={hasSelection ? 0 : -1}
            className={cn(
              "bg-accent/15 text-accent rounded-full p-2 text-sm font-semibold transition-[shadow,opacity] duration-200",
              "hover:bg-accent/25 active:bg-accent/40 cursor-pointer",
              hasSelection ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={clearSelectedParticipants}
          >
            <ResetIcon className="h-6 w-6" />
          </button>

          {isCreator && (
            <button
              className={cn(
                "text-red bg-red/15 rounded-full p-2 text-sm font-semibold",
                "hover:bg-red/25 active:bg-red/40 cursor-pointer",
              )}
              onClick={toggleRemoving}
            >
              {isRemoving ? (
                <CheckIcon className="h-6 w-6" />
              ) : (
                <EraserIcon className="h-6 w-6" />
              )}
            </button>
          )}

          {showSelfRemove && (
            <button
              className="text-red bg-red/15 hover:bg-red/25 active:bg-red/40 cursor-pointer rounded-full p-2 text-sm font-semibold"
              aria-label="Remove self"
              onClick={() => promptRemove(currentUser)}
            >
              <ExitIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
