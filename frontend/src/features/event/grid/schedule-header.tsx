"use client";

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
  const { topMarginClass } = useHeaderSize();

  const gridWidth = (visibleDays.length / maxColumns) * 100;

  return (
    <div
      className={cn(
        preview ? "md:bg-panel top-0" : cn(topMarginClass, "bg-background"),
        scrollbarPresent && "pr-4",
        "sticky z-10 col-span-2 grid h-[50px] w-full items-center justify-start",
      )}
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px minmax(0, ${gridWidth}%) ${SIDE_WIDTH}px`,
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
      <div className="relative h-full w-full select-none overflow-hidden">
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
              gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)`,
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

      <div className="flex h-full items-center justify-center">
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
