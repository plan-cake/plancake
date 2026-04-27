import { AnimatePresence, motion } from "framer-motion";

import ParticipantChip from "@/features/event/results/attendee-panel/participant-chip";
import { useResultsContext } from "@/features/event/results/context";
import { ParticipantData } from "@/features/event/results/lib/types";

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
    ? "flex flex-wrap pt-1 gap-x-2.5"
    : "flex min-h-0 shrink flex-wrap content-start overflow-y-auto px-6 gap-x-2.5 pb-3.5 pt-1";

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
        {participants.map((person: ParticipantData[number], index: number) => (
          <ParticipantChip
            key={person.id}
            index={index}
            person={person.display_name}
            isAvailable={
              !hoveredSlot ||
              availabilities[hoveredSlot]?.includes(person.display_name)
            }
            isSelected={selectedParticipants.includes(person.display_name)}
            areSelected={selectedParticipants.length > 0}
            isRemoving={isRemoving && isCreator}
            onRemove={() => promptRemove(person.display_name)}
            onHoverChange={(isHovering) =>
              !isRemoving &&
              setHoveredParticipant(isHovering ? person.display_name : null)
            }
            onClick={() =>
              !isRemoving && onParticipantToggle(person.display_name)
            }
          />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
