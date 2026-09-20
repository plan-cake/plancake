import { useMemo } from "react";

import { ALL_WEEKDAYS } from "@/core/event/types";
import CalendarDay, {
  CalendarDayProps,
} from "@/features/event/grid/calendar/calendar-day";
import {
  CalendarGridDayDisplay,
  CalendarGridMonth,
} from "@/features/event/grid/calendar/types";
import { NONEXISTENT_SLOT_PATTERN } from "@/features/event/grid/constants";
import { cn } from "@/lib/utils/classname";

export default function BaseMonthBlock({
  month,
  backgroundColor,
  getDayProps,
}: {
  month: CalendarGridMonth;
  backgroundColor: string;
  getDayProps?: (dayString: string) => Partial<CalendarDayProps>;
}) {
  const weeks = useMemo(() => {
    const firstDayOfMonth = new Date(
      parseInt(month.month.split("-")[0]),
      parseInt(month.month.split("-")[1]) - 1,
      1,
    );
    const firstDayOfMonthWeekday = firstDayOfMonth.getUTCDay();
    const lastDayOfMonth = new Date(
      parseInt(month.month.split("-")[0]),
      parseInt(month.month.split("-")[1]),
      0,
    );
    const lastDayOfMonthWeekday = lastDayOfMonth.getUTCDay();

    const weeks = [];
    let currentWeek: {
      days: {
        dayString: string;
        display: CalendarGridDayDisplay;
        rightBorder: boolean;
      }[];
    } = { days: [] };

    // Fill in the days before the first of the month
    for (let i = 0; i < firstDayOfMonthWeekday; i++) {
      currentWeek.days.push({
        dayString: "",
        display: "empty",
        rightBorder: i === firstDayOfMonthWeekday - 1,
      });
    }

    // Fill in the days of the month
    for (let day = 1; day <= lastDayOfMonth.getUTCDate(); day++) {
      const dayString = `${month.month}-${day.toString().padStart(2, "0")}`;
      currentWeek.days.push({
        dayString,
        display: month.activeDays.has(dayString) ? "active" : "disabled",
        rightBorder: false,
      });

      if (currentWeek.days.length === 7) {
        weeks.push(currentWeek);
        currentWeek = { days: [] };
      }
    }

    // Fill in the days after the last of the month
    for (let i = lastDayOfMonthWeekday + 1; i < 7; i++) {
      currentWeek.days.push({
        dayString: "",
        display: "empty",
        rightBorder: false,
      });
    }

    if (currentWeek.days.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [month]);

  const monthDisplay = useMemo(() => {
    const [parsedYear, parsedMonth] = month.month.split("-");
    const date = new Date(parseInt(parsedYear), parseInt(parsedMonth) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  }, [month]);

  return (
    <div>
      <div
        className={cn(
          "top-(--header-height) sticky z-10 md:top-0",
          `bg-${backgroundColor}`,
          "border-foreground/75 w-full border-b border-dashed",
        )}
      >
        <div className="text-lg font-bold">{monthDisplay}</div>
        <div className="h-6.25 flex w-full">
          {ALL_WEEKDAYS.map((day, index) => {
            return (
              <div
                key={index}
                className="flex h-full w-full items-center justify-center text-sm"
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          backgroundImage: NONEXISTENT_SLOT_PATTERN,
        }}
        className="[--week-height:60px] md:[--week-height:80px]"
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(7, 1fr)",
            gridTemplateRows: `repeat(${weeks.length}, minmax(var(--week-height), 1fr))`,
            // borderTopStyle: hasPrev ? "dashed" : undefined,
            // borderBottomStyle: hasNext ? "dashed" : undefined,
          }}
        >
          {weeks.map((week, wIndex) =>
            week.days.map((day, dIndex) => {
              const commonProps = {
                dayString: day.dayString,
                display: day.display,
                rightBorder: day.rightBorder,
                gridColumn: dIndex + 1,
                gridRow: wIndex + 1,
                numRows: weeks.length,
                backgroundColor,
              };

              const dayProps =
                day.display === "active" ? getDayProps?.(day.dayString) : {};

              return (
                <CalendarDay key={dIndex} {...commonProps} {...dayProps} />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
