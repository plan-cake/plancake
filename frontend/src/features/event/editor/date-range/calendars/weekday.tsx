"use client";

import { useState } from "react";

import { ALL_WEEKDAYS, Weekday } from "@/core/event/types";
import { cn } from "@/lib/utils/classname";

type WeekdayCalendarProps = {
  selectedDays: Weekday[];
  onChange: (days: Weekday[]) => void;
};

export default function WeekdayCalendar({
  selectedDays,
  onChange,
}: WeekdayCalendarProps) {
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);

  const handleDayClick = (index: number) => {
    if (anchorIndex === null) {
      setAnchorIndex(index);
      onChange([ALL_WEEKDAYS[index]]);
    } else {
      const min = Math.min(anchorIndex, index);
      const max = Math.max(anchorIndex, index);

      const newRange = ALL_WEEKDAYS.slice(min, max + 1);

      onChange(newRange);
      setAnchorIndex(null);
    }
  };

  const selectedIndices = selectedDays
    .map((d) => ALL_WEEKDAYS.indexOf(d))
    .filter((i) => i !== -1);

  const start = selectedIndices.length > 0 ? Math.min(...selectedIndices) : -1;
  const end = selectedIndices.length > 0 ? Math.max(...selectedIndices) : -1;

  return (
    <div className="flex w-full select-none flex-row flex-wrap">
      {ALL_WEEKDAYS.map((day, index) => {
        const isActive = index >= start && index <= end;
        const isRangeStart = index === start;
        const isRangeEnd = index === end;

        return (
          <button
            key={day}
            onClick={() => handleDayClick(index)}
            className={cn(
              "flex h-8 w-10 items-center justify-center px-6",
              "hover:bg-accent/25 active:bg-accent/40",

              // Inactive State
              !isActive && "text-muted-foreground rounded-full",

              // Active State
              isActive && "bg-accent/15 text-accent-text",

              // Contiguous Rounding Logic
              isActive && isRangeStart && "rounded-l-full",
              isActive && isRangeEnd && "rounded-r-full",
              isActive && !isRangeStart && !isRangeEnd && "rounded-none",

              // Single Day Case (Start == End)
              isActive && isRangeStart && isRangeEnd && "rounded-full",
            )}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}
