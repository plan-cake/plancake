import * as Slider from "@radix-ui/react-slider";

import Checkbox from "@/components/checkbox";
import { useResultsContext } from "@/features/event/results/context";
import { cn } from "@/lib/utils/classname";

interface NumberedPinProps {
  value: number;
  size?: number;
}

function NumberedPin({ value, size = 30 }: NumberedPinProps) {
  return (
    <div
      className="bg-accent flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50% 50% 50% 10%",
        transform: "rotate(-225deg)",
      }}
    >
      <span
        style={{
          transform: "rotate(225deg)",
          color: "#FFFFFF",
          fontWeight: "bold",
          fontSize: `${size * 0.4}px`,
          userSelect: "none",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// 2. Updated AvailabilityFilters
export default function AvailabilityFilters() {
  const {
    participants,
    minAvailability,
    setMinAvailability,
    showOnlyBestTimes,
    setShowOnlyBestTimes,
  } = useResultsContext();

  const max = participants.length;
  const ticks = [];
  for (let i = 0; i <= max; i += 5) {
    ticks.push(i);
  }
  if (max > 0 && max % 5 !== 0) {
    ticks.push(max);
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Checkbox
        label="Show times that work for everyone"
        checked={showOnlyBestTimes}
        onChange={setShowOnlyBestTimes}
      />

      <div>
        <label htmlFor="min-availability" className="mb-2 block font-medium">
          Minimum Availability
        </label>
        <Slider.Root
          className="group relative flex w-full touch-none select-none items-center hover:cursor-pointer"
          value={[minAvailability]}
          min={0}
          max={max}
          step={1}
          onValueChange={(value) => setMinAvailability(value[0])}
        >
          <Slider.Track className="bg-foreground/25 relative h-1.5 grow rounded-full">
            <Slider.Range className="bg-accent absolute h-full rounded-full" />

            {/* Dynamic Tick Marks */}
            <div className="pointer-events-none absolute inset-0 mt-1">
              {ticks.map((tick) => {
                // Calculate where the tick should sit on the track.
                // NOTE: If your Slider.Root still uses min={1}, update this formula to:
                // const leftPercentage = ((tick - 1) / (max - 1)) * 100;
                const leftPercentage = max === 0 ? 0 : (tick / max) * 100;

                return (
                  <div
                    key={tick}
                    className="absolute flex -translate-x-1/2 flex-col items-center pt-2"
                    style={{ left: `${leftPercentage}%` }}
                  >
                    <div
                      className={cn(
                        tick == 0 || tick == max
                          ? "bg-foreground h-1.5 w-[1.5px] rounded-full"
                          : "bg-foreground/25 h-1 w-[1px] rounded-full",
                      )}
                    />
                    <p
                      className={cn(
                        tick == 0 || tick == max
                          ? "text-foreground text-xs font-medium"
                          : "text-foreground/40 text-[12px]",
                      )}
                    >
                      {tick}
                    </p>
                  </div>
                );
              })}
            </div>
          </Slider.Track>

          <Slider.Thumb
            aria-label="Minimum availability"
            className="bg-accent relative block h-4 w-4 rounded-full"
          >
            {/* Absolute container to float the pin above the thumb.
                - bottom-full: Pushes it entirely above the top edge of the thumb circle
                - left-1/2 & -translate-x-1/2: Centers it horizontally over the thumb
                - mb-1: Adds a tiny gap so the point touches the circle perfectly 
              */}
            <div className="absolute left-1/2 top-full mt-0.5 flex -translate-x-1/2 flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <NumberedPin value={minAvailability} />
            </div>
          </Slider.Thumb>
        </Slider.Root>
      </div>
    </div>
  );
}
