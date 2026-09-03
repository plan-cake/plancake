import { Fragment, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { createEmptyUserAvailability } from "@/core/availability/utils";
import DateHeader from "@/features/event/grid/date-time/date-header";
import {
  GRID_ID,
  SIDE_WIDTH,
  TIME_LABEL_WIDTH,
} from "@/features/event/grid/date-time/lib/constants";
import useDateTimeGridinfo from "@/features/event/grid/date-time/lib/use-grid";
import GridPageIndicator from "@/features/event/grid/date-time/page-indicator";
import TimeColumn from "@/features/event/grid/date-time/time-column";
import InteractiveTimeBlock from "@/features/event/grid/date-time/timeblocks/interactive";
import PreviewTimeBlock from "@/features/event/grid/date-time/timeblocks/preview";
import ResultsTimeBlock from "@/features/event/grid/date-time/timeblocks/results";
import GridMessage from "@/features/event/grid/grid-message";
import { GridProps } from "@/features/event/grid/grid-props";
import { getHighestMatchCount } from "@/features/event/results/lib/utils";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

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

export default function DateTimeGrid({
  timeslots,
  timezone,
  mode = "preview",
  eventType,
  unselectedRange = false,
  availabilities = {},
  numParticipants = 0,
  hoveredSlot,
  setHoveredSlot = () => {},
  userAvailability = createEmptyUserAvailability(),
  onToggleSlot = () => {},
  onPageUpdate = () => {},
}: GridProps) {
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
  } = useDateTimeGridinfo(timeslots, timezone, isMobile ? 4 : 7, onPageUpdate);

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
          eventType === "weekday"
            ? MESSAGES.INFO_UNSELECTED_WEEK_RANGE
            : MESSAGES.INFO_UNSELECTED_DATE_TIME_RANGE
        }
      />
    );

  if (error) return <GridMessage error={true} message={error} />;

  return (
    <div
      className={cn(
        "relative grid h-full w-full grid-cols-[1fr] grid-rows-[auto_1fr]",
        mode === "preview" ? "bg-background md:bg-panel" : "bg-background",
      )}
      style={{ viewTransitionName: "grid" }}
      id={GRID_ID}
    >
      <DateHeader
        preview={mode === "preview"}
        visibleDays={visibleDays}
        currentPage={currentPage}
        totalPages={totalPages}
        dateBlockGaps={dateBlockGaps}
        scrollbarPresent={scrollbarPresent}
        isWeekdayEvent={eventType === "weekday"}
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
              <div
                className={cn(
                  "flex flex-col gap-2",
                  !hasPrevPage && "invisible",
                )}
              >
                <GridPageIndicator
                  side="left"
                  width={TIME_LABEL_WIDTH}
                  gapPresent={dateBlockGaps.startGap}
                  numQuarterHours={numQuarterHours}
                  numTimeBlocks={dateBlocks[0]?.timeBlocks.length}
                />
              </div>

              {dateBlockGaps.startGap && <div className="w-2" />}

              {dateBlocks.map((dBlock, dIndex) => {
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
                <GridPageIndicator
                  side="right"
                  width={SIDE_WIDTH}
                  gapPresent={dateBlockGaps.endGap}
                  numQuarterHours={numQuarterHours}
                  numTimeBlocks={dateBlocks[0]?.timeBlocks.length}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
