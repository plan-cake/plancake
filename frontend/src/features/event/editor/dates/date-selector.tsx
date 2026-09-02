import { parseISO } from "date-fns";
import { TriangleAlertIcon } from "lucide-react";

import { useEventContext } from "@/core/event/context";
import { SpecificDateRange, Weekday } from "@/core/event/types";
import { DateRangeProps } from "@/features/event/editor/dates/date-range/date-range-props";
import DateRangeDrawer from "@/features/event/editor/dates/date-range/drawer";
import DateRangePopover from "@/features/event/editor/dates/date-range/popover";
import WeekdayRangeDrawer from "@/features/event/editor/dates/weekday-range/drawer";
import WeekdayRangePopover from "@/features/event/editor/dates/weekday-range/popover";
import EventTypeSelect from "@/features/event/editor/event-type-select";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function DateRangeSelection({
  editing = false,
}: DateRangeProps) {
  const { state, errors } = useEventContext();
  const { eventRange, originalEventRange } = state;

  const rangeType = eventRange?.type ?? "specific";

  return (
    <div className="contents">
      <div className="flex w-fit flex-col gap-1">
        <label htmlFor="event-type-select" className="font-bold">
          Type
        </label>
        <EventTypeSelect id="event-type-select" disabled={editing} />
      </div>
      <div className="flex w-fit flex-col gap-1">
        <p
          className={`flex items-center gap-2 font-bold ${errors.dateRange || errors.weekdayRange ? "text-error" : ""}`}
        >
          {rangeType === "specific" ? "Possible Dates" : "Possible Days"}
          {(errors.dateRange || errors.weekdayRange) && (
            <TriangleAlertIcon className="text-error h-4 w-4" />
          )}
        </p>

        {eventRange?.type === "specific" ? (
          <DatePicker
            eventRange={eventRange}
            editing={editing}
            originalEventRange={originalEventRange as SpecificDateRange}
          />
        ) : (
          <WeekdayPicker weekdays={eventRange.weekdays} />
        )}
      </div>
    </div>
  );
}

function DatePicker({
  eventRange,
  editing = false,
  originalEventRange,
}: {
  eventRange: SpecificDateRange;
  editing?: boolean;
  originalEventRange?: SpecificDateRange;
}) {
  const isMobile = useCheckMobile();

  const earliestDate =
    editing && originalEventRange?.dates.size
      ? parseISO(
          Array.from(originalEventRange.dates).reduce((min, cur) =>
            cur < min ? cur : min,
          ),
        )
      : undefined;

  if (isMobile) {
    return (
      <DateRangeDrawer earliestDate={earliestDate} dates={eventRange.dates} />
    );
  } else {
    return (
      <DateRangePopover earliestDate={earliestDate} dates={eventRange.dates} />
    );
  }
}

function WeekdayPicker({ weekdays }: { weekdays: Set<Weekday> }) {
  const isMobile = useCheckMobile();

  if (isMobile) {
    return <WeekdayRangeDrawer weekdays={weekdays} />;
  } else {
    return <WeekdayRangePopover weekdays={weekdays} />;
  }
}
