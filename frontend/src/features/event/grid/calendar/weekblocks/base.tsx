import CalendarDay, {
  CalendarDayProps,
} from "@/features/event/grid/calendar/calendar-day";
import { CalendarGridWeek } from "@/features/event/grid/calendar/types";

export default function BaseWeekBlock({
  weeks,
  getDayProps,
}: {
  weeks: CalendarGridWeek[];
  getDayProps?: (dayString: string) => Partial<CalendarDayProps>;
}) {
  return (
    <div
      className="border-foreground/75 grid border"
      style={{
        gridTemplateColumns: "repeat(7, 1fr)",
        gridTemplateRows: `repeat(${weeks.length}, minmax(80px, 1fr))`,
        backgroundImage: `repeating-linear-gradient(
          45deg,
          color-mix(in srgb, var(--color-foreground) 10%, transparent) 0px,
          color-mix(in srgb, var(--color-foreground) 10%, transparent) 8px,
          color-mix(in srgb, var(--color-background) 10%, transparent) 8px,
          color-mix(in srgb, var(--color-background) 10%, transparent) 9.5px
        )`,
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
          };

          if (!day.exists) {
            return <CalendarDay key={dIndex} exists={false} {...commonProps} />;
          }

          const dayProps = getDayProps?.(day.dayString) ?? {};

          return <CalendarDay key={dIndex} {...commonProps} {...dayProps} />;
        }),
      )}
    </div>
  );
}
