import useDateTimeDrag from "@/features/event/grid/date-time/lib/use-date-time-drag";
import TimeSlot from "@/features/event/grid/date-time/time-slot";
import BaseTimeBlock from "@/features/event/grid/date-time/timeblocks/base";
import { InteractiveTimeBlockProps } from "@/features/event/grid/date-time/timeblocks/props";

export default function InteractiveTimeBlock({
  numQuarterHours,
  timeslots,
  numVisibleDays,
  availability,
  onToggle,
}: InteractiveTimeBlockProps) {
  const dragHandlers = useDateTimeDrag(onToggle, "paint", timeslots);

  return (
    <BaseTimeBlock
      numQuarterHours={numQuarterHours}
      visibleDaysCount={numVisibleDays}
    >
      {timeslots.map(({ iso, coords, cellClasses: baseClasses }) => {
        const { row: gridRow, column: gridColumn } = coords;

        const isSelected = availability.has(iso);
        const isToggling =
          dragHandlers.draggedSlots.has(iso) &&
          dragHandlers.togglingOn === !isSelected;

        // don't highlight if we're toggling, in case the user is hovering a slot that
        // won't be toggled
        const isHovered =
          dragHandlers.hoveredSlot === iso &&
          dragHandlers.draggedSlots.size === 0;

        const cellClasses = [...baseClasses];
        if (isSelected && (isHovered || isToggling)) {
          cellClasses.push(
            "bg-[color-mix(in_srgb,var(--color-accent),var(--color-white)_30%)]",
          );
        } else if (isHovered || isToggling) {
          cellClasses.push(
            "bg-[color-mix(in_srgb,var(--color-background),var(--color-accent)_40%)]",
          );
        } else if (isSelected) {
          cellClasses.push("bg-accent");
        } else {
          cellClasses.push("bg-background");
        }

        return (
          <TimeSlot
            key={iso}
            slotIso={iso}
            cellClasses={cellClasses.join(" ")}
            gridColumn={gridColumn}
            gridRow={gridRow}
            onPointerDown={() =>
              dragHandlers.onPointerDown(iso, false, isSelected)
            }
            onPointerEnter={() => {
              dragHandlers.onPointerEnter(iso, false);
            }}
            onPointerLeave={() => {
              dragHandlers.onPointerLeave();
            }}
            onTouchMove={dragHandlers.onTouchMove}
          />
        );
      })}
    </BaseTimeBlock>
  );
}
