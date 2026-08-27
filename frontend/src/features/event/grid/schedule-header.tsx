"use client";

import { Fragment, useMemo } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";
import {
  SIDE_WIDTH,
  TIME_LABEL_WIDTH,
} from "@/features/event/grid/lib/constants";
import { useHeaderSize } from "@/features/header/context";
import { cn } from "@/lib/utils/classname";

interface ScheduleHeaderProps {
  preview?: boolean;
  visibleDays: { dayKey: string; dayDisplay: string }[];
  currentPage: number;
  totalPages: number;
  dateBlocks: { numDays: number; pastStart: boolean; pastEnd: boolean }[];
  scrollbarPresent?: boolean;
  isWeekdayEvent?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  direction?: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "50%" : "-50%",
    opacity: 0,
  }),
};

export default function ScheduleHeader({
  preview = false,
  visibleDays,
  currentPage,
  totalPages,
  dateBlocks,
  scrollbarPresent = false,
  isWeekdayEvent = false,
  onPrevPage,
  onNextPage,
  direction = 0,
}: ScheduleHeaderProps) {
  const { topMarginClass } = useHeaderSize();

  // Which indexed dates need gaps after them to match the date blocks
  // -1 means before the first block
  const gaps = useMemo(() => {
    const gapIndices = new Set<number>();
    let runningTotalDays = 0;

    for (let i = 0; i < dateBlocks.length; i++) {
      const block = dateBlocks[i];
      if (currentPage !== 0 && i === 0 && !block.pastStart) {
        gapIndices.add(-1);
      }
      if (
        currentPage !== totalPages - 1 &&
        i === dateBlocks.length - 1 &&
        !block.pastEnd
      ) {
        gapIndices.add(visibleDays.length - 1);
      }
      if (i > 0) {
        runningTotalDays += dateBlocks[i - 1].numDays;
        gapIndices.add(runningTotalDays - 1);
      }
    }
    return gapIndices;
  }, [dateBlocks, currentPage, visibleDays.length, totalPages]);

  return (
    <div
      className={cn(
        preview ? "md:bg-panel top-0" : cn(topMarginClass, "bg-background"),
        scrollbarPresent && "pr-4",
        "sticky z-10 col-span-2 grid h-[50px] w-full items-center justify-center",
      )}
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px 1fr ${currentPage < totalPages - 1 ? SIDE_WIDTH : 0}px`,
      }}
    >
      {currentPage > 0 ? (
        <div>
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronLeftIcon />}
            onClick={onPrevPage}
            className="ml-3 p-1.5"
            aria-label="Previous Page"
            tooltip="Previous Page"
          />
        </div>
      ) : (
        <div style={{ width: `${SIDE_WIDTH}px` }} />
      )}

      {/* This container takes up the '1fr' space */}
      <div className="relative grid h-full select-none overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut" }}
            className="absolute inset-0 flex h-full w-full items-center"
          >
            {gaps.has(-1) && <div className="w-4" />}

            {visibleDays.map(({ dayDisplay }, i) => {
              const [weekday, month, day] = dayDisplay.split(" ");

              return (
                <Fragment key={`header-fragment-${i}`}>
                  <div className="flex flex-1 flex-col items-center justify-center text-sm font-medium leading-tight">
                    <div>
                      {isWeekdayEvent ? weekday.toUpperCase() : weekday}
                    </div>
                    {!isWeekdayEvent && (
                      <div>
                        {month} {day.replace(/^0+/, "")}
                      </div>
                    )}
                  </div>

                  {gaps.has(i) && <div className="w-4" />}
                </Fragment>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {currentPage < totalPages - 1 ? (
        <div>
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronRightIcon />}
            onClick={onNextPage}
            className="p-1.5"
            aria-label="Next Page"
            tooltip="Next Page"
          />
        </div>
      ) : (
        <div style={{ width: `${SIDE_WIDTH}px` }} />
      )}
    </div>
  );
}
