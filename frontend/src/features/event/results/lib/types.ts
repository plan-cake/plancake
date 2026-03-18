import { AllAvailability } from "@/lib/utils/api/types";

export type ResultsInformation = {
  eventCode: string;
  isCreator: boolean;
  participants: AllAvailability["participants"];
  availability: AllAvailability["availability"];
  currentUser: AllAvailability["user_display_name"] | null;
};
