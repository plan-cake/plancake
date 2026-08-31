import { useEffect, useMemo } from "react";

import * as Slider from "@radix-ui/react-slider";
import { AnimatePresence, motion, useAnimation } from "framer-motion";

import Checkbox from "@/components/checkbox";
import { useResultsContext } from "@/features/event/results/context";
import { Banner } from "@/features/system-feedback/banner/base";
import { cn } from "@/lib/utils/classname";

export default function AvailabilityFilters() {
  const controls = useAnimation();
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

  const displayedAvailability = showOnlyBestTimes
    ? max
    : Math.min(minAvailability, max);

  const handleCheckboxChange = (checked: boolean) => {
    setShowOnlyBestTimes(checked);

    if (checked) {
      setMinAvailability(max);
    } else {
      setMinAvailability(1);
    }
  };

  const ticks = useMemo(() => {
    const indices = [];
    for (let i = 0; i < max; i++) {
      const value = i + 1;
      const isEndpoint = i === 0 || i === max - 1;
      const isMajorTick = value % 10 === 0;
      const isMinorTick = value % 5 === 0;

      if (max < 50 || isEndpoint || isMajorTick || isMinorTick) {
        indices.push(i);
      }
    }
    return indices;
  }, [max]);

  useEffect(() => {
    controls.start({
      scale: [1, 1.3, 1],
      transition: { duration: 0.2, ease: "easeOut" },
    });
  }, [displayedAvailability, controls]);

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
                subtitle={
                  "There are no good times, try adjusting your filters!"
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-3">
        <Checkbox
          label="Show times that work for everyone"
          checked={showOnlyBestTimes}
          onChange={handleCheckboxChange}
          textSize="sm"
        />

        <div>
          <label
            htmlFor="min-availability"
            className={cn(
              "mb-2 flex items-center justify-between font-semibold",
              showOnlyBestTimes && "opacity-50 grayscale",
            )}
          >
            <span>Minimum Availability</span>
            <motion.span animate={controls} className="text-lion font-bold">
              {displayedAvailability}
            </motion.span>
          </label>

          <Slider.Root
            id="min-availability"
            disabled={showOnlyBestTimes}
            className={cn(
              "group relative flex w-full touch-none select-none items-center hover:cursor-pointer",
              "data-[disabled]:opacity-50 data-[disabled]:grayscale data-[disabled]:hover:cursor-not-allowed",
            )}
            value={[displayedAvailability]}
            min={1}
            max={max}
            step={1}
            onValueChange={(value) => setMinAvailability(value[0])}
          >
            <Slider.Track className="bg-foreground/25 relative h-10 grow overflow-hidden rounded-full md:h-1.5">
              <Slider.Range
                className={cn(
                  "bg-accent absolute h-full rounded-l-full md:rounded-full",
                  displayedAvailability === max && "rounded-full",
                )}
              />
            </Slider.Track>

            <div className="pointer-events-none absolute inset-0 mt-10 md:m-2 md:mt-1">
              {ticks.map((i) => {
                const value = i + 1;
                const leftPercentage = max <= 1 ? 0 : (i / (max - 1)) * 100;

                return (
                  <div
                    key={value}
                    className="absolute flex -translate-x-1/2 flex-col items-center pt-2"
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

            <Slider.Thumb
              aria-label="Minimum availability"
              className={cn(
                "relative hidden h-3 w-4 rounded-full md:block",
                "bg-accent focus-visible:ring-accent/50 focus-visible:ring-3 focus:outline-none",
                "group-hover:scale-120 transition-[scale] ease-in-out",
                showOnlyBestTimes && "group-hover:scale-100",
              )}
            />
          </Slider.Root>
        </div>
      </section>
    </div>
  );
}
