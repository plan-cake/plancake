import { CircleSmallIcon, ThumbsUpIcon } from "lucide-react";

import CalendarDay from "@/features/event/grid/calendar/calendar-day";
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
      numWeeks={weeks.length}
      onMouseLeave={() => onHoverDay?.(null)}
    >
      {weeks.map((week, wIndex) =>
        week.map((day, dIndex) => {
          const commonProps = {
            dayString: day,
            gridColumn: dIndex + 1,
            gridRow: wIndex + 1,
            numRows: weeks.length,
          };

          if (!day) {
            return <CalendarDay key={dIndex} {...commonProps} />;
          }

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

          return (
            <CalendarDay
              key={dIndex}
              {...commonProps}
              dayClasses={dayClasses}
              isHovered={isHovered}
              icon={icon}
              onPointerEnter={() => {
                onHoverDay?.(dayIso);
              }}
              dynamicStyle={dynamicStyle}
            />
          );
        }),
      )}
    </BaseWeekBlock>
  );
}
