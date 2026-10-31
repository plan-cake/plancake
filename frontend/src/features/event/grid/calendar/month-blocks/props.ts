import {
  AvailabilitySet,
  ResultsAvailabilityMap,
} from "@/core/availability/types";
import useCalendarDrag from "@/features/event/grid/calendar/lib/use-calendar-drag";
import { CalendarGridMonth } from "@/features/event/grid/calendar/types";

type CommonBlockProps = {
  month: CalendarGridMonth;
  backgroundColor: string;
};

export type PreviewMonthBlockProps = CommonBlockProps;

export type InteractiveMonthBlockProps = CommonBlockProps & {
  availability: AvailabilitySet;
  drag: ReturnType<typeof useCalendarDrag>;
};

export type ResultsMonthBlockProps = CommonBlockProps & {
  hoveredDay: string | null | undefined;
  availabilities: ResultsAvailabilityMap;
  numParticipants: number;
  highestMatchCount: number;
  onHoverDay: (dayString: string | null) => void;
};
