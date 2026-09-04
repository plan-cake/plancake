import {
  AvailabilitySet,
  ResultsAvailabilityMap,
} from "@/core/availability/types";
import { CalendarGridWeek } from "@/features/event/grid/calendar/types";

type CommonBlockProps = {
  weeks: CalendarGridWeek[];
};

export type PreviewWeekBlockProps = CommonBlockProps;

export type InteractiveWeekBlockProps = CommonBlockProps & {
  timeslots: Date[];
  availability: AvailabilitySet;
  onToggle: (dayString: string, togglingOn: boolean) => void;
};

export type ResultsWeekBlockProps = CommonBlockProps & {
  hoveredDay: string | null | undefined;
  availabilities: ResultsAvailabilityMap;
  numParticipants: number;
  highestMatchCount: number;
  onHoverDay: (dayString: string | null) => void;
};
