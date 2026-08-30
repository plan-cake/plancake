import { useState } from "react";

import { useEventContext } from "@/core/event/context";
import DatePopover from "@/features/event/editor/date-popover";
import { Calendar } from "@/features/event/editor/date-range/calendar";
import { SpecificDateRangeDisplayProps } from "@/features/event/editor/date-range/date-range-props";
import DateRangePresets from "@/features/event/editor/date-range/presets";
import SpecificDateRangeDisplay from "@/features/event/editor/date-range/specific-date-display";

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
      <Calendar
        earliestDate={earliestDate}
        className="w-fit"
        selectedDates={dates}
        setDates={setDates}
        dateRangeError={errors.dateRange}
      />
      <DateRangePresets dates={dates} setDates={setDates} />
    </DatePopover>
  );
}
