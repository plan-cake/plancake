import { AvailabilityDataResponse } from "@/features/event/availability/fetch-data";

export type ResultsInformation = {
  eventCode: string;
  isCreator: boolean;
  participants: AvailabilityDataResponse["participants"];
  availability: AvailabilityDataResponse["availability"];
  userName: AvailabilityDataResponse["user_display_name"] | null;
};
