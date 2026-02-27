import { Metadata } from "next";
import { notFound } from "next/navigation";

import ClientPage from "@/app/(event)/[event-code]/page-client";
import { EventCodePageProps } from "@/features/event/code-page-props";
import { getCachedEventDetails } from "@/features/event/editor/fetch-data";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import handleErrorResponse from "@/lib/utils/api/handle-api-error";
import { processAvailabilityData } from "@/lib/utils/api/processors/process-availability-data";
import { processEventData } from "@/lib/utils/api/processors/process-event-data";
import { serverGet } from "@/lib/utils/api/server-fetch";
import { constructMetadata } from "@/lib/utils/construct-metadata";

export async function generateMetadata({
  params,
}: EventCodePageProps): Promise<Metadata> {
  const { "event-code": eventCode } = await params;

  const initialEventData = await getCachedEventDetails(eventCode);

  if (!initialEventData) {
    return constructMetadata(
      "Event Not Found",
      "The event you are looking for could not be found.",
    );
  }

  const { eventName } = processEventData(initialEventData);

  return constructMetadata(
    eventName,
    "View event details and add your availability for this event.",
  );
}

export default async function Page({ params }: EventCodePageProps) {
  const { "event-code": eventCode } = await params;

  if (!eventCode) {
    notFound();
  }

  const [initialEventData, initialAvailabilityData] = await Promise.all([
    getCachedEventDetails(eventCode),
    serverGet(
      ROUTES.availability.getAll,
      {
        event_code: eventCode,
      },
      { cache: "no-store" },
    ).catch((e) => {
      const error = e as ApiErrorResponse;
      handleErrorResponse(error.status, error.data);
    }),
  ]);

  const { eventName, eventRange, timeslots, isCreator } =
    processEventData(initialEventData);

  const availabilityData = processAvailabilityData(
    initialAvailabilityData,
    eventRange.type,
    eventRange.timezone,
  );

  return (
    <ClientPage
      eventCode={eventCode}
      eventName={eventName}
      eventRange={eventRange}
      timeslots={timeslots}
      initialAvailabilityData={availabilityData}
      isCreator={isCreator}
    />
  );
}
