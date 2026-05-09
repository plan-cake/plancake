import { parseISO } from "date-fns";
import { TriangleAlertIcon } from "lucide-react";

import { useEventContext } from "@/core/event/context";
import { SpecificDateRange } from "@/core/event/types";
import WeekdayCalendar from "@/features/event/editor/date-range/calendars/weekday";
import { DateRangeProps } from "@/features/event/editor/date-range/date-range-props";
import DateRangeDrawer from "@/features/event/editor/date-range/drawer";
import EventTypeSelect from "@/features/event/editor/date-range/event-type-select";
import DateRangePopover from "@/features/event/editor/date-range/popover";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function DateRangeSelection({
  editing = false,
}: DateRangeProps) {
  const { state, setWeekdayRange, errors } = useEventContext();
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
      <div className="flex w-full flex-col justify-center gap-1">
        <p
          className={`flex items-center gap-2 font-bold ${errors.dateRange || errors.weekdayRange ? "text-error" : ""}`}
        >
          {rangeType === "specific" ? "Possible Dates" : "Possible Days"}
          {(errors.dateRange || errors.weekdayRange) && (
            <TriangleAlertIcon className="text-error h-4 w-4" />
          )}
        </p>

        {eventRange?.type === "specific" ? (
          <SpecificDateRangeDisplay
            eventRange={eventRange}
            editing={editing}
            originalEventRange={originalEventRange as SpecificDateRange}
          />
        ) : (
          <WeekdayCalendar
            selectedDays={eventRange?.weekdays}
            onChange={setWeekdayRange}
          />
        )}
      </div>
    </div>
  );
}

function SpecificDateRangeDisplay({
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
    editing && originalEventRange?.dateRange.from
      ? parseISO(originalEventRange.dateRange.from)
      : new Date();
  const startDate = eventRange.dateRange.from
    ? parseISO(eventRange.dateRange.from)
    : null;
  const endDate = eventRange.dateRange.to
    ? parseISO(eventRange.dateRange.to)
    : null;

  if (isMobile) {
    return (
      <DateRangeDrawer
        earliestDate={earliestDate}
        startDate={startDate}
        endDate={endDate}
      />
    );
  } else {
    return (
      <DateRangePopover
        earliestDate={earliestDate}
        startDate={startDate}
        endDate={endDate}
      />
    );
  }
}
