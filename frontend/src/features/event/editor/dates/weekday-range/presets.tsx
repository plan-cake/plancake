import { useCallback, useMemo } from "react";

import { BroomIcon } from "lucide-react";

import { ALL_WEEKDAYS, Weekday } from "@/core/event/types";
import ActionButton from "@/features/button/components/action";

export default function WeekdayRangePresets({
  weekdays,
  setWeekdayRange,
}: {
  weekdays: Set<Weekday>;
  setWeekdayRange: (weekdays: Set<Weekday>) => void;
}) {
  const checkDaysSelected = useCallback(
    (days: Set<Weekday>) => {
      return (
        days.size === weekdays.size &&
        Array.from(days).every((day) => weekdays.has(day))
      );
    },
    [weekdays],
  );

  const isWeekdays = useMemo(() => {
    return checkDaysSelected(new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]));
  }, [checkDaysSelected]);
  const isAllWeek = useMemo(() => {
    return checkDaysSelected(new Set(ALL_WEEKDAYS));
  }, [checkDaysSelected]);

  return (
    <div className="flex w-full gap-2">
      <ActionButton
        buttonStyle="semi-transparent"
        icon={<BroomIcon />}
        onClick={() => setWeekdayRange(new Set())}
        disabled={weekdays.size === 0}
        tooltip="Clear Selection"
      />
      <ActionButton
        buttonStyle={
          isWeekdays ? "bordered semi-transparent" : "semi-transparent"
        }
        label="Weekdays"
        onClick={() =>
          setWeekdayRange(new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]))
        }
        fullWidth
        className="justify-center"
      />
      <ActionButton
        buttonStyle={
          isAllWeek ? "bordered semi-transparent" : "semi-transparent"
        }
        label="All Week"
        onClick={() => setWeekdayRange(new Set(ALL_WEEKDAYS))}
        fullWidth
        className="justify-center"
      />
    </div>
  );
}
