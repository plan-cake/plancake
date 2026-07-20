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
  compact: boolean;
  currentPage: number;
  totalPages: number;
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
  compact,
  currentPage,
  totalPages,
  scrollbarPresent = false,
  isWeekdayEvent = false,
  onPrevPage,
  onNextPage,
  direction = 0,
}: ScheduleHeaderProps) {
  const { topMarginClass } = useHeaderSize();

  return (
    <div
      className={cn(
        preview ? "bg-background md:bg-panel" : "bg-background",
        topMarginClass,
        scrollbarPresent && "pr-4",
        "sticky z-10 col-span-2 grid h-[50px] w-full items-center justify-center",
      )}
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px 1fr ${currentPage < totalPages - 1 ? SIDE_WIDTH : 10}px`,
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
            className="absolute inset-0 grid h-full w-full items-center"
            style={{
              gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)`,
            }}
          >
            {visibleDays.map(({ dayDisplay }, i) => {
              const [weekday, month, day] = dayDisplay.split(" ");
              const condenseWeekday = (weekday: string) => {
                return weekday === "Thu"
                  ? "R"
                  : weekday === "Sun"
                    ? "U"
                    : weekday[0];
              };
              const condenseMonth = (month: string) => {
                const date = new Date(`${month} 1, 2020`);
                return date.getMonth() + 1;
              };

              return (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col items-center justify-center text-sm leading-tight",
                    ["Sat", "Sun"].includes(weekday) && "opacity-60",
                    compact && "tracking-tighter lg:tracking-normal",
                  )}
                >
                  <div>
                    <span className={compact ? "lg:hidden" : "hidden"}>
                      {condenseWeekday(weekday)}
                    </span>
                    <span className={compact ? "hidden lg:block" : ""}>
                      {isWeekdayEvent ? weekday.toUpperCase() : weekday}
                    </span>
                  </div>
                  {!isWeekdayEvent && (
                    <div className="flex">
                      <span className={compact ? "xl:hidden" : "hidden"}>
                        {condenseMonth(month)}/
                      </span>
                      <span
                        className={compact ? "hidden xl:mr-1 xl:block" : "mr-1"}
                      >
                        {month}
                      </span>
                      <span>{day.replace(/^0+/, "")}</span>
                    </div>
                  )}
                </div>
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
          />
        </div>
      ) : (
        <div style={{ width: `${SIDE_WIDTH}px` }} />
      )}
    </div>
  );
}
