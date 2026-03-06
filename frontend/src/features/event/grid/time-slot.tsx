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
  cellClasses = "",
  ...eventHandlers
}: TimeSlotProps) {
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
          "z-5 scale-y-130 scale-x-110 rounded-full border-none shadow-xl ring-1 md:scale-x-105",
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
    />
  );
}

export default memo(TimeSlot);
