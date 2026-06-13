import * as Slider from "@radix-ui/react-slider";

import Checkbox from "@/components/checkbox";
import { useResultsContext } from "@/features/event/results/context";

export default function AvailabilityFilters() {
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
        label="Show times that work for everyone"
        checked={showOnlyBestTimes}
        onChange={setShowOnlyBestTimes}
      />

      <div>
        <label htmlFor="min-availability" className="mb-1 block font-medium">
          Minimum Availability
        </label>
        <Slider.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          defaultValue={[minAvailability]}
          min={1}
          max={participants.length}
          step={1}
          onValueChange={(value) => setMinAvailability(value[0])}
        >
          <Slider.Track className="bg-foreground/25 relative h-1 grow rounded-full">
            <Slider.Range className="bg-accent absolute h-full rounded-full" />
          </Slider.Track>
          <Slider.Thumb
            aria-label="Minimum availability"
            className="bg-accent block size-4 rounded-full hover:cursor-pointer"
          />
        </Slider.Root>
      </div>
    </div>
  );
}
