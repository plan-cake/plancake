import { EventType } from "@/core/event/types";
import { AllAvailability } from "@/lib/utils/api/types";

export type ParticipantData = {
  id: number; // exists only for React key purposes, not from backend
  display_name: string;
}[];

export type ResultsInformation = {
  eventCode: string;
  eventType: EventType;
  timezone: string;
  isCreator: boolean;
  participants: ParticipantData;
  availability: AllAvailability["availability"];
  currentUser: AllAvailability["user_display_name"] | null;
};
