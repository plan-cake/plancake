"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { parseISO } from "date-fns";
import { TriangleAlertIcon } from "lucide-react";
import {
  DayButton,
  DayButtonProps,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";

import useDateRangeDrag from "@/features/event/editor/dates/date-range/use-drag";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

type CalendarProps = {
  earliestDate?: Date;
  className?: string;
  selectedDates: Set<string>;
  setDates: (dates: Set<string>) => void;
  dateRangeError?: string;
};

export type CalendarHandle = {
  scrollToSelected: () => void;
};

export const Calendar = forwardRef<CalendarHandle, CalendarProps>(
  function Calendar(
    { earliestDate, className, selectedDates, setDates, dateRangeError },
    ref,
  ) {
    const defaultClassNames = getDefaultClassNames();

    const isMobile = useCheckMobile();
    const numberOfMonths = isMobile ? 1 : 2;

    const startDate = useMemo(() => {
      const now = new Date();
      if (earliestDate && earliestDate < now) {
        return earliestDate;
      }
      return now;
    }, [earliestDate]);

    const selectedDatesArray = useMemo(() => {
      return Array.from(selectedDates).map((date) => parseISO(date));
    }, [selectedDates]);
    const firstSelectedDate = selectedDatesArray.length
      ? new Date(selectedDatesArray.reduce((a, b) => (a < b ? a : b)))
      : null;

    const [month, setMonth] = useState(() => {
      // Check media query immediately during initialization
      const isMobileView =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 767px)").matches;
      return isMobileView ? startDate : firstSelectedDate || startDate;
    });

    /**
     * Instead of giving the parent the full DOM of this component, we give it the
     * helper function. the parent will receive this function when it attaches a ref
     * to this component, and can call it to scroll the calendar to the selected date.
     */
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
      scrollToSelected: () => {
        if (!containerRef.current || !firstSelectedDate) return;

        const selectedEl = containerRef.current.querySelector(
          ".rdp-selected:not(.rdp-outside)",
        );

        if (selectedEl) {
          const monthEl = selectedEl.closest(".rdp-month");
          if (monthEl) {
            monthEl.scrollIntoView({ behavior: "auto", block: "start" });
          } else {
            selectedEl.scrollIntoView({ behavior: "auto", block: "center" });
          }
        }
      },
    }));

    const getDateString = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    /**
     * Just toggles the day within the set.
     */
    const handleSelect = (dates: Date[] | undefined) => {
      if (!dates) {
        setDates(new Set());
      } else {
        setDates(new Set(dates.map((date) => getDateString(date))));
      }
    };

    const {
      hoveredDate,
      dragState,
      handlePointerDown,
      handlePointerEnter,
      handlePointerLeave,
      handleTouchMove,
    } = useDateRangeDrag({
      selectedDates,
      setDates,
    });

    /**
     * MODIFIERS
     * Modifiers are used to apply custom styles to groups of days. A group is just
     * multiple contiguous days that are selected, and there can be multiple groups.
     */
    const modifiers = {
      group_start: (date: Date) => {
        const prevDate = new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
        );
        prevDate.setDate(prevDate.getDate() - 1);
        return (
          (selectedDates.has(getDateString(date)) ||
            dragState.dragRange.has(getDateString(date))) &&
          !selectedDates.has(getDateString(prevDate)) &&
          !dragState.dragRange.has(getDateString(prevDate))
        );
      },
      group_end: (date: Date) => {
        const nextDate = new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
        );
        nextDate.setDate(nextDate.getDate() + 1);
        return (
          (selectedDates.has(getDateString(date)) ||
            dragState.dragRange.has(getDateString(date))) &&
          !selectedDates.has(getDateString(nextDate)) &&
          !dragState.dragRange.has(getDateString(nextDate))
        );
      },
      drag_enabling: (date: Date) => {
        return (
          dragState.isDragging &&
          dragState.isEnabling &&
          dragState.dragRange.has(getDateString(date)) &&
          !selectedDates.has(getDateString(date))
        );
      },
      drag_disabling: (date: Date) => {
        return (
          dragState.isDragging &&
          !dragState.isEnabling &&
          dragState.dragRange.has(getDateString(date)) &&
          selectedDates.has(getDateString(date))
        );
      },
      hovered: (date: Date) => {
        return (
          !dragState.isDragging &&
          !!hoveredDate &&
          getDateString(date) === hoveredDate
        );
      },
    };

    return (
      <div ref={containerRef} className={cn("flex flex-col gap-2", className)}>
        <DayPicker
          mode="multiple"
          numberOfMonths={numberOfMonths}
          animate
          month={month}
          onMonthChange={setMonth}
          selected={selectedDatesArray}
          onSelect={handleSelect}
          disabled={{ before: startDate }}
          startMonth={startDate}
          endMonth={new Date(startDate.getFullYear() + 1, startDate.getMonth())}
          // modifiers + styles
          modifiers={modifiers}
          modifiersClassNames={{
            group_start: "rdp-group_start",
            group_end: "rdp-group_end",
            drag_enabling: "rdp-drag_enabling",
            drag_disabling: "rdp-drag_disabling",
            hovered: "rdp-hovered",
          }}
          components={{
            DayButton: (props) => (
              <DraggableDayButton
                {...props}
                handlePointerDown={handlePointerDown}
                handlePointerEnter={handlePointerEnter}
                handlePointerLeave={handlePointerLeave}
                handleTouchMove={handleTouchMove}
              />
            ),
          }}
          classNames={{
            root: `${defaultClassNames.root} flex justify-center items-center select-none`,
          }}
        />
        {!isMobile && (
          <div className="flex items-center justify-between gap-2">
            <span className="opacity-50">{MESSAGES.INFO_DRAG_DATES}</span>
            {dateRangeError && (
              <div className="text-error flex items-center gap-1 font-bold">
                <TriangleAlertIcon className="h-4 w-4" strokeWidth={2} />
                {dateRangeError}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

function DraggableDayButton({
  day,
  modifiers,
  handlePointerDown,
  handlePointerEnter,
  handlePointerLeave,
  handleTouchMove,
  ...buttonProps
}: DayButtonProps & {
  handlePointerDown: (date: Date) => void;
  handlePointerEnter: (date: Date) => void;
  handlePointerLeave: () => void;
  handleTouchMove: (event: React.TouchEvent<HTMLButtonElement>) => void;
}) {
  return (
    <DayButton
      {...buttonProps}
      data-day={day.date}
      day={day}
      modifiers={modifiers}
      onPointerDown={() => {
        handlePointerDown(day.date);
      }}
      onPointerEnter={() => {
        handlePointerEnter(day.date);
      }}
      onPointerLeave={handlePointerLeave}
      onTouchMove={(e) => {
        handleTouchMove(e);
      }}
    />
  );
}
