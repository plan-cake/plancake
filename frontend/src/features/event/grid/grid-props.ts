import {
  AvailabilitySet,
  ResultsAvailabilityMap,
} from "@/core/availability/types";
import { EventRange } from "@/core/event/types";

export interface GridProps {
  mode: "paint" | "view" | "preview";
  timeslots: Date[];
  timezone: string;
  eventType: EventRange["type"];

  unselectedRange?: boolean;

  // for "view" mode
  availabilities?: ResultsAvailabilityMap;
  numParticipants?: number;
  hoveredSlot?: string | null;
  setHoveredSlot?: (slotIso: string | null) => void;

  // for "paint" mode
  userAvailability?: AvailabilitySet;
  onToggleSlot?: (slotIso: string, togglingOn: boolean) => void;

  // for pagination
  onPageUpdate?: (index: number, pages: number) => void;
}
