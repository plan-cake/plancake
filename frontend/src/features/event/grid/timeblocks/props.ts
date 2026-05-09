import {
  AvailabilitySet,
  ResultsAvailabilityMap,
} from "@/core/availability/types";

export type TimeBlockProps = {
  numQuarterHours: number;
  visibleDaysCount: number;
  children: React.ReactNode;
  hasPrev?: boolean;
  hasNext?: boolean;
  onMouseLeave?: () => void;
};

type TimeSlot = {
  iso: string;
  coords: { row: number; column: number };
  cellClasses: string[];
};

type CommonBlockProps = {
  numQuarterHours: number;
  numVisibleDays: number;
  timeslots: TimeSlot[];
  hasPrev?: boolean;
  hasNext?: boolean;
};

export type PreviewTimeBlockProps = CommonBlockProps;

export type InteractiveTimeBlockProps = CommonBlockProps & {
  availability: AvailabilitySet;
  onToggle: (slotIso: string, togglingOn: boolean) => void;
};

export type ResultsTimeBlockProps = CommonBlockProps & {
  hoveredSlot: string | null | undefined;
  availabilities: ResultsAvailabilityMap;
  numParticipants: number;
  highestMatchCount: number;
  onHoverSlot?: (iso: string | null) => void;
};
