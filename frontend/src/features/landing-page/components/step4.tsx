import ScheduleGrid from "@/features/event/grid/grid";
import ParticipantChip from "@/features/event/results/attendees/participant-chip";
import { PARTICIPANTS } from "@/features/landing-page/utils";

interface Step4Props {
  timeslots: Date[];
  availabilities: Record<string, string[]>;
  hoveredSlot: string | null;
  currentlyAvailable: string[];
  onHoverChange: (slotIso: string | null) => void;
}

export default function Step4({
  timeslots,
  availabilities,
  hoveredSlot,
  currentlyAvailable,
  onHoverChange,
}: Step4Props) {
  return (
    <div className="bg-background rounded-4xl w-full p-4">
      <div className="text-center">
        <div className="text-lg font-bold">4. Watch the results stack up</div>
        <div className="text-sm opacity-75">
          See which times work best for everyone as soon as they respond.
        </div>
      </div>
      <ScheduleGrid
        mode="view"
        staticHeader
        timeslots={timeslots}
        timezone="America/New_York"
        availabilities={availabilities}
        numParticipants={4}
        hoveredSlot={hoveredSlot}
        setHoveredSlot={onHoverChange}
      />
      <div className="pointer-events-none -mt-2 flex flex-wrap items-center justify-center gap-2 px-2">
        {PARTICIPANTS.map((p) => (
          <ParticipantChip
            key={p}
            areSelected={false}
            index={0}
            isAvailable={currentlyAvailable.includes(p)}
            isRemoving={false}
            isSelected={false}
            onClick={() => {}}
            onHoverChange={() => {}}
            onRemove={() => {}}
            person={p}
          />
        ))}
      </div>
    </div>
  );
}
