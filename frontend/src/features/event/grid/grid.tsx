import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";

import {
  AvailabilitySet,
  ResultsAvailabilityMap,
} from "@/core/availability/types";
import { createEmptyUserAvailability } from "@/core/availability/utils";
import useGridinfo from "@/features/event/grid/lib/use-grid";
import ScheduleHeader from "@/features/event/grid/schedule-header";
import TimeColumn from "@/features/event/grid/time-column";
import InteractiveTimeBlock from "@/features/event/grid/timeblocks/interactive";
import PreviewTimeBlock from "@/features/event/grid/timeblocks/preview";
import ResultsTimeBlock from "@/features/event/grid/timeblocks/results";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

interface ScheduleGridProps {
  mode: "paint" | "view" | "preview";
  timeslots: Date[];
  timezone: string;
  isWeekdayEvent?: boolean;

  disableSelect?: boolean;

  // for "view" mode
  availabilities?: ResultsAvailabilityMap;
  numParticipants?: number;
  hoveredSlot?: string | null;
  setHoveredSlot?: (slotIso: string | null) => void;

  // for "paint" mode
  userAvailability?: AvailabilitySet;
  onToggleSlot?: (slotIso: string, togglingOn: boolean) => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "50%" : "-50%",
    opacity: 0,
  }),
};

export default function ScheduleGrid({
  timeslots,
  timezone,
  mode = "preview",
  isWeekdayEvent = false,
  availabilities = {},
  numParticipants = 0,
  hoveredSlot,
  setHoveredSlot = () => {},
  userAvailability = createEmptyUserAvailability(),
  onToggleSlot = () => {},
}: ScheduleGridProps) {
  const isMobile = useCheckMobile();

  const {
    timeBlocks,
    visibleDays,
    currentPage,
    totalPages,
    direction,
    paginate,
    error,
  } = useGridinfo(timeslots, timezone, isMobile ? 4 : 7);

  const hasPrevPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;

  if (error) return <GridError message={error} />;

  return (
    <div
      className={cn(
        "relative mb-8 grid h-full w-full grid-cols-[1fr] grid-rows-[auto_1fr]",
        mode === "preview" && "mb-0",
      )}
    >
      <ScheduleHeader
        preview={mode === "preview"}
        visibleDays={visibleDays}
        currentPage={currentPage}
        totalPages={totalPages}
        isWeekdayEvent={isWeekdayEvent}
        onPrevPage={() => paginate(-1)}
        onNextPage={() => paginate(1)}
        direction={direction}
      />

      <div
        className={cn(
          "relative flex-grow select-none overflow-x-hidden pb-1 pt-2",
          mode === "preview" && "overflow-y-auto",
        )}
      >
        <div className="z-5 pointer-events-none absolute left-0 top-2 flex w-full flex-col gap-4">
          {timeBlocks.map((block, i) => (
            <TimeColumn
              key={`labels-${i}`}
              numQuarterHours={block.numQuarterHours}
              startHour={block.startHour}
              isPreview={mode === "preview"}
            />
          ))}
        </div>

        <div className="relative flex-grow">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut" }}
              className="flex flex-col gap-4"
            >
              {timeBlocks.map((block, i) => {
                const commonProps = {
                  numQuarterHours: block.numQuarterHours,
                  numVisibleDays: visibleDays.length,
                  timeslots: block.timeslots,
                  hasPrev: hasPrevPage,
                  hasNext: hasNextPage,
                };

                if (mode === "preview") {
                  return <PreviewTimeBlock key={i} {...commonProps} />;
                } else if (mode === "paint") {
                  return (
                    <InteractiveTimeBlock
                      key={i}
                      {...commonProps}
                      availability={userAvailability}
                      onToggle={onToggleSlot}
                    />
                  );
                } else if (mode === "view") {
                  return (
                    <ResultsTimeBlock
                      key={i}
                      {...commonProps}
                      hoveredSlot={hoveredSlot}
                      availabilities={availabilities}
                      numParticipants={numParticipants}
                      onHoverSlot={setHoveredSlot}
                    />
                  );
                }
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const GridError = ({ message }: { message: string }) => (
  <div className="flex h-full w-full items-center justify-center text-sm">
    <ExclamationTriangleIcon className="text-red mr-2 h-5 w-5" />
    {message}
  </div>
);
