"use client";

import { useState } from "react";

import { useEventContext } from "@/core/event/context";
import { Weekday } from "@/core/event/types";
import { StandardDrawer } from "@/features/drawer";
import Calendar from "@/features/event/editor/weekday-range/calendar";
import WeekdayRangeDisplay from "@/features/event/editor/weekday-range/weekday-range-display";

export default function WeekdayRangeDrawer({
  weekdays,
}: {
  weekdays: Set<Weekday>;
}) {
  const { setWeekdayRange } = useEventContext();
  const [open, setOpen] = useState(false);

  return (
    <StandardDrawer
      open={open}
      onOpenChange={setOpen}
      contentClassName="h-1/3"
      title="Select Days of the Week"
      description="Select days of the week below"
      trigger={
        <div onClick={() => setOpen(!open)}>
          <WeekdayRangeDisplay weekdays={weekdays} open={open} />
        </div>
      }
      headerContent={
        <div className="flex flex-col text-lg font-semibold">
          Select Possible Days
          <span className="text-accent text-sm font-normal">
            Choose days of the week below
          </span>
        </div>
      }
    >
      <div className="flex w-full justify-center">
        <Calendar selectedDays={weekdays} onChange={setWeekdayRange} />
      </div>
    </StandardDrawer>
  );
}
