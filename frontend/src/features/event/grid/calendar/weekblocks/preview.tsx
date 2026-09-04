import CalendarDay from "@/features/event/grid/calendar/calendar-day";
import BaseWeekBlock from "@/features/event/grid/calendar/weekblocks/base";
import { PreviewWeekBlockProps } from "@/features/event/grid/calendar/weekblocks/props";

export default function PreviewWeekBlock({ weeks }: PreviewWeekBlockProps) {
  return (
    <BaseWeekBlock numWeeks={weeks.length}>
      {weeks.map((week, wIndex) =>
        week.map((day, dIndex) => {
          return (
            <CalendarDay
              key={dIndex}
              dayString={day}
              disableSelect={true}
              gridColumn={dIndex + 1}
              gridRow={wIndex + 1}
              numRows={weeks.length}
            />
          );
        }),
      )}
    </BaseWeekBlock>
  );
}
