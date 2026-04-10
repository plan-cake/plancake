import { EventType } from "@/core/event/types";
import { AllAvailability } from "@/lib/utils/api/types";

export type ResultsInformation = {
  eventCode: string;
  eventType: EventType;
  isCreator: boolean;
  participants: AllAvailability["participants"];
  availability: AllAvailability["availability"];
  currentUser: AllAvailability["user_display_name"] | null;
};
