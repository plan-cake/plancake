import CalendarDay, {
  CalendarDayProps,
} from "@/features/event/grid/calendar/calendar-day";
import { CalendarGridWeek } from "@/features/event/grid/calendar/types";
import { NONEXISTENT_SLOT_PATTERN } from "@/features/event/grid/constants";
import { cn } from "@/lib/utils/classname";

export default function BaseWeekBlock({
  weeks,
  hasNext,
  hasPrev,
  backgroundColor,
  getDayProps,
  clearHoveredSlot,
}: {
  weeks: CalendarGridWeek[];
  hasNext: boolean;
  hasPrev: boolean;
  backgroundColor: string;
  getDayProps?: (dayString: string) => Partial<CalendarDayProps>;
  clearHoveredSlot?: () => void;
}) {
  return (
    <div
      style={{
        backgroundImage: NONEXISTENT_SLOT_PATTERN,
      }}
      className="[--week-height:60px] md:[--week-height:80px]"
    >
      {hasPrev && (
        <BlockEnd
          side="top"
          backgroundColor={backgroundColor}
          clearHoveredSlot={clearHoveredSlot}
        />
      )}

      <div
        className="border-foreground/75 grid border"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: `repeat(${weeks.length}, minmax(var(--week-height), 1fr))`,
          borderTopStyle: hasPrev ? "dashed" : undefined,
          borderBottomStyle: hasNext ? "dashed" : undefined,
        }}
      >
        {weeks.map((week, wIndex) =>
          week.days.map((day, dIndex) => {
            const commonProps = {
              dayString: day.dayString,
              firstOfMonth: day.firstOfMonth,
              gridColumn: dIndex + 1,
              gridRow: wIndex + 1,
              numRows: weeks.length,
              backgroundColor,
            };

            if (!day.exists) {
              return (
                <CalendarDay
                  key={dIndex}
                  exists={false}
                  {...commonProps}
                  clearHoveredSlot={clearHoveredSlot}
                />
              );
            }

            const dayProps = getDayProps?.(day.dayString) ?? {};

            return <CalendarDay key={dIndex} {...commonProps} {...dayProps} />;
          }),
        )}
      </div>

      {hasNext && (
        <BlockEnd
          side="bottom"
          backgroundColor={backgroundColor}
          clearHoveredSlot={clearHoveredSlot}
        />
      )}
    </div>
  );
}

function BlockEnd({
  side,
  backgroundColor,
  clearHoveredSlot,
}: {
  side: "top" | "bottom";
  backgroundColor: string;
  clearHoveredSlot?: () => void;
}) {
  const maskImage =
    side === "top"
      ? "linear-gradient(to top, black, transparent)"
      : "linear-gradient(to bottom, black, transparent)";

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(to ${side}, transparent, var(--color-${backgroundColor}))`,
      }}
      onPointerEnter={clearHoveredSlot}
    >
      <div
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          maskImage: maskImage,
          WebkitMaskImage: maskImage,
        }}
        className={cn(
          "divide-foreground/75 grid divide-x divide-dashed",
          "border-foreground/75 border-x",
        )}
      >
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            style={{
              gridColumn: index + 1,
            }}
            className="h-7.5"
          />
        ))}
      </div>
    </div>
  );
}
