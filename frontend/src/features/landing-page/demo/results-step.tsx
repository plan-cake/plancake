"use client";

import ScheduleGrid from "@/features/event/grid/grid";
import ParticipantChip from "@/features/event/results/attendees/participant-chip";
import { PARTICIPANTS, TIMESLOTS } from "@/features/landing-page/utils";

interface ViewResultsStepProps {
  availabilities: Record<string, string[]>;
  hoveredSlot: string | null;
  onHoverSlot: (slotIso: string | null) => void;
  currentlyAvailable: string[];
}

export default function ViewResultsStep({
  availabilities,
  hoveredSlot,
  onHoverSlot,
  currentlyAvailable,
}: ViewResultsStepProps) {
  return (
    <div className="bg-background text-foreground rounded-2xl p-4">
      <ScheduleGrid
        mode="view"
        viewTransitionName="none"
        staticHeader
        timeslots={TIMESLOTS}
        timezone="America/New_York"
        availabilities={availabilities}
        numParticipants={4}
        hoveredSlot={hoveredSlot}
        setHoveredSlot={onHoverSlot}
      />
      <ul className="pointer-events-none flex flex-wrap items-center justify-center gap-2 px-2 pt-2">
        {PARTICIPANTS.map((p, index) => (
          <ParticipantChip
            key={p}
            areSelected={false}
            includedInSlider={true}
            index={index}
            isAvailable={currentlyAvailable.includes(p)}
            isRemoving={false}
            isSelected={false}
            onClick={() => {}}
            onHoverChange={() => {}}
            onRemove={() => {}}
            person={p}
          />
        ))}
      </ul>
    </div>
  );
}