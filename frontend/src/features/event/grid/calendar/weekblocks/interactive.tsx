import CalendarDay from "@/features/event/grid/calendar/calendar-day";
import BaseWeekBlock from "@/features/event/grid/calendar/weekblocks/base";
import { InteractiveWeekBlockProps } from "@/features/event/grid/calendar/weekblocks/props";
import { cn } from "@/lib/utils/classname";

export default function InteractiveWeekBlock({
  weeks,
  availability,
  onToggle,
}: InteractiveWeekBlockProps) {
  return (
    <BaseWeekBlock numWeeks={weeks.length}>
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

          const dayIso = new Date(day + "T00:00Z").toISOString();
          const isSelected = availability.has(dayIso);

          let dayClasses = "";
          if (isSelected) {
            dayClasses = cn(dayClasses, "bg-accent text-white");
          }

          return (
            <CalendarDay
              key={dayIso}
              {...commonProps}
              dayClasses={dayClasses}
              onPointerDown={() => onToggle(dayIso, !isSelected)}
            />
          );
        }),
      )}
    </BaseWeekBlock>
  );
}
