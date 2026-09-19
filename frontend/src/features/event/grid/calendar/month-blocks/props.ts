import {
  AvailabilitySet,
  ResultsAvailabilityMap,
} from "@/core/availability/types";
import { CalendarGridMonth } from "@/features/event/grid/calendar/types";

type CommonBlockProps = {
  month: CalendarGridMonth;
  backgroundColor: string;
};

export type PreviewMonthBlockProps = CommonBlockProps;

export type InteractiveMonthBlockProps = CommonBlockProps & {
  timeslots: Date[];
  availability: AvailabilitySet;
  onToggle: (dayString: string, togglingOn: boolean) => void;
};

export type ResultsMonthBlockProps = CommonBlockProps & {
  hoveredDay: string | null | undefined;
  availabilities: ResultsAvailabilityMap;
  numParticipants: number;
  highestMatchCount: number;
  onHoverDay: (dayString: string | null) => void;
};
