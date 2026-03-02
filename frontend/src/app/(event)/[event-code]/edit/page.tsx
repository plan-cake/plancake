import { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventCodePageProps } from "@/features/event/code-page-props";
import EventEditor from "@/features/event/editor/editor";
import { getCachedEventDetails } from "@/features/event/editor/fetch-data";
import { processEventData } from "@/lib/utils/api/process-event-data";
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
    `Editing ${eventName}`,
    "Edit dates, times, and details of your Plancake event.",
  );
}

export default async function Page({ params }: EventCodePageProps) {
  const { "event-code": eventCode } = await params;

  if (!eventCode) {
    notFound();
  }

  const eventData = await getCachedEventDetails(eventCode);
  const { eventName, eventRange, timeslots } = processEventData(eventData);

  return (
    <EventEditor
      type="edit"
      initialData={{
        title: eventName,
        customCode: eventCode,
        eventRange,
        originalEventRange: eventRange,
        timeslots,
      }}
    />
  );
}
