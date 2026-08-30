import { useCallback, useMemo } from "react";

import { format } from "date-fns-tz";
import { BroomIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";

export default function DateRangePresets({
  dates,
  setDates,
}: {
  dates: Set<string>;
  setDates: (dates: Set<string>) => void;
}) {
  const checkDatesSelected = useCallback(
    (days: Set<string>) => {
      return (
        days.size === dates.size &&
        Array.from(days).every((day) => dates.has(day))
      );
    },
    [dates],
  );

  const next5Days = useMemo(() => {
    const days: string[] = [];
    const currentDate = new Date();
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + i);
      days.push(format(nextDate, "yyyy-MM-dd"));
    }
    return days;
  }, []);
  const isNext5Days = useMemo(() => {
    return checkDatesSelected(new Set(next5Days));
  }, [checkDatesSelected, next5Days]);

  const nextWeek = useMemo(() => {
    const weekDates: string[] = [];
    const currentDate = new Date();
    for (let i = 0; weekDates.length < 5; i++) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + i);
      if (weekDates.length === 0 && nextDate.getDay() !== 1) {
        continue;
      }
      weekDates.push(format(nextDate, "yyyy-MM-dd"));
    }
    return weekDates;
  }, []);
  const isNextWeek = useMemo(() => {
    return checkDatesSelected(new Set(nextWeek));
  }, [checkDatesSelected, nextWeek]);

  return (
    <div className="flex w-full gap-2">
      <ActionButton
        buttonStyle="semi-transparent"
        icon={<BroomIcon />}
        onClick={() => setDates(new Set())}
        disabled={dates.size === 0}
      />
      <ActionButton
        buttonStyle={
          isNext5Days ? "bordered semi-transparent" : "semi-transparent"
        }
        label="Next 5 Days"
        onClick={() => setDates(new Set(next5Days))}
        fullWidth
        className="justify-center"
      />
      <ActionButton
        buttonStyle={
          isNextWeek ? "bordered semi-transparent" : "semi-transparent"
        }
        label="Next Week"
        onClick={() => setDates(new Set(nextWeek))}
        fullWidth
        className="justify-center"
      />
    </div>
  );
}
