import { ALL_WEEKDAYS, Weekday } from "@/core/event/types";
import { cn } from "@/lib/utils/classname";

type WeekdayCalendarProps = {
  selectedDays: Set<Weekday>;
  onChange: (days: Set<Weekday>) => void;
};

export default function WeekdayCalendar({
  selectedDays,
  onChange,
}: WeekdayCalendarProps) {
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

  return (
    <div className="flex w-full select-none flex-row flex-wrap">
      {ALL_WEEKDAYS.map((day, index) => {
        const isSelected = selectedIndices[index];
        const leftSelected = selectedIndices[index - 1];
        const rightSelected = selectedIndices[index + 1];

        return (
          <div key={day} onClick={() => handleDayClick(index)}>
            <button
              className={cn(
                "flex h-8 w-10 items-center justify-center px-6",
                "active:bg-accent/40 text-foreground/50 cursor-pointer",

                // Highlighted State
                isSelected
                  ? "bg-accent/15 text-accent-text hover:bg-accent/30"
                  : "hover:bg-accent/15 rounded-full",

                // Contiguous Rounding Logic
                !leftSelected && "rounded-l-full",
                !rightSelected && "rounded-r-full",
              )}
            >
              {day}
            </button>
          </div>
        );
      })}
    </div>
  );
}
