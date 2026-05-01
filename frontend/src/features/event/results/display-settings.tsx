import Checkbox from "@/components/checkbox";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import { useResultsContext } from "@/features/event/results/context";

export default function DisplaySettings({
  timezone,
  onTimezoneChange,
  open = false,
  setOpen,
  drawerNesting = 0,
}: {
  timezone: string;
  onTimezoneChange: (newTZ: string) => void;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  drawerNesting?: number;
}) {
  const {
    participants,
    minAvailability,
    setMinAvailability,
    showOnlyBestTimes,
    setShowOnlyBestTimes,
  } = useResultsContext();

  return (
    <div className="flex flex-col gap-4">
      <Checkbox
        label="Only show best times"
        checked={showOnlyBestTimes}
        onChange={setShowOnlyBestTimes}
      />
      {/* Slider for Minimum Availability */}
      <div>
        <label
          htmlFor="min-availability"
          className="mb-1 block text-sm font-medium"
        >
          Show times with at least{" "}
          <span className="text-accent font-bold">{minAvailability}</span>{" "}
          {minAvailability === 1 ? "person" : "people"}
        </label>
        <input
          id="min-availability"
          type="range"
          min={1}
          max={Math.max(1, participants.length)}
          value={minAvailability}
          onChange={(e) => setMinAvailability(Number(e.target.value))}
          className="w-full cursor-pointer accent-[var(--color-accent)]"
        />
      </div>

      {/* Timezone Selector */}
      <div>
        <span className="mr-2 text-sm font-medium">Displaying event in</span>
        <span className="text-accent font-bold">
          <TimeZoneSelector
            id="timezone-select"
            value={timezone}
            onChange={onTimezoneChange}
            drawerNesting={drawerNesting}
            open={open}
            onOpenChange={setOpen}
          />
        </span>
      </div>
    </div>
  );
}
