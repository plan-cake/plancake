import useCalendarDrag from "@/features/event/grid/calendar/lib/use-calendar-drag";
import BaseMonthBlock from "@/features/event/grid/calendar/month-blocks/base";
import { InteractiveMonthBlockProps } from "@/features/event/grid/calendar/month-blocks/props";
import { cn } from "@/lib/utils/classname";
import { dateToISOString } from "@/lib/utils/date-time-format";

export default function InteractiveMonthBlock({
  month,
  backgroundColor,
  timeslots,
  availability,
  onToggle,
}: InteractiveMonthBlockProps) {
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
    <BaseMonthBlock
      month={month}
      backgroundColor={backgroundColor}
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
            `bg-[color-mix(in_srgb,var(--color-${backgroundColor}),var(--color-accent)_40%)]`,
          );
        } else if (isSelected) {
          dayClasses = cn(dayClasses, "bg-accent text-white");
        } else {
          dayClasses = cn(dayClasses, `bg-${backgroundColor}`);
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
