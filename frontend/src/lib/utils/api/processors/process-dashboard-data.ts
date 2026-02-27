import { DashboardPageProps } from "@/app/dashboard/page-client";
import { DashboardEventProps } from "@/features/dashboard/components/event";
import { DashboardData } from "@/lib/utils/api/types";

function processSingleEvent(
  myEvent: boolean,
  eventData: DashboardData["created_events"][number] | DashboardData["participated_events"][number],
): DashboardEventProps {
  const data: DashboardEventProps = {
    myEvent: myEvent,
    code: eventData.event_code,
    title: eventData.title,
    type: eventData.event_type === "Date" ? "specific" : "weekday",
    startTime: eventData.start_time,
    endTime: eventData.end_time,
    startDate: eventData.start_date!,
    endDate: eventData.end_date!,
    participants: eventData.participants,
    timezone: eventData.time_zone,
  };

  return data;
}

export function processDashboardData(
  eventData: DashboardData,
): DashboardPageProps {
  const processedEvents = {
    created_events: [] as DashboardEventProps[],
    participated_events: [] as DashboardEventProps[],
  };

  for (const event of eventData.created_events) {
    processedEvents.created_events.push(processSingleEvent(true, event));
  }

  for (const event of eventData.participated_events) {
    processedEvents.participated_events.push(processSingleEvent(false, event));
  }

  return processedEvents;
}
