"use client";

import { Fragment } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";
import { SIDE_WIDTH, TIME_LABEL_WIDTH } from "@/features/event/grid/constants";
import { cn } from "@/lib/utils/classname";

interface DateHeaderProps {
  preview?: boolean;
  visibleDays: { dayKey: string; dayDisplay: string }[];
  currentPage: number;
  totalPages: number;
  dateBlockGaps: {
    startGap: boolean;
    endGap: boolean;
    middleGaps: Set<number>;
  };
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

export default function DateHeader({
  preview = false,
  visibleDays,
  currentPage,
  totalPages,
  dateBlockGaps,
  scrollbarPresent = false,
  isWeekdayEvent = false,
  onPrevPage,
  onNextPage,
  direction = 0,
}: DateHeaderProps) {
  return (
    <div
      className={cn(
        preview ? "bg-background md:bg-panel" : "bg-background",
        scrollbarPresent && "pr-4",
        "sticky top-[var(--header-height)] md:top-0",
        "z-10 col-span-2 grid h-[50px] w-full items-center justify-center",
      )}
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px 1fr ${currentPage < totalPages - 1 ? SIDE_WIDTH : 0}px`,
      }}
    >
      <div>
        {currentPage > 0 && (
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronLeftIcon />}
            onClick={onPrevPage}
            className="ml-3 p-1.5"
            aria-label="Previous Page"
            tooltip="Previous Page"
          />
        )}
      </div>

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
            {dateBlockGaps.startGap && <div className="w-2" />}

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

                  {dateBlockGaps.middleGaps.has(i) && <div className="w-2" />}
                </Fragment>
              );
            })}

            {dateBlockGaps.endGap && <div className="w-2" />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div>
        {currentPage < totalPages - 1 && (
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronRightIcon />}
            onClick={onNextPage}
            className="p-1.5"
            aria-label="Next Page"
            tooltip="Next Page"
          />
        )}
      </div>
    </div>
  );
}
