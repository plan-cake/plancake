import {
  addDays,
  format,
  nextMonday,
  nextSunday,
  startOfToday,
} from "date-fns";
import { BroomIcon } from "lucide-react";

import { useEventContext } from "@/core/event/context";
import ActionButton from "@/features/button/components/action";

function consecutiveDays(start: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    format(addDays(start, i), "yyyy-MM-dd"),
  );
}

function isSelected(days: string[], dates: Set<string>): boolean {
  return days.length === dates.size && days.every((day) => dates.has(day));
}

export default function DateRangePresets({
  dates,
  applyPreset,
}: {
  dates: Set<string>;
  applyPreset: (days: string[]) => void;
}) {
  const { state } = useEventContext();
  const today = startOfToday();

  const presets =
    state.eventRange?.type === "calendar"
      ? [
          {
            label: "Next 2 Weeks",
            days: consecutiveDays(nextSunday(today), 14),
          },
          {
            label: "Next 4 Weeks",
            days: consecutiveDays(nextSunday(today), 28),
          },
        ]
      : [
          { label: "Next 4 Days", days: consecutiveDays(addDays(today, 1), 4) },
          { label: "Next Week", days: consecutiveDays(nextMonday(today), 5) },
        ];

  return (
    <div className="flex w-full gap-2">
      <ActionButton
        buttonStyle="semi-transparent"
        icon={<BroomIcon />}
        onClick={() => applyPreset([])}
        disabled={dates.size === 0}
        tooltip="Clear Selection"
      />
      {presets.map(({ label, days }) => (
        <ActionButton
          key={label}
          buttonStyle={
            isSelected(days, dates)
              ? "bordered semi-transparent"
              : "semi-transparent"
          }
          label={label}
          onClick={() => applyPreset(days)}
          fullWidth
          className="justify-center"
        />
      ))}
    </div>
  );
}
