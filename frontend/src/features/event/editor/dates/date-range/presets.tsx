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

  const dateNow = format(new Date(), "yyyy-MM-dd");

  const next4Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date(dateNow);
    for (let i = 1; i <= 4; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      days.push(format(nextDate, "yyyy-MM-dd"));
    }
    return days;
  }, [dateNow]);
  const isNext4Days = useMemo(() => {
    return checkDatesSelected(new Set(next4Days));
  }, [checkDatesSelected, next4Days]);

  const nextWeek = useMemo(() => {
    const weekDates: string[] = [];
    for (let i = 0; weekDates.length < 5; i++) {
      const today = new Date(dateNow);
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      if (weekDates.length === 0 && nextDate.getDay() !== 1) {
        continue;
      }
      weekDates.push(format(nextDate, "yyyy-MM-dd"));
    }
    return weekDates;
  }, [dateNow]);
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
        tooltip="Clear Selection"
      />
      <ActionButton
        buttonStyle={
          isNext4Days ? "bordered semi-transparent" : "semi-transparent"
        }
        label="Next 4 Days"
        onClick={() => setDates(new Set(next4Days))}
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
