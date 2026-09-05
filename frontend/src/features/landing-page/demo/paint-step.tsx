"use client";

import ActionButton from "@/features/button/components/action";
import ScheduleGrid from "@/features/event/grid/grid";
import { TIMESLOTS } from "@/features/landing-page/demo/utils";

interface PaintAvailabilityStepProps {
  userAvailability: Set<string>;
  onToggleSlot: (slotIso: string, togglingOn: boolean) => void;
  onSubmit: () => void;
  allowSubmit: boolean;
}

export default function PaintAvailabilityStep({
  userAvailability,
  onToggleSlot,
  onSubmit,
  allowSubmit,
}: PaintAvailabilityStepProps) {
  return (
    <div className="bg-background text-foreground rounded-2xl p-4">
      <ScheduleGrid
        mode="paint"
        viewTransitionName="none"
        staticHeader
        timeslots={TIMESLOTS}
        timezone="America/New_York"
        userAvailability={userAvailability}
        onToggleSlot={onToggleSlot}
      />
      <div className="flex items-center justify-center pt-2">
        <ActionButton
          buttonStyle="primary"
          label="Submit"
          onClick={onSubmit}
          disabled={!allowSubmit}
        />
      </div>
    </div>
  );
}
