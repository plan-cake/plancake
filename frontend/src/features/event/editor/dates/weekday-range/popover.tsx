import { useState } from "react";

import { useEventContext } from "@/core/event/context";
import { Weekday } from "@/core/event/types";
import DatePopover from "@/features/event/editor/dates/date-popover";
import Calendar from "@/features/event/editor/dates/weekday-range/calendar";
import WeekdayRangePresets from "@/features/event/editor/dates/weekday-range/presets";
import WeekdayRangeDisplay from "@/features/event/editor/dates/weekday-range/weekday-range-display";
import { MESSAGES } from "@/lib/messages";

export default function WeekdayRangePopover({
  weekdays,
}: {
  weekdays: Set<Weekday>;
}) {
  const { setWeekdayRange } = useEventContext();
  const [open, setOpen] = useState(false);

  return (
    <DatePopover
      trigger={<WeekdayRangeDisplay weekdays={weekdays} open={open} />}
      open={open}
      setOpen={setOpen}
      ariaLabel="Weekday range picker"
    >
      <div className="flex flex-col gap-2">
        <Calendar selectedDays={weekdays} onChange={setWeekdayRange} />
        <WeekdayRangePresets
          weekdays={weekdays}
          setWeekdayRange={setWeekdayRange}
        />
        <p className="text-center text-sm opacity-50">
          {MESSAGES.INFO_DRAG_DATES}
        </p>
      </div>
    </DatePopover>
  );
}
