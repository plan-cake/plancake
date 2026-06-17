import * as Slider from "@radix-ui/react-slider";
import { AnimatePresence, motion } from "framer-motion";

import Checkbox from "@/components/checkbox";
import { useResultsContext } from "@/features/event/results/context";
import { Banner } from "@/features/system-feedback/banner/base";
import { cn } from "@/lib/utils/classname";

export default function AvailabilityFilters() {
  const {
    participants,
    minAvailability,
    setMinAvailability,
    showOnlyBestTimes,
    setShowOnlyBestTimes,
    filteredAvailabilities,
  } = useResultsContext();

  const max = participants.length;
  const hasNoAvailability = Object.keys(filteredAvailabilities).length === 0;

  return (
    <div className="flex flex-col pb-6">
      <AnimatePresence initial={false}>
        {hasNoAvailability && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "tween", ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-3">
              <Banner
                type="error"
                subtitle={"Uhhh there are no good times, adjust your filters!"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-3">
        <Checkbox
          label="Show times that work for everyone"
          checked={showOnlyBestTimes}
          onChange={setShowOnlyBestTimes}
        />

        <div>
          <label
            htmlFor="min-availability"
            className="mb-2 block font-semibold"
          >
            Minimum Availability
          </label>
          <Slider.Root
            className="group relative flex w-full touch-none select-none items-center hover:cursor-pointer"
            value={[minAvailability]}
            min={1}
            max={max}
            step={1}
            onValueChange={(value) => setMinAvailability(value[0])}
          >
            <Slider.Track className="bg-foreground/25 relative h-1.5 grow rounded-full">
              <Slider.Range className="bg-accent absolute h-full rounded-full" />

              <div className="pointer-events-none absolute inset-0 m-1.5 mt-1">
                {max > 0 &&
                  Array.from({ length: max }).map((_, i) => {
                    const value = i + 1;
                    const leftPercentage = max <= 1 ? 0 : (i / (max - 1)) * 100;

                    return (
                      <div
                        key={value}
                        className={cn(
                          "absolute flex -translate-x-1/2 flex-col items-center pt-2",
                        )}
                        style={{ left: `${leftPercentage}%` }}
                      >
                        <div
                          className={cn(
                            i === 0 || i === max - 1
                              ? "bg-foreground h-2 w-[1.5px] rounded-full"
                              : value % 10 === 0
                                ? "bg-foreground/75 h-2 w-[1px] rounded-full"
                                : value % 5 === 0
                                  ? "bg-foreground/50 h-1.5 w-[1px] rounded-full"
                                  : max < 50 &&
                                    "bg-foreground/50 h-1 w-[1px] rounded-full",
                          )}
                        />

                        {(i === 0 || i === max - 1) && (
                          <p className="text-foreground text-xs font-medium">
                            {value}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </Slider.Track>

            <Slider.Thumb
              aria-label="Minimum availability"
              className="bg-lion focus:outline-lion relative block h-3 w-3 rounded-full"
            >
              <div className="absolute left-1/2 top-full mt-0.5 flex -translate-x-1/2 flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <NumberedPin value={minAvailability} />
              </div>
            </Slider.Thumb>
          </Slider.Root>
        </div>
      </section>
    </div>
  );
}

function NumberedPin({ value, size = 30 }: { value: number; size?: number }) {
  return (
    <div
      className="bg-lion flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50% 50% 50% 10%",
        transform: "rotate(-225deg)",
      }}
    >
      <span
        className="text-violet"
        style={{
          transform: "rotate(225deg)",
          fontSize: `${size * 0.4}px`,
          userSelect: "none",
        }}
      >
        {value}
      </span>
    </div>
  );
}
