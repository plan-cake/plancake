"use client";

import { useState, useRef, useEffect } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { ExclamationTriangleIcon, Cross1Icon } from "@radix-ui/react-icons";

import { useEventContext } from "@/core/event/context";
import ActionButton from "@/features/button/components/action";
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

  const handleClose = () => {
    setOpen(false);
    return true;
  };

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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="hover:cursor-pointer">
        <SpecificDateRangeDisplay
          startDate={startDate}
          endDate={endDate}
          open={open}
        />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-700/40" />
        <Dialog.Content
          className="animate-slideUp data-[state=closed]:animate-slideDown fixed bottom-0 left-0 right-0 z-50"
          aria-label="Date range picker"
        >
          <div className="rounded-t-4xl bg-background flex h-[500px] flex-col shadow-lg">
            <div
              onPointerDown={handleClose}
              className="flex items-center gap-4 p-8 pb-4"
            >
              <ActionButton
                buttonStyle="frosted glass"
                icon={<Cross1Icon />}
                label="Close Drawer"
                shrinkOnMobile
                onClick={handleClose}
              />

              <Dialog.Title className="flex flex-col text-lg font-semibold">
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
              </Dialog.Title>

              <Dialog.Description className="sr-only">
                Select a date range using the calendar below
              </Dialog.Description>
            </div>
            <div className="flex overflow-y-auto">
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
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
