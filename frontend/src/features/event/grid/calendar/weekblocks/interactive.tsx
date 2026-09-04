import useCalendarDrag from "@/features/event/grid/calendar/lib/use-calendar-drag";
import BaseWeekBlock from "@/features/event/grid/calendar/weekblocks/base";
import { InteractiveWeekBlockProps } from "@/features/event/grid/calendar/weekblocks/props";
import { cn } from "@/lib/utils/classname";
import { dateToISOString } from "@/lib/utils/date-time-format";

export default function InteractiveWeekBlock({
  weeks,
  timeslots,
  availability,
  onToggle,
}: InteractiveWeekBlockProps) {
  const {
    draggedDays,
    hoveredDay,
    togglingOn,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handleTouchMove,
  } = useCalendarDrag(onToggle, timeslots);

  return (
    <BaseWeekBlock
      weeks={weeks}
      getDayProps={(day) => {
        const dayIso = dateToISOString(day);
        const isSelected = availability.has(dayIso);
        const isToggling = draggedDays.has(day) && togglingOn === !isSelected;

        const isHovered = hoveredDay === day && draggedDays.size === 0;

        let dayClasses = "";
        if (isSelected && (isHovered || isToggling)) {
          dayClasses = cn(
            dayClasses,
            "bg-[color-mix(in_srgb,var(--color-accent),var(--color-white)_30%)]",
          );
        } else if (isHovered || isToggling) {
          dayClasses = cn(
            dayClasses,
            "bg-[color-mix(in_srgb,var(--color-background),var(--color-accent)_40%)]",
          );
        } else if (isSelected) {
          dayClasses = cn(dayClasses, "bg-accent text-white");
        } else {
          dayClasses = cn(dayClasses, "bg-background");
        }

        return {
          dayClasses,
          onPointerDown: () => handlePointerDown(day, isSelected),
          onPointerEnter: () => handlePointerEnter(day),
          onPointerLeave: handlePointerLeave,
          onTouchMove: handleTouchMove,
        };
      }}
    />
  );
}
