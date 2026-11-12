"use client";

import { Fragment, useMemo } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import PageDots from "@/components/page-dots";
import ActionButton from "@/features/button/components/action";
import { SIDE_WIDTH, TIME_LABEL_WIDTH } from "@/features/event/grid/constants";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
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
  isStatic?: boolean;
  isWeekdayEvent?: boolean;
  paginate: (direction: number) => void;
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

const MONTH_TO_NUM: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
} as const;
const condenseMonth = (month: string) => {
  return MONTH_TO_NUM[month] ?? month;
};
const condenseWeekday = (weekday: string) => {
  return weekday === "Thu" ? "R" : weekday === "Sun" ? "U" : weekday[0];
};

export default function DateHeader({
  preview = false,
  visibleDays,
  currentPage,
  totalPages,
  dateBlockGaps,
  scrollbarPresent = false,
  isStatic = false,
  isWeekdayEvent = false,
  paginate,
  direction = 0,
}: DateHeaderProps) {
  const isMobile = useCheckMobile();
  const compact = useMemo(
    () => (isMobile ? visibleDays.length > 4 : visibleDays.length > 7),
    [isMobile, visibleDays.length],
  );

  const rightPadding = useMemo(() => {
    const pageIndicatorWidth = currentPage < totalPages - 1 ? SIDE_WIDTH : 0;
    const scrollbarWidth = scrollbarPresent ? 20 : 8;
    return pageIndicatorWidth + scrollbarWidth;
  }, [currentPage, totalPages, scrollbarPresent]);

  return (
    <div
      className={cn(
        "z-10 w-full",
        preview ? "bg-background md:bg-panel" : "bg-background",
        !isStatic && "sticky top-0",
      )}
    >
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-2 pt-2 md:justify-center">
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronLeftIcon />}
            onClick={() => paginate(-1)}
            aria-label="Previous Page"
            tooltip="Previous Page"
            disabled={currentPage === 0}
          />

          <div className="flex min-w-0 flex-col items-center">
            <div className="font-semibold" role="status">
              Page {currentPage + 1}/{totalPages}
            </div>
            <PageDots
              count={totalPages}
              activeIndex={currentPage}
              onSelect={(index) => {
                if (index !== currentPage) {
                  paginate(index - currentPage);
                }
              }}
              itemLabel="page"
            />
          </div>

          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronRightIcon />}
            onClick={() => paginate(1)}
            aria-label="Next Page"
            tooltip="Next Page"
            disabled={currentPage === totalPages - 1}
          />
        </div>
      )}
      <div
        className="h-[50px]"
        style={{
          gridTemplateColumns: `1fr`,
          paddingLeft: `${TIME_LABEL_WIDTH}px`,
          paddingRight: `${rightPadding}px`,
        }}
      >
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
                    <div
                      className={cn(
                        "flex flex-1 flex-col items-center justify-center text-sm leading-tight",
                        ["Sat", "Sun"].includes(weekday) && "opacity-60",
                        compact && "tracking-tighter lg:tracking-normal",
                      )}
                    >
                      <div>
                        <span className={compact ? "lg:hidden" : "hidden"}>
                          {condenseWeekday(weekday)}
                        </span>
                        <span className={compact ? "hidden lg:block" : ""}>
                          {weekday}
                        </span>
                      </div>
                      {!isWeekdayEvent && (
                        <div className="flex">
                          <span className={compact ? "xl:hidden" : "hidden"}>
                            {condenseMonth(month)}/
                          </span>
                          <span
                            className={
                              compact ? "hidden xl:mr-1 xl:block" : "mr-1"
                            }
                          >
                            {month}
                          </span>
                          <span>{day.replace(/^0+/, "")}</span>
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
      </div>
    </div>
  );
}
