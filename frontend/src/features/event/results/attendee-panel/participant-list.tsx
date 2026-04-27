import { AnimatePresence, motion } from "framer-motion";

import ParticipantChip from "@/features/event/results/attendee-panel/participant-chip";
import { useResultsContext } from "@/features/event/results/context";

export default function ParticipantList({
  isRemoving,
  promptRemove,
  mobile = false,
}: {
  isRemoving: boolean;
  promptRemove: (person: string) => void;
  mobile?: boolean;
}) {
  const {
    participants,
    hoveredSlot,
    availabilities,
    selectedParticipants,
    isCreator,
    setHoveredParticipant,
    toggleParticipant: onParticipantToggle,
  } = useResultsContext();

  const listClassNames = mobile
    ? "flex flex-wrap pt-1 -mr-2.5"
    : "flex min-h-0 shrink flex-wrap content-start overflow-y-auto pr-3.5 pl-6 pb-3.5";

  if (participants.length === 0) {
    return (
      <ul className={listClassNames}>
        <li className="pb-2.5 text-sm italic opacity-50">
          Waiting for responses...
        </li>
      </ul>
    );
  }

  return (
    <motion.ul layout className={listClassNames}>
      <AnimatePresence initial={false}>
        {participants.map((person: string, index: number) => (
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
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
