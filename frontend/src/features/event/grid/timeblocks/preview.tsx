import TimeSlot from "@/features/event/grid/time-slot";
import BaseTimeBlock from "@/features/event/grid/timeblocks/base";
import { PreviewTimeBlockProps } from "@/features/event/grid/timeblocks/props";

export default function PreviewTimeBlock({
  numQuarterHours,
  timeslots,
  numVisibleDays,
  maxColumns,
  hasNext = false,
  hasPrev = false,
}: PreviewTimeBlockProps) {
  return (
    <BaseTimeBlock
      numQuarterHours={numQuarterHours}
      visibleDaysCount={numVisibleDays}
      maxColumns={maxColumns}
      hasNext={hasNext}
      hasPrev={hasPrev}
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
