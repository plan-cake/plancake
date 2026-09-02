import { useState } from "react";

import { TriangleAlertIcon } from "lucide-react";

import { useEventContext } from "@/core/event/context";
import DatePopover from "@/features/event/editor/dates/date-popover";
import { Calendar } from "@/features/event/editor/dates/date-range/calendar";
import { SpecificDateRangeDisplayProps } from "@/features/event/editor/dates/date-range/date-range-props";
import DateRangePresets from "@/features/event/editor/dates/date-range/presets";
import SpecificDateRangeDisplay from "@/features/event/editor/dates/date-range/specific-date-display";
import { MESSAGES } from "@/lib/messages";

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
        />
        <DateRangePresets dates={dates} setDates={setDates} />
        <div className="flex justify-center">
          {errors.dateRange ? (
            <div className="text-error flex items-center gap-1 font-bold">
              <TriangleAlertIcon className="h-4 w-4" strokeWidth={2} />
              {errors.dateRange}
            </div>
          ) : (
            <p className="text-center text-sm opacity-50">
              {MESSAGES.INFO_DRAG_DATES}
            </p>
          )}
        </div>
      </div>
    </DatePopover>
  );
}
