"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";
import {
  SIDE_WIDTH,
  TIME_LABEL_WIDTH,
} from "@/features/event/grid/lib/constants";
import { cn } from "@/lib/utils/classname";

interface ScheduleHeaderProps {
  preview?: boolean;
  visibleDays: { dayKey: string; dayDisplay: string }[];
  currentPage: number;
  totalPages: number;
  maxColumns: number;
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
  maxColumns,
  scrollbarPresent = false,
  isWeekdayEvent = false,
  onPrevPage,
  onNextPage,
  direction = 0,
}: ScheduleHeaderProps) {
  const visibleDaysCount = visibleDays.length;
  const emptyColumnsCount = maxColumns - visibleDaysCount;

  return (
    <div
      className={cn(
       preview ? "bg-background md:bg-panel" : "bg-background",
       scrollbarPresent && "pr-4",
       "sticky top-[var(--header-height)] md:top-0",
       "z-10 col-span-2 grid h-[50px] w-full items-center justify-start",
      )}
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${visibleDaysCount}, 1fr) ${
          emptyColumnsCount > 0 ? `repeat(${emptyColumnsCount}, 1fr)` : ""
        } ${SIDE_WIDTH}px`,
      }}
    >
      <div className="flex h-full items-center justify-center">
        {currentPage > 0 && (
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronLeftIcon />}
            onClick={onPrevPage}
            className="p-1.5"
            aria-label="Previous Page"
            tooltip="Previous Page"
          />
        )}
      </div>

       {/* This container takes up the '1fr' space */}
      <div
        className="relative h-full w-full select-none overflow-hidden"
        style={{
          gridColumn: `2 / span ${visibleDaysCount}`,
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut" }}
            className="absolute inset-0 grid h-full w-full items-center"
            style={{
              gridTemplateColumns: `repeat(${visibleDaysCount}, 1fr)`,
            }}
          >
            {visibleDays.map(({ dayDisplay }, i) => {
              const [weekday, month, day] = dayDisplay.split(" ");

              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center text-sm font-medium leading-tight"
                >
                  <div>{isWeekdayEvent ? weekday.toUpperCase() : weekday}</div>
                  {!isWeekdayEvent && (
                    <div>
                      {month} {day.replace(/^0+/, "")}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="flex h-full items-center justify-center"
        style={{ gridColumn: maxColumns + 2 }}
      >
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
