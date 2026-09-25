"use client";

import { cloneElement, memo } from "react";

import { parse } from "date-fns";

import { CalendarGridDayDisplay } from "@/features/event/grid/calendar/types";
import { cn } from "@/lib/utils/classname";

export interface CalendarDayProps {
  dayString: string;
  display: CalendarGridDayDisplay;
  isHovered?: boolean;

  disableSelect?: boolean;
  dynamicStyle?: React.CSSProperties & {
    [key: `--${string}`]: string | number;
  };
  gridColumn: number;
  gridRow: number;
  numRows: number;
  backgroundColor: string;
  rightBorder: boolean;

  icon?: React.ReactElement;

  dayClasses?: string;

  clearHoveredSlot?: () => void;

  // Event handlers
  onPointerDown?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onTouchMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
}

function CalendarDay({
  dayString,
  display,
  isHovered,
  disableSelect,
  dynamicStyle: style,
  gridColumn,
  gridRow,
  numRows,
  backgroundColor,
  rightBorder,
  icon,
  dayClasses = "",
  clearHoveredSlot,
  ...eventHandlers
}: CalendarDayProps) {
  if (icon) {
    icon = cloneElement(icon as React.ReactElement<{ className: string }>, {
      className: cn(
        (icon as React.ReactElement<{ className: string }>).props.className,
        "h-4 w-4",
      ),
    });
  }

  const borderClasses = isHovered
    ? "border-none"
    : cn(
        "border-foreground/75 border-b border-r",
        gridColumn === 1 && "border-l",
      );

  const dayObj = parse(dayString, "yyyy-MM-dd", new Date());
  const dayNum = dayObj.getDate();

  if (display === "disabled") {
    return (
      <div className={borderClasses} onPointerEnter={clearHoveredSlot}>
        <div className="p-2 leading-none opacity-50">{dayNum}</div>
      </div>
    );
  } else if (display === "empty") {
    return (
      <div
        className={cn(
          `bg-${backgroundColor}`,
          "border-foreground/75",
          gridRow < numRows && "border-b",
          rightBorder && "border-r",
        )}
        onPointerEnter={clearHoveredSlot}
      />
    );
  }

  return (
    <div
      data-day-string={dayString}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        `bg-${backgroundColor}`,
        "relative flex-1",
        borderClasses,
        !disableSelect && "cursor-cell",
        dayClasses,
        "select-none",
        isHovered &&
          cn(
            "-inset-x-0.5 -inset-y-0.5 h-[calc(100%+0.25rem)] w-[calc(100%+0.25rem)]",
            "z-5 ring-foreground rounded-lg border-none shadow-xl ring-2",
          ),
      )}
      style={{
        gridColumn,
        gridRow,
        touchAction: "manipulation",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        ...style,
      }}
      {...eventHandlers}
    >
      <div
        data-day-string={dayString}
        className="flex h-full w-full flex-col justify-between p-2"
      >
        <span className="text-left leading-none">{dayNum}</span>
        {!!icon && <div className="flex w-full justify-end">{icon}</div>}
      </div>
    </div>
  );
}

export default memo(CalendarDay);
