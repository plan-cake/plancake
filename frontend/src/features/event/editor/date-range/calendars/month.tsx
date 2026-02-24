"use client";

import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { isBefore, isAfter, isSameDay } from "date-fns";
import {
  DateRange,
  DayEventHandler,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";

import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

type CalendarProps = {
  earliestDate?: Date;
  className?: string;
  selectedRange: DateRange;
  setDateRange: (range: DateRange | undefined) => void;
  dateRangeError?: string;
};

export type CalendarHandle = {
  scrollToSelected: () => void;
};

export const Calendar = forwardRef<CalendarHandle, CalendarProps>(
  function Calendar(
    { earliestDate, className, selectedRange, setDateRange, dateRangeError },
    ref,
  ) {
    const defaultClassNames = getDefaultClassNames();

    const isMobile = useCheckMobile();
    const numberOfMonths = isMobile ? 6 : 2;
    const hideNavigation = isMobile ? true : false;

    const startDate = useMemo(() => {
      const now = new Date();
      if (earliestDate && earliestDate < now) {
        return new Date(
          earliestDate.getUTCFullYear(),
          earliestDate.getUTCMonth(),
          earliestDate.getUTCDate(),
        );
      }
      return now;
    }, [earliestDate]);

    const [month, setMonth] = useState(() => {
      // Check media query immediately during initialization
      const isMobileView =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 767px)").matches;
      return isMobileView ? startDate : selectedRange.from || startDate;
    });
    const [localRange, setLocalRange] = useState<DateRange | undefined>(
      selectedRange,
    );
    const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined);

    /**
     * Instead of giving the parent the full DOM of this component, we give it the
     * helper function. the parent will receive this function when it attaches a ref
     * to this component, and can call it to scroll the calendar to the selected date.
     */
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
      scrollToSelected: () => {
        if (!containerRef.current || !selectedRange.from) return;

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

    useEffect(() => {
      setLocalRange(selectedRange);
    }, [selectedRange]);

    /**
     * Handles the range selecting logic for the calendar.
     * If the user clicks a day and there is already a range selected, it starts a new
     * range. Otherwise, it continues the current range.
     */
    const handleSelect = (range: DateRange | undefined, selectedDay: Date) => {
      // full range already exists, start new range
      if (localRange?.from && localRange?.to) {
        const newRange = { from: selectedDay, to: undefined };
        setLocalRange(newRange);
        return;
      }

      // only start date exists, same day is clicked, create single day range
      if (
        localRange?.from &&
        !localRange?.to &&
        isSameDay(localRange.from, selectedDay)
      ) {
        const newRange = { from: selectedDay, to: selectedDay };
        setLocalRange(newRange);
        setDateRange(newRange);
        return;
      }

      // update local range to reflect the selection and update state
      setLocalRange(range);
      if (range?.from && range?.to) {
        setDateRange(range);
      }
    };

    /* RANGE PREVIEW HOVER HANDLERS */
    const handleDayMouseEnter: DayEventHandler<React.MouseEvent> = (day) => {
      if (isMobile) return;
      setHoverDate(day);
    };

    const handleDayMouseLeave: DayEventHandler<React.MouseEvent> = () => {
      if (isMobile) return;
      setHoverDate(undefined);
    };

    /**
     * MODIFIERS
     * modifiers are used to apply custom styles to groups of days:
     *  - "before_start" applies to days that are before the selected start date. There
     *    should be no range preview styles and hover styles on these days.
     *  - "range_preview" applies to days that are in between the start date and the
     *    currently hovered date, but only when the user is in the process of selecting
     *    an end date.
     */
    const isSelectingEnd = localRange?.from && !localRange?.to && hoverDate;
    const modifiers = {
      range_preview_start: (date: Date) => {
        if (!isSelectingEnd || !localRange?.from || !hoverDate) return false;
        return isSameDay(date, localRange.from);
      },
      range_preview: (date: Date) => {
        if (!isSelectingEnd || !localRange?.from || !hoverDate) return false;

        const canSelectForward =
          (isAfter(date, localRange.from) ||
            isSameDay(date, localRange.from)) &&
          (isBefore(date, hoverDate) || isSameDay(date, hoverDate));

        const canSelectBackward =
          (isBefore(date, localRange.from) ||
            isSameDay(date, localRange.from)) &&
          (isAfter(date, hoverDate) || isSameDay(date, hoverDate));

        return canSelectForward || canSelectBackward;
      },
    };

    return (
      <div ref={containerRef} className={cn("flex flex-col gap-4", className)}>
        <DayPicker
          mode="range"
          numberOfMonths={numberOfMonths}
          animate
          hideNavigation={hideNavigation}
          month={month}
          onMonthChange={setMonth}
          selected={localRange}
          onSelect={handleSelect}
          disabled={{ before: startDate }}
          onDayMouseEnter={handleDayMouseEnter}
          onDayMouseLeave={handleDayMouseLeave}
          // modifiers + styles
          modifiers={modifiers}
          modifiersClassNames={{
            range_preview: "rdp-range_preview",
            range_preview_start: "rdp-range_preview_start",
          }}
          classNames={{
            root: `${defaultClassNames.root} flex justify-center items-center`,
          }}
        />
        {!isMobile && dateRangeError && (
          <div className="text-error flex items-center justify-center gap-1 font-bold">
            <ExclamationTriangleIcon />
            {dateRangeError}
          </div>
        )}
      </div>
    );
  },
);
