import { SparklesIcon } from "lucide-react";

import TimeSlot from "@/features/event/grid/time-slot";
import BaseTimeBlock from "@/features/event/grid/timeblocks/base";
import { ResultsTimeBlockProps } from "@/features/event/grid/timeblocks/props";

export default function ResultsTimeBlock({
  numQuarterHours,
  timeslots,
  numVisibleDays,
  availabilities,
  numParticipants,
  hoveredSlot,
  onHoverSlot,
  hasNext = false,
  hasPrev = false,
}: ResultsTimeBlockProps) {
  return (
    <BaseTimeBlock
      numQuarterHours={numQuarterHours}
      visibleDaysCount={numVisibleDays}
      hasNext={hasNext}
      hasPrev={hasPrev}
      onMouseLeave={() => onHoverSlot?.(null)}
    >
      {timeslots.map(({ iso, coords, cellClasses: baseClasses }) => {
        const { row: gridRow, column: gridColumn } = coords;

        // borders
        const cellClasses = [...baseClasses, "cursor-default"];

        const matchCount =
          availabilities[iso]?.length > 0 ? availabilities[iso].length : 0;
        const opacity = matchCount / numParticipants || 0;
        const isHovered = hoveredSlot === iso;

        // background colors
        const opacityPercent = Math.round(opacity * 100);
        const dynamicStyle = {
          "--opacity-percent": `${opacityPercent}%`,
        };
        cellClasses.push(
          "bg-[color-mix(in_srgb,var(--color-accent)_var(--opacity-percent),var(--color-background))]",
        );

        // icon
        const iconColorClass =
          opacityPercent > 50 ? "text-white" : "text-foreground";
        const icon =
          matchCount === numParticipants && numParticipants > 1 ? (
            <SparklesIcon className={iconColorClass} />
          ) : undefined;

        return (
          <TimeSlot
            key={iso}
            slotIso={iso}
            cellClasses={cellClasses.join(" ")}
            isHovered={isHovered}
            gridColumn={gridColumn}
            gridRow={gridRow}
            icon={icon}
            onPointerEnter={() => {
              onHoverSlot?.(iso);
            }}
            dynamicStyle={dynamicStyle}
          />
        );
      })}
    </BaseTimeBlock>
  );
}
