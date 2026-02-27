"use client";

import { EventInformation } from "@/core/event/types";
import { ResultsProvider } from "@/features/event/results/context";
import DesktopResults from "@/features/event/results/desktop";
import MobileResults from "@/features/event/results/mobile";
import { ResultsInformation } from "@/features/event/results/types";

export default function ClientPage({
  eventData,
  initialAvailabilityData,
}: {
  eventData: EventInformation;
  initialAvailabilityData: ResultsInformation;
}) {
  return (
    <ResultsProvider initialData={initialAvailabilityData}>
      <div className="block md:hidden">
        <MobileResults eventData={eventData} />
      </div>

      <div className="hidden md:block">
        <DesktopResults eventData={eventData} />
      </div>
    </ResultsProvider>
  );
}
