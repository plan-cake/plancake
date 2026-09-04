import {
  AvailabilitySet,
  ResultsAvailabilityMap,
} from "@/core/availability/types";

type CommonBlockProps = {
  weeks: (string | null)[][];
};

export type PreviewWeekBlockProps = CommonBlockProps;

export type InteractiveWeekBlockProps = CommonBlockProps & {
  availability: AvailabilitySet;
  onToggle: (dayString: string, togglingOn: boolean) => void;
};

export type ResultsWeekBlockProps = CommonBlockProps & {
  hoveredDay: string | null | undefined;
  availabilities: ResultsAvailabilityMap;
  numParticipants: number;
  highestMatchCount: number;
  onHoverDay?: (dayString: string | null) => void;
};
