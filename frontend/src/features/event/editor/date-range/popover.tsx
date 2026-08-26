import { useState } from "react";

import * as Popover from "@radix-ui/react-popover";

import { useEventContext } from "@/core/event/context";
import { Calendar } from "@/features/event/editor/date-range/calendars/month";
import { SpecificDateRangeDisplayProps } from "@/features/event/editor/date-range/date-range-props";
import SpecificDateRangeDisplay from "@/features/event/editor/date-range/specific-date-display";
import { cn } from "@/lib/utils/classname";

export default function DateRangePopover({
  earliestDate,
  dates,
}: SpecificDateRangeDisplayProps) {
  const { errors, setDates } = useEventContext();
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="hover:cursor-pointer">
        <SpecificDateRangeDisplay dates={dates} open={open} />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={10}
          className={cn(
            "bg-background z-50 rounded-2xl border border-gray-400 p-4 shadow-lg",
            "data-[state=open]:animate-slideUpAndFade",
            "data-[state=closed]:animate-slideDownAndFadeOut",
          )}
          aria-label="Date range picker"
        >
          <Calendar
            earliestDate={earliestDate}
            className="w-fit"
            selectedDates={dates}
            setDates={setDates}
            dateRangeError={errors.dateRange}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
