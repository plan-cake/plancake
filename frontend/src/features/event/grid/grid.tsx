import { Fragment, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlertIcon } from "lucide-react";

import {
  AvailabilitySet,
  ResultsAvailabilityMap,
} from "@/core/availability/types";
import { createEmptyUserAvailability } from "@/core/availability/utils";
import {
  SIDE_WIDTH,
  TIME_LABEL_WIDTH,
} from "@/features/event/grid/lib/constants";
import useGridinfo from "@/features/event/grid/lib/use-grid";
import ScheduleHeader from "@/features/event/grid/schedule-header";
import TimeColumn from "@/features/event/grid/time-column";
import InteractiveTimeBlock from "@/features/event/grid/timeblocks/interactive";
import PreviewTimeBlock from "@/features/event/grid/timeblocks/preview";
import ResultsTimeBlock from "@/features/event/grid/timeblocks/results";
import { getHighestMatchCount } from "@/features/event/results/lib/utils";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

interface ScheduleGridProps {
  mode: "paint" | "view" | "preview";
  timeslots: Date[];
  timezone: string;
  isWeekdayEvent?: boolean;

  unselectedRange?: boolean;

  // for "view" mode
  availabilities?: ResultsAvailabilityMap;
  numParticipants?: number;
  hoveredSlot?: string | null;
  setHoveredSlot?: (slotIso: string | null) => void;

  // for "paint" mode
  userAvailability?: AvailabilitySet;
  onToggleSlot?: (slotIso: string, togglingOn: boolean) => void;

  // for pagination
  onPageUpdate?: (index: number, pages: number) => void;
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
  unselectedRange = false,
  availabilities = {},
  numParticipants = 0,
  hoveredSlot,
  setHoveredSlot = () => {},
  userAvailability = createEmptyUserAvailability(),
  onToggleSlot = () => {},
  onPageUpdate = () => {},
}: ScheduleGridProps) {
  const isMobile = useCheckMobile();

  const {
    dateBlocks,
    dateBlockGaps,
    visibleDays,
    currentPage,
    totalPages,
    direction,
    paginate,
    error,
  } = useGridinfo(timeslots, timezone, isMobile ? 4 : 7, onPageUpdate);

  // Initial onPageUpdate callback to report pagination info to parent
  // Also triggers if the user changes between mobile and desktop layouts
  const reportedTotalPages = useRef<number | null>(null);
  useEffect(() => {
    if (reportedTotalPages.current !== totalPages) {
      onPageUpdate(currentPage, totalPages);
      reportedTotalPages.current = totalPages;
    }
  }, [onPageUpdate, currentPage, totalPages]);

  const hasPrevPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;

  // Check if the scrollbar is present to pass to the header
  const [scrollbarPresent, setScrollbarPresent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScrollbar = () =>
      // Include mobile check because it will report true even if the scrollbar is hidden
      setScrollbarPresent(el.scrollHeight > el.clientHeight && !isMobile);
    const resizeObserver = new ResizeObserver(checkScrollbar);
    resizeObserver.observe(el);
    checkScrollbar();

    return () => resizeObserver.disconnect();
  });

  // Dateblocks logic
  const numQuarterHours =
    dateBlocks[0]?.timeBlocks?.map((block) => block.numQuarterHours) || [];

  if (unselectedRange)
    return (
      <GridMessage
        error={false}
        message={
          isWeekdayEvent
            ? MESSAGES.INFO_UNSELECTED_WEEK_RANGE
            : MESSAGES.INFO_UNSELECTED_DATE_RANGE
        }
      />
    );

  if (error) return <GridMessage error={true} message={error} />;

  return (
    <div className="relative grid h-full w-full grid-cols-[1fr] grid-rows-[auto_1fr]">
      <ScheduleHeader
        preview={mode === "preview"}
        visibleDays={visibleDays}
        currentPage={currentPage}
        totalPages={totalPages}
        dateBlockGaps={dateBlockGaps}
        scrollbarPresent={scrollbarPresent}
        isWeekdayEvent={isWeekdayEvent}
        onPrevPage={() => paginate(-1)}
        onNextPage={() => paginate(1)}
        direction={direction}
      />

      <div
        ref={scrollRef}
        className={cn(
          "relative flex-grow select-none overflow-x-hidden pt-2",
          !isMobile ? "overflow-y-auto" : "overflow-y-hidden",
          mode === "preview" ? "pb-1" : "pb-6",
        )}
      >
        <div className="z-5 pointer-events-none absolute left-0 top-2 flex w-full flex-col gap-3">
          {dateBlocks[0]?.timeBlocks.map((block, i) => (
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
              className="flex"
            >
              <div className="flex flex-col gap-2">
                {dateBlocks[0]?.timeBlocks.map((_, i) => (
                  <div
                    key={`border-left-${i}`}
                    className={cn(
                      !hasPrevPage && "invisible",
                      "pointer-events-none relative grid",
                      "divide-foreground/75 border-foreground/75 divide-y divide-dashed border border-l-0",
                      !dateBlockGaps.startGap && "border-r-0",
                    )}
                    style={{
                      gridTemplateColumns: `${TIME_LABEL_WIDTH}px`,
                      gridTemplateRows: `repeat(${numQuarterHours[i]}, minmax(20px, 1fr))`,
                      maskImage: "linear-gradient(to left, black, transparent)",
                      WebkitMaskImage:
                        "linear-gradient(to left, black, transparent)",
                    }}
                  >
                    {Array.from({ length: numQuarterHours[i] }).map(
                      (_, idx) => (
                        <div
                          key={`border-left-${idx}`}
                          style={{ gridRow: idx + 1, gridColumn: 1 }}
                        />
                      ),
                    )}
                  </div>
                ))}
              </div>

              {dateBlockGaps.startGap && <div className="w-2" />}

              {dateBlocks.map((dBlock, dIndex) => {
                const isFirstDateBlock = dIndex === 0;
                const isLastDateBlock = dIndex === dateBlocks.length - 1;

                return (
                  <Fragment key={`date-block-fragment-${dIndex}`}>
                    <div
                      className="flex flex-col gap-2"
                      style={{
                        flex: dBlock.numDays,
                      }}
                    >
                      {dBlock.timeBlocks.map((tBlock, tIndex) => {
                        const commonProps = {
                          numQuarterHours: tBlock.numQuarterHours,
                          numVisibleDays: dBlock.numDays,
                          timeslots: tBlock.timeslots,
                          hasPrev: isFirstDateBlock && hasPrevPage,
                          hasNext: isLastDateBlock && hasNextPage,
                        };

                        if (mode === "preview") {
                          return (
                            <PreviewTimeBlock
                              key={`preview-${dIndex}-${tIndex}`}
                              {...commonProps}
                            />
                          );
                        } else if (mode === "paint") {
                          return (
                            <InteractiveTimeBlock
                              key={`interactive-${dIndex}-${tIndex}`}
                              {...commonProps}
                              availability={userAvailability}
                              onToggle={onToggleSlot}
                            />
                          );
                        } else if (mode === "view") {
                          return (
                            <ResultsTimeBlock
                              key={`results-${dIndex}-${tIndex}`}
                              {...commonProps}
                              hoveredSlot={hoveredSlot}
                              availabilities={availabilities}
                              numParticipants={numParticipants}
                              highestMatchCount={getHighestMatchCount(
                                availabilities,
                              )}
                              onHoverSlot={setHoveredSlot}
                            />
                          );
                        }
                      })}
                    </div>
                    {!isLastDateBlock && <div className="w-2" />}
                  </Fragment>
                );
              })}

              {dateBlockGaps.endGap && <div className="w-2" />}

              {hasNextPage && (
                <div className="flex flex-col gap-2">
                  {dateBlocks[0]?.timeBlocks.map((_, i) => (
                    <div
                      key={`border-right-${i}`}
                      className={cn(
                        "pointer-events-none relative grid",
                        "divide-foreground/75 border-foreground/75 divide-y divide-dashed border border-r-0",
                        !dateBlockGaps.endGap && "border-l-0",
                      )}
                      style={{
                        gridTemplateColumns: `${SIDE_WIDTH}px`,
                        gridTemplateRows: `repeat(${numQuarterHours[i]}, minmax(20px, 1fr))`,
                        maskImage:
                          "linear-gradient(to right, black, transparent)",
                        WebkitMaskImage:
                          "linear-gradient(to right, black, transparent)",
                      }}
                    >
                      {Array.from({ length: numQuarterHours[i] }).map(
                        (_, idx) => (
                          <div
                            key={`border-right-${idx}`}
                            style={{ gridRow: idx + 1, gridColumn: 1 }}
                          />
                        ),
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const GridMessage = ({
  error,
  message,
}: {
  error: boolean;
  message: string;
}) => (
  <div
    className={cn(
      "flex h-full w-full items-center justify-center gap-2 text-center text-sm",
      !error && "opacity-75",
    )}
  >
    {error && <TriangleAlertIcon className="text-error h-5 w-5" />}
    {message}
  </div>
);
