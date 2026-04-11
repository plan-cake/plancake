"use client";

import React, { memo } from "react";

import { cn } from "@/lib/utils/classname";

interface TimeSlotProps {
  slotIso: string;
  isHovered?: boolean;

  disableSelect?: boolean;
  dynamicStyle?: React.CSSProperties & {
    [key: `--${string}`]: string | number;
  };
  gridColumn: number;
  gridRow: number;

  icon?: React.ReactNode;

  cellClasses?: string;

  // Event handlers
  onPointerDown?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onTouchMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
}

function TimeSlot({
  slotIso,
  isHovered,
  disableSelect,
  dynamicStyle: style,
  gridColumn,
  gridRow,
  icon,
  cellClasses = "",
  ...eventHandlers
}: TimeSlotProps) {
  if (icon) {
    icon = React.cloneElement(
      icon as React.ReactElement<{ className: string }>,
      {
        className: cn(
          (icon as React.ReactElement<{ className: string }>).props.className,
          "h-4 w-4",
        ),
      },
    );
  }

  return (
    <div
      data-slot-iso={slotIso}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "bg-background relative",
        disableSelect ? "bg-panel cursor-not-allowed" : "cursor-cell",
        cellClasses,
        "select-none",
        isHovered &&
          "z-5 -inset-x-1 -inset-y-0.5 h-[calc(100%+0.25rem)] w-[calc(100%+0.5rem)] rounded-full border-none shadow-xl ring-2",
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
      {icon && (
        <div className="flex h-full items-center justify-center">{icon}</div>
      )}
    </div>
  );
}

export default memo(TimeSlot);
