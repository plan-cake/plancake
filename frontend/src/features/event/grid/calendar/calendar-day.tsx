"use client";

import { cloneElement, memo } from "react";

import { parse } from "date-fns";

import { cn } from "@/lib/utils/classname";

export interface CalendarDayProps {
  dayString: string;
  exists?: boolean;
  firstOfMonth?: boolean;
  isHovered?: boolean;

  disableSelect?: boolean;
  dynamicStyle?: React.CSSProperties & {
    [key: `--${string}`]: string | number;
  };
  gridColumn: number;
  gridRow: number;
  numRows: number;
  backgroundColor: string;

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
  exists = true,
  firstOfMonth = false,
  isHovered,
  disableSelect,
  dynamicStyle: style,
  gridColumn,
  gridRow,
  numRows,
  backgroundColor,
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

  const dayObj = parse(dayString, "yyyy-MM-dd", new Date());
  const dayNum = dayObj.getDate();

  const shortMonthString = dayObj.toLocaleString("default", {
    month: "short",
  });
  const longMonthString = dayObj.toLocaleString("default", {
    month: "long",
  });
  const monthBadge = (
    <div
      className={cn(
        "absolute -top-2.5 left-[50%] translate-x-[-50%]",
        "rounded-full px-1.5 py-0.5 text-xs leading-none",
        `bg-${backgroundColor} border-foreground border`,
      )}
    >
      <span className="lg:hidden">{shortMonthString}</span>
      <span className="hidden lg:block">{longMonthString}</span>
    </div>
  );

  if (!exists) {
    return (
      <div className={cn(borderClasses, "relative")}>
        <div className="p-2 leading-none opacity-50">{dayNum}</div>
        {firstOfMonth && monthBadge}
      </div>
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
        disableSelect ? "cursor-not-allowed" : "cursor-pointer",
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
        className="relative flex h-full w-full flex-col justify-between p-2"
      >
        <span className="text-left leading-none">{dayNum}</span>
        {!!icon && <div className="flex w-full justify-end">{icon}</div>}
        {firstOfMonth && monthBadge}
      </div>
    </div>
  );
}

export default memo(CalendarDay);
