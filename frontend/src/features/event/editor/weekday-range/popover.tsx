import { useState } from "react";

import * as Popover from "@radix-ui/react-popover";

import { useEventContext } from "@/core/event/context";
import { Weekday } from "@/core/event/types";
import Calendar from "@/features/event/editor/weekday-range/calendar";
import WeekdayRangeDisplay from "@/features/event/editor/weekday-range/weekday-range-display";
import { cn } from "@/lib/utils/classname";

export default function WeekdayRangePopover({
  weekdays,
}: {
  weekdays: Set<Weekday>;
}) {
  const { setWeekdayRange } = useEventContext();
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="hover:cursor-pointer">
        <WeekdayRangeDisplay weekdays={weekdays} open={open} />
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
          aria-label="Weekday range picker"
        >
          <Calendar selectedDays={weekdays} onChange={setWeekdayRange} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
