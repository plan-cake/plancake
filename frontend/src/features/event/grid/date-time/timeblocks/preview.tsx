import TimeSlot from "@/features/event/grid/date-time/time-slot";
import BaseTimeBlock from "@/features/event/grid/date-time/timeblocks/base";
import { PreviewTimeBlockProps } from "@/features/event/grid/date-time/timeblocks/props";

export default function PreviewTimeBlock({
  numQuarterHours,
  timeslots,
  numVisibleDays,
}: PreviewTimeBlockProps) {
  return (
    <BaseTimeBlock
      numQuarterHours={numQuarterHours}
      visibleDaysCount={numVisibleDays}
    >
      {timeslots.map(({ iso, coords, cellClasses }) => {
        const { row: gridRow, column: gridColumn } = coords;

        return (
          <TimeSlot
            key={iso}
            slotIso={iso}
            disableSelect={true}
            cellClasses={cellClasses.join(" ")}
            gridColumn={gridColumn}
            gridRow={gridRow}
          />
        );
      })}
    </BaseTimeBlock>
  );
}
