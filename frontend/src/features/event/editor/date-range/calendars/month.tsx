"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { TriangleAlertIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

type CalendarProps = {
  earliestDate?: Date;
  className?: string;
  selectedDates: Set<Date>;
  setDates: (dates: Set<Date>) => void;
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

    const selectedDatesArray = useMemo(() => {
      return Array.from(selectedDates).sort(
        (a, b) => a.getTime() - b.getTime(),
      );
    }, [selectedDates]);
    const firstSelectedDate = selectedDatesArray[0] || null;

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

    /**
     * Just toggles the day within the set.
     */
    const handleSelect = (dates: Date[] | undefined) => {
      if (!dates) {
        setDates(new Set());
      } else {
        setDates(new Set(dates));
      }
    };

    // /**
    //  * PRECOMPUTED PREVIEW RANGE
    //  * Avoids recalculating start/end boundaries for every day cell.
    //  */
    // const previewRange = useMemo(() => {
    //   if (!localRange?.from || localRange?.to || !hoverDate) {
    //     return null;
    //   }

    //   const isHoverBeforeStart = isBefore(hoverDate, localRange.from);

    //   return {
    //     start: isHoverBeforeStart ? hoverDate : localRange.from,
    //     end: isHoverBeforeStart ? localRange.from : hoverDate,
    //   };
    // }, [localRange?.from, localRange?.to, hoverDate]);

    /**
     * MODIFIERS
     * modifiers are used to apply custom styles to groups of days:
     *  - "before_start" applies to days that are before the selected start date. There
     *    should be no range preview styles and hover styles on these days.
     *  - "range_preview" applies to days that are in between the start date and the
     *    currently hovered date, but only when the user is in the process of selecting
     *    an end date.
     */
    const modifiers = {
      // range_preview_start: (date: Date) => {
      //   if (!previewRange) return false;
      //   return isSameDay(date, previewRange.start);
      // },
      // range_preview_end: (date: Date) => {
      //   if (!previewRange) return false;
      //   return isSameDay(date, previewRange.end);
      // },
      // range_preview_middle: (date: Date) => {
      //   if (!previewRange) return false;
      //   return (
      //     isAfter(date, previewRange.start) && isBefore(date, previewRange.end)
      //   );
      // },
    };

    return (
      <div ref={containerRef} className={cn("flex flex-col gap-4", className)}>
        <DayPicker
          mode="multiple"
          numberOfMonths={numberOfMonths}
          animate
          hideNavigation={hideNavigation}
          month={month}
          onMonthChange={setMonth}
          selected={selectedDatesArray}
          onSelect={handleSelect}
          disabled={{ before: startDate }}
          // modifiers + styles
          modifiers={modifiers}
          modifiersClassNames={{
            range_preview_start: "rdp-range_preview_start",
            range_preview_middle: "rdp-range_preview_middle",
            range_preview_end: "rdp-range_preview_end",
          }}
          classNames={{
            root: `${defaultClassNames.root} flex justify-center items-center`,
          }}
        />
        {!isMobile && dateRangeError && (
          <div className="text-error flex items-center justify-center gap-1 font-bold">
            <TriangleAlertIcon />
            {dateRangeError}
          </div>
        )}
      </div>
    );
  },
);
