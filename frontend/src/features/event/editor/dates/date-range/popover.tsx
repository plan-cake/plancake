import { useState } from "react";

import { useEventContext } from "@/core/event/context";
import DatePopover from "@/features/event/editor/dates/date-popover";
import { Calendar } from "@/features/event/editor/dates/date-range/calendar";
import { SpecificDateRangeDisplayProps } from "@/features/event/editor/dates/date-range/date-range-props";
import DateRangePresets from "@/features/event/editor/dates/date-range/presets";
import SpecificDateRangeDisplay from "@/features/event/editor/dates/date-range/specific-date-display";

export default function DateRangePopover({
  earliestDate,
  dates,
}: SpecificDateRangeDisplayProps) {
  const { errors, setDates } = useEventContext();
  const [open, setOpen] = useState(false);

  return (
    <DatePopover
      open={open}
      setOpen={setOpen}
      trigger={<SpecificDateRangeDisplay dates={dates} open={open} />}
      ariaLabel="Date range picker"
    >
      <div className="flex flex-col gap-2">
        <Calendar
          earliestDate={earliestDate}
          className="w-fit"
          selectedDates={dates}
          setDates={setDates}
          dateRangeError={errors.dateRange}
        />
        <DateRangePresets dates={dates} setDates={setDates} />
      </div>
    </DatePopover>
  );
}
