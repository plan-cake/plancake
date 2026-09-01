import { ALL_WEEKDAYS, Weekday } from "@/core/event/types";
import useWeekdayRangeDrag from "@/features/event/editor/dates/weekday-range/use-drag";
import { cn } from "@/lib/utils/classname";

export default function Calendar({
  selectedDays,
  onChange,
}: {
  selectedDays: Set<Weekday>;
  onChange: (days: Set<Weekday>) => void;
}) {
  const handleDayClick = (index: number) => {
    const day = ALL_WEEKDAYS[index];
    const newDays = new Set(selectedDays);
    if (!newDays.delete(day)) {
      newDays.add(day);
    }
    onChange(newDays);
  };

  const selectedIndices = Object.fromEntries(
    ALL_WEEKDAYS.map((day, index) => [index, selectedDays.has(day)]),
  );

  const {
    hoveredDay,
    dragState,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handleTouchMove,
  } = useWeekdayRangeDrag({
    selectedDays,
    setDays: onChange,
  });

  return (
    <div className="flex select-none flex-row flex-wrap">
      {ALL_WEEKDAYS.map((day, index) => {
        const previousDay = ALL_WEEKDAYS[index - 1];
        const nextDay = ALL_WEEKDAYS[index + 1];
        const isSelected = selectedIndices[index];
        const isDragged = dragState.dragRange.has(day);
        const isHovered = hoveredDay === day;

        const groupStart =
          (isSelected || isDragged) &&
          !selectedIndices[index - 1] &&
          !dragState.dragRange.has(previousDay);
        const groupEnd =
          (isSelected || isDragged) &&
          !selectedIndices[index + 1] &&
          !dragState.dragRange.has(nextDay);

        const dragEnabling =
          dragState.isDragging &&
          dragState.isEnabling &&
          isDragged &&
          !isSelected;
        const dragDisabling =
          dragState.isDragging &&
          !dragState.isEnabling &&
          isDragged &&
          isSelected;

        return (
          <div
            key={day}
            data-day={day}
            className={cn(
              "flex h-8 w-10 items-center justify-center px-6",
              "text-foreground/50 cursor-pointer rounded-full",

              // Selected State
              isSelected &&
                "bg-accent/15 text-accent-text rounded-none font-bold",

              // Drag State
              dragEnabling && "bg-accent/30 rounded-none",
              dragDisabling && "bg-accent/40 rounded-none",

              // Hovered State
              isHovered &&
                (isSelected ? "hover:bg-accent/40" : "hover:bg-accent/15"),

              // Contiguous Rounding Logic
              groupStart && "rounded-l-full",
              groupEnd && "rounded-r-full",
            )}
            onPointerDown={() => handlePointerDown(day)}
            onPointerEnter={() => handlePointerEnter(day)}
            onPointerLeave={handlePointerLeave}
            onTouchMove={handleTouchMove}
          >
            <button
              onClick={() => {
                if (!dragState.isDragging) {
                  handleDayClick(index);
                }
              }}
              className="pointer-events-none"
            >
              {day}
            </button>
          </div>
        );
      })}
    </div>
  );
}
