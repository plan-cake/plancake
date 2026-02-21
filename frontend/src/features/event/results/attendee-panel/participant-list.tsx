import ParticipantChip from "@/features/event/results/attendee-panel/participant-chip";
import { useResultsContext } from "@/features/event/results/context";

export default function ParticipantList({
  isRemoving,
  promptRemove,
}: {
  isRemoving: boolean;
  promptRemove: (person: string) => void;
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

  if (participants.length === 0) {
    return (
      <ul className="flex flex-wrap gap-3 overflow-y-auto px-6 pb-6 pt-1 md:max-h-none md:gap-2.5">
        <li className="text-sm italic opacity-50">No attendees yet</li>
      </ul>
    );
  }

  return (
    <ul className="flex flex-wrap gap-3 overflow-y-auto px-6 pb-6 pt-1 md:max-h-none md:gap-2.5">
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
