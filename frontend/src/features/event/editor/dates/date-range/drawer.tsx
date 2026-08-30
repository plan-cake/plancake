"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { TriangleAlertIcon } from "lucide-react";

import { useEventContext } from "@/core/event/context";
import { StandardDrawer } from "@/features/drawer";
import {
  Calendar,
  CalendarHandle,
} from "@/features/event/editor/dates/date-range/calendar";
import { SpecificDateRangeDisplayProps } from "@/features/event/editor/dates/date-range/date-range-props";
import DateRangePresets from "@/features/event/editor/dates/date-range/presets";
import SpecificDateRangeDisplay from "@/features/event/editor/dates/date-range/specific-date-display";
import { formatDateSet } from "@/lib/utils/date-time-format";

export default function DateRangeDrawer({
  earliestDate,
  dates,
}: SpecificDateRangeDisplayProps) {
  const { errors, setDates } = useEventContext();

  const [open, setOpen] = useState(false);
  const calendarRef = useRef<CalendarHandle>(null);

  // Scroll to the selected date when the drawer opens
  useEffect(() => {
    if (open) {
      // Small timeout to wait for the Dialog animation/rendering to settle
      const timer = setTimeout(() => {
        calendarRef.current?.scrollToSelected();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const dateDisplay = useMemo(() => formatDateSet(dates), [dates]);

  return (
    <StandardDrawer
      open={open}
      onOpenChange={setOpen}
      contentClassName="h-2/3"
      footerContent={<DateRangePresets dates={dates} setDates={setDates} />}
      title="Select Date Range"
      description="Select dates using the calendar below"
      trigger={
        <div onClick={() => setOpen(!open)}>
          <SpecificDateRangeDisplay dates={dates} open={open} />
        </div>
      }
      headerContent={
        <div className="flex flex-col text-lg font-semibold">
          Select Possible Dates
          {errors.dateRange ? (
            <span className="text-error flex items-center gap-2 text-sm">
              <TriangleAlertIcon className="h-4 w-4" />
              {errors.dateRange}
            </span>
          ) : (
            <span className="text-accent text-sm font-normal">
              {dateDisplay || "Choose dates using the calendar below"}
            </span>
          )}
        </div>
      }
    >
      <Calendar
        ref={calendarRef}
        earliestDate={earliestDate}
        className="w-fit"
        selectedDates={dates}
        setDates={setDates}
        dateRangeError={errors.dateRange}
      />
    </StandardDrawer>
  );
}
