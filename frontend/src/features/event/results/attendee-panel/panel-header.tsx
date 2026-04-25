import { Key, useRef } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, EraserIcon, LogOutIcon, Undo2Icon } from "lucide-react";

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
    eventType,
    hoveredSlot,
    participants,
    filteredAvailabilities,
    gridNumParticipants,
    isCreator,
    selectedParticipants,
    clearSelectedParticipants,
    currentUser,
    timezone,
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

  const formatHoveredSlot = () => {
    const date = new Date(hoveredSlot!);

    return eventType === "weekday"
      ? date.toLocaleString(undefined, {
          weekday: "long",
          hour: "numeric",
          minute: "numeric",
          timeZone: timezone,
        })
      : date.toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZone: timezone,
        });
  };

  const headerContent = () => {
    return (
      <TransitioningText motionStateKey={String(totalParticipants === 0)}>
        {totalParticipants === 0 ? (
          "No Attendees Yet"
        ) : isRemoving ? (
          "Removing attendees"
        ) : activeCount === null ? (
          hasSelection ? (
            <span>
              <TransitioningText motionStateKey={totalParticipants}>
                {selectedParticipants.length}
              </TransitioningText>
              <span className="whitespace-pre"> Attendee</span>
              <TransitioningText motionStateKey={totalParticipants}>
                {selectedParticipants.length !== 1 ? "s" : ""}
              </TransitioningText>
              <span className="whitespace-pre"> Selected</span>
            </span>
          ) : (
            <span>
              <TransitioningText motionStateKey={totalParticipants}>
                {totalParticipants}
              </TransitioningText>
              <span className="whitespace-pre"> Attendee</span>
              <TransitioningText motionStateKey={totalParticipants}>
                {totalParticipants !== 1 ? "s" : ""}
              </TransitioningText>
            </span>
          )
        ) : (
          <span>
            <TransitioningText motionStateKey={totalParticipants}>
              {activeCount}
            </TransitioningText>
            <span>/</span>
            <TransitioningText motionStateKey={totalParticipants}>
              {gridNumParticipants}
            </TransitioningText>
            <span className="whitespace-pre"> Available</span>
          </span>
        )}
      </TransitioningText>
    );
  };

  return (
    <div
      className={cn(
        "flex w-full touch-none select-none justify-between",
        inDrawer ? "" : "px-6 pt-6",
      )}
    >
      <div className="flex flex-col items-start">
        <h2 className="text-md font-semibold">{headerContent()}</h2>
        {gridNumParticipants > 0 && (
          <span className="text-sm opacity-75">
            {isRemoving
              ? `Select to remove`
              : hoveredSlot === null
                ? "Hover grid for availability"
                : formatHoveredSlot()}
          </span>
        )}
      </div>

      {!isCollapsed && totalParticipants > 0 && (
        <div className="space-x-2">
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<Undo2Icon />}
            onClick={clearSelectedParticipants}
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
              onClick={toggleRemoving}
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
              icon={<LogOutIcon />}
              onClick={() => {
                promptRemove(currentUser);
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

function TransitioningText({
  motionStateKey,
  children,
}: {
  motionStateKey: Key;
  children: React.ReactNode;
}) {
  const activeKeyRef = useRef(0);
  const childrenRef = useRef(children);
  const motionStateKeyRef = useRef(motionStateKey);

  if (
    motionStateKey !== motionStateKeyRef.current &&
    children !== childrenRef.current
  ) {
    // Only animate if the motionStateKey has changed AND the content has changed
    // The motionStateKey is used to check if the update comes from live updates
    activeKeyRef.current++;
  }

  motionStateKeyRef.current = motionStateKey;
  childrenRef.current = children;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={activeKeyRef.current}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}
