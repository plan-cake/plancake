import {
  CheckIcon,
  EraserIcon,
  ExitIcon,
  ResetIcon,
} from "@radix-ui/react-icons";

import ActionButton from "@/features/button/components/action";
import { useResultsContext } from "@/features/event/results/context";
import { cn } from "@/lib/utils/classname";

type PanelHeaderProps = {
  isRemoving: boolean;
  toggleRemoving: () => void;
  promptRemove: (person: string) => void;
  inDrawer?: boolean;
  isCollapsed?: boolean;
};

export default function PanelHeader({
  isRemoving,
  toggleRemoving,
  promptRemove,
  inDrawer = false,
  isCollapsed = false,
}: PanelHeaderProps) {
  const {
    hoveredSlot,
    participants,
    filteredAvailabilities,
    gridNumParticipants,
    isCreator,
    selectedParticipants,
    clearSelectedParticipants,
    currentUser,
  } = useResultsContext();

  const activeCount = hoveredSlot
    ? filteredAvailabilities[hoveredSlot]
      ? filteredAvailabilities[hoveredSlot].length
      : 0
    : null;
  const totalParticipants = participants.length;
  const hasSelection = selectedParticipants.length > 0;
  const showSelfRemove =
    !isCreator && currentUser && participants.includes(currentUser);

  return (
    <div
      className={cn(
        "flex w-full touch-none select-none justify-between",
        inDrawer ? "" : "px-6 pt-6",
      )}
    >
      <div className="flex flex-col items-start">
        <h2 className="text-md font-semibold">
          {isRemoving
            ? "Removing attendees"
            : activeCount === null
              ? hasSelection
                ? selectedParticipants.length +
                  ` Attendee${selectedParticipants.length !== 1 ? "s" : ""} Selected`
                : totalParticipants + " Attendees"
              : `${activeCount}/${gridNumParticipants} Available`}
        </h2>
        {gridNumParticipants > 0 && (
          <span className="text-sm opacity-75">
            {isRemoving
              ? `Select to remove`
              : hoveredSlot !== null
                ? new Date(hoveredSlot!).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })
                : "Hover grid for availability"}
          </span>
        )}
      </div>

      {!isCollapsed && totalParticipants > 0 && (
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
              "shrink-0 transition-opacity duration-200",
              !hasSelection && "pointer-events-none opacity-0",
            )}
            aria-label="Clear Selection"
          />

          {isCreator && (
            <ActionButton
              buttonStyle="semi-transparent"
              icon={isRemoving ? <CheckIcon /> : <EraserIcon />}
              onClick={() => {
                toggleRemoving();
                return true;
              }}
              aria-label={isRemoving ? "Stop Removing" : "Remove Participants"}
              className={cn(
                "shrink-0",
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
              className="hover:bg-error/25 hover:text-error active:bg-error/40 shrink-0"
            />
          )}
        </div>
      )}
    </div>
  );
}
