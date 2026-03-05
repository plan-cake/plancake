import DashboardEvent, {
  DashboardEventProps,
} from "@/features/dashboard/components/event";

export type EventGridProps = DashboardEventProps[];

export default function EventGrid({ events }: { events: EventGridProps }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((data: DashboardEventProps) => (
        <DashboardEvent key={data.code} {...data} />
      ))}
    </div>
  );
}
