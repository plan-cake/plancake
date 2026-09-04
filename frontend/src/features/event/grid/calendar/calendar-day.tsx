"use client";

import { cloneElement, memo } from "react";

import { parse } from "date-fns";

import { cn } from "@/lib/utils/classname";

interface CalendarDayProps {
  dayString: string | null;
  isHovered?: boolean;

  disableSelect?: boolean;
  dynamicStyle?: React.CSSProperties & {
    [key: `--${string}`]: string | number;
  };
  gridColumn: number;
  gridRow: number;
  numRows: number;

  icon?: React.ReactElement;

  dayClasses?: string;

  // Event handlers
  onPointerDown?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onTouchMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
}

function CalendarDay({
  dayString,
  isHovered,
  disableSelect,
  dynamicStyle: style,
  gridColumn,
  gridRow,
  numRows,
  icon,
  dayClasses = "",
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
        "border-dashed border-foreground/75",
        gridColumn < 7 && "border-r",
        gridRow < numRows && "border-b",
      );

  if (!dayString) {
    return <div className={borderClasses}></div>;
  }

  const dayObj = parse(dayString, "yyyy-MM-dd", new Date());
  const dayNum = dayObj.getDate();

  return (
    <div
      data-day-string={dayString}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "bg-background relative flex-1",
        borderClasses,
        disableSelect ? "md:bg-panel cursor-not-allowed" : "cursor-pointer",
        dayClasses,
        "select-none",
        isHovered &&
          cn(
            "-inset-x-0.5 -inset-y-0.5 h-[calc(100%+0.25rem)] w-[calc(100%+0.25rem)]",
            "z-5 rounded-lg border-none shadow-xl ring-2",
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
      <div className="flex h-full w-full flex-col justify-between p-2">
        <span className="text-left leading-none">{dayNum}</span>
        {!!icon && <div className="flex w-full justify-end">{icon}</div>}
      </div>
    </div>
  );
}

export default memo(CalendarDay);
