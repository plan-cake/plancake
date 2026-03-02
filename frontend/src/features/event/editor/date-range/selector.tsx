import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { parseISO } from "date-fns";

import Switch from "@/components/switch";
import { useEventContext } from "@/core/event/context";
import { SpecificDateRange } from "@/core/event/types";
import WeekdayCalendar from "@/features/event/editor/date-range/calendars/weekday";
import { DateRangeProps } from "@/features/event/editor/date-range/date-range-props";
import DateRangeDrawer from "@/features/event/editor/date-range/drawer";
import EventTypeSelect from "@/features/event/editor/date-range/event-type-select";
import DateRangePopover from "@/features/event/editor/date-range/popover";
import FormSelectorField from "@/features/selector/components/selector-field";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function DateRangeSelection({
  editing = false,
}: DateRangeProps) {
  const { state, setWeekdayRange, setEventType, errors } = useEventContext();
  const { eventRange, originalEventRange } = state;

  const rangeType = eventRange?.type ?? "specific";

  return (
    <div className="contents">
      <div className="hidden flex-col md:flex">
        <label htmlFor="event-type-select">Type</label>
        <EventTypeSelect id="event-type-select" disabled={editing} />
      </div>
      <div className="flex w-full flex-col justify-center">
        <p
          className={`flex items-center gap-2 ${errors.dateRange ? "text-error" : ""}`}
        >
          Possible Dates
          {errors.dateRange && (
            <ExclamationTriangleIcon className="text-error h-4 w-4" />
          )}
        </p>

        <FormSelectorField
          label="Choose Days of the Week"
          htmlFor="event-type"
          classname="md:hidden mb-2"
        >
          <Switch
            id="event-type"
            checked={rangeType === "weekday"}
            onCheckedChange={(checked) =>
              setEventType(checked ? "weekday" : "specific")
            }
            disabled={editing}
          />
        </FormSelectorField>

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

  const earliestDate = editing
    ? parseISO(originalEventRange?.dateRange.from || eventRange.dateRange.from)
    : parseISO(eventRange.dateRange.from);
  const startDate = parseISO(eventRange.dateRange.from);
  const endDate = parseISO(eventRange.dateRange.to);

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
