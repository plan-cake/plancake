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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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

  let highlightStart = -1;
  let highlightEnd = -1;
  if (selectedIndices.length > 0 && anchorIndex === null) {
    highlightStart = Math.min(...selectedIndices);
    highlightEnd = Math.max(...selectedIndices);
  } else if (anchorIndex !== null) {
    highlightStart = Math.min(anchorIndex, hoverIndex ?? anchorIndex);
    highlightEnd = Math.max(anchorIndex, hoverIndex ?? anchorIndex);
  }

  return (
    <div className="flex w-full select-none flex-row flex-wrap">
      {ALL_WEEKDAYS.map((day, index) => {
        const isHighlighted = index >= highlightStart && index <= highlightEnd;
        const isRangeStart = index === highlightStart;
        const isRangeEnd = index === highlightEnd;

        return (
          <div
            key={day}
            onClick={() => handleDayClick(index)}
            onPointerEnter={() => setHoverIndex(index)}
            onPointerLeave={() => setHoverIndex(null)}
          >
            <button
              className={cn(
                "flex h-8 w-10 items-center justify-center px-6",
                "active:bg-accent/40 text-foreground/50 cursor-pointer",

                // Inactive State
                !isHighlighted && "hover:bg-accent/15 rounded-full",

                // Highlighted State
                isHighlighted &&
                  "bg-accent/15 text-accent-text hover:bg-accent/30",

                // Contiguous Rounding Logic
                isRangeStart && "rounded-l-full",
                isRangeEnd && "rounded-r-full",
              )}
            >
              {day}
            </button>
          </div>
        );
      })}
    </div>
  );
}
