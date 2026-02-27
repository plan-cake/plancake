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
    ? "flex flex-wrap gap-3 pt-1"
    : "flex flex-wrap gap-2.5 overflow-y-auto px-6 pb-6 pt-1 max-h-none";

  if (participants.length === 0) {
    return (
      <ul className={listClassNames}>
        <li className="text-sm italic opacity-50">No attendees yet</li>
      </ul>
    );
  }

  return (
    <ul className={listClassNames}>
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
    </ul>
  );
}
