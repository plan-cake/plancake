import { ResultsAvailabilityMap } from "@/core/availability/types";
import ParticipantChip from "@/features/event/results/attendee-panel/participant-chip";

type ParticipantListProps = {
  participants: string[];
  hoveredSlot: string | null;
  availabilities: ResultsAvailabilityMap;
  selectedParticipants: string[];
  isRemoving: boolean;
  isCreator: boolean;
  promptRemove: (person: string) => void;
  setHoveredParticipant: (participant: string | null) => void;
  onParticipantToggle: (participant: string) => void;
};

export default function ParticipantList({
  participants,
  hoveredSlot,
  availabilities,
  selectedParticipants,
  isRemoving,
  isCreator,
  promptRemove,
  setHoveredParticipant,
  onParticipantToggle,
}: ParticipantListProps) {
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
