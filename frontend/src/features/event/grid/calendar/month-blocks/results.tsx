import { CircleSmallIcon, ThumbsUpIcon } from "lucide-react";

import BaseMonthBlock from "@/features/event/grid/calendar/month-blocks/base";
import { ResultsMonthBlockProps } from "@/features/event/grid/calendar/month-blocks/props";
import { cn } from "@/lib/utils/classname";
import { dateToISOString } from "@/lib/utils/date-time-format";

export default function ResultsMonthBlock({
  month,
  backgroundColor,
  availabilities,
  numParticipants,
  highestMatchCount,
  hoveredDay,
  onHoverDay,
}: ResultsMonthBlockProps) {
  return (
    <BaseMonthBlock
      month={month}
      backgroundColor={backgroundColor}
      getDayProps={(day) => {
        const dayIso = dateToISOString(day);
        const matchCount =
          availabilities[dayIso]?.length > 0
            ? availabilities[dayIso].length
            : 0;
        const opacity = matchCount / numParticipants || 0;
        const isHovered = hoveredDay === dayIso;

        // background colors
        const opacityPercent = Math.round(opacity * 100);
        const dynamicStyle = {
          "--opacity-percent": `${opacityPercent}%`,
        };
        const dayClasses = cn(
          "cursor-default",
          `bg-[color-mix(in_srgb,var(--color-accent)_var(--opacity-percent),var(--color-${backgroundColor}))]`,
          opacityPercent > 50 ? "text-white" : "text-foreground",
        );

        // icon
        const icon =
          highestMatchCount > 1 && matchCount === highestMatchCount ? (
            highestMatchCount === numParticipants ? (
              <ThumbsUpIcon />
            ) : (
              <CircleSmallIcon />
            )
          ) : undefined;

        return {
          dayClasses,
          isHovered,
          icon,
          onPointerEnter: () => onHoverDay(dayIso),
          dynamicStyle,
        };
      }}
      clearHoveredSlot={() => onHoverDay(null)}
    />
  );
}
