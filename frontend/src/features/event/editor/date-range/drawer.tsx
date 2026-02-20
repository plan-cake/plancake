"use client";

import { useState, useRef, useEffect } from "react";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { BaseDrawer } from "@/components/layout/base-drawer";
import { useEventContext } from "@/core/event/context";
import {
  Calendar,
  CalendarHandle,
} from "@/features/event/editor/date-range/calendars/month";
import { SpecificDateRangeDisplayProps } from "@/features/event/editor/date-range/date-range-props";
import SpecificDateRangeDisplay from "@/features/event/editor/date-range/specific-date-display";

export default function DateRangeDrawer({
  earliestDate,
  startDate,
  endDate,
}: SpecificDateRangeDisplayProps) {
  const { errors, setDateRange } = useEventContext();

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

  return (
    <BaseDrawer
      open={open}
      onOpenChange={setOpen}
      contentClassName="h-2/3"
      description="Select a date range using the calendar below"
      trigger={
        <div onClick={() => setOpen(!open)}>
          <SpecificDateRangeDisplay
            startDate={startDate}
            endDate={endDate}
            open={open}
          />
        </div>
      }
      title={
        <div className="flex flex-col text-lg font-semibold">
          Select Specific Date Range
          {errors.dateRange ? (
            <span className="text-error flex items-center gap-2 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {errors.dateRange}
            </span>
          ) : (
            <span className="text-accent text-sm font-normal">
              Choose a start and end date
            </span>
          )}
        </div>
      }
    >
      <Calendar
        ref={calendarRef}
        earliestDate={earliestDate}
        className="w-fit"
        selectedRange={{
          from: startDate || undefined,
          to: endDate || undefined,
        }}
        setDateRange={setDateRange}
        dateRangeError={errors.dateRange}
      />
    </BaseDrawer>
  );
}
