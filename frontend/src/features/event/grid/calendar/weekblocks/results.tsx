import { CircleSmallIcon, ThumbsUpIcon } from "lucide-react";

import BaseWeekBlock from "@/features/event/grid/calendar/weekblocks/base";
import { ResultsWeekBlockProps } from "@/features/event/grid/calendar/weekblocks/props";
import { cn } from "@/lib/utils/classname";
import { dateToISOString } from "@/lib/utils/date-time-format";

export default function ResultsWeekBlock({
  weeks,
  availabilities,
  numParticipants,
  highestMatchCount,
  hoveredDay,
  onHoverDay,
}: ResultsWeekBlockProps) {
  return (
    <BaseWeekBlock
      weeks={weeks}
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
          "bg-[color-mix(in_srgb,var(--color-accent)_var(--opacity-percent),var(--color-background))]",
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
    />
  );
}
