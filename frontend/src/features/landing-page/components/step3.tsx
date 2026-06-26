import ActionButton from "@/features/button/components/action";
import ScheduleGrid from "@/features/event/grid/grid";

interface Step3Props {
  timeslots: Date[];
  userAvailability: Set<string>;
  allowSubmit: boolean;
  onPaintSlot: (slotIso: string, togglingOn: boolean) => void;
  onSubmit: () => void;
}

export default function Step3({
  timeslots,
  userAvailability,
  allowSubmit,
  onPaintSlot,
  onSubmit,
}: Step3Props) {
  return (
    <div className="bg-background rounded-4xl h-fit p-4">
      <div className="text-center">
        <div className="text-lg font-bold">3. Paint your availability</div>
        <div className="text-sm opacity-75">
          Click and drag on the grid to fill in the times you&apos;re free.
        </div>
      </div>
      <ScheduleGrid
        mode="paint"
        staticHeader
        timeslots={timeslots}
        timezone="America/New_York"
        userAvailability={userAvailability}
        onToggleSlot={onPaintSlot}
      />
      <div className="-mt-2 flex items-center justify-center gap-2">
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
