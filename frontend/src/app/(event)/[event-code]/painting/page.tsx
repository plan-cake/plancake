import { Metadata } from "next";
import { notFound } from "next/navigation";

import ClientPage from "@/app/(event)/[event-code]/painting/page-client";
import { EventCodePageProps } from "@/features/event/code-page-props";
import { getCachedEventDetails } from "@/features/event/editor/fetch-data";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import handleErrorResponse from "@/lib/utils/api/handle-api-error";
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
    "Add your availability for this event and let others know when you're free!",
  );
}

export default async function Page({ params }: EventCodePageProps) {
  const { "event-code": eventCode } = await params;

  if (!eventCode) {
    notFound();
  }

  const [eventData, initialAvailabilityData] = await Promise.all([
    getCachedEventDetails(eventCode),
    serverGet(
      ROUTES.availability.getSelf,
      {
        event_code: eventCode,
      },
      { cache: "no-store" },
    ).catch((e) => {
      const error = e as ApiErrorResponse;
      if (error.status === 400) {
        // The user just didn't participate yet, ignore this error and return null
        return null;
      }
      handleErrorResponse(error.status, error.data);
    }),
  ]);
  const { eventName, eventRange, timeslots } = processEventData(eventData);

  return (
    <ClientPage
      eventCode={eventCode}
      eventName={eventName}
      eventRange={eventRange}
      timeslots={timeslots}
      initialData={initialAvailabilityData}
    />
  );
}
