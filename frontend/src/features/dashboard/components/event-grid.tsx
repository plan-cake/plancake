import DashboardEvent, {
  DashboardEventProps,
} from "@/features/dashboard/components/event";

type EventGridProps = {
  events: DashboardEventProps[];
  onDeleteEvent: (eventCode: string) => void;
};

export default function EventGrid({ events, onDeleteEvent }: EventGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {events.map((data: DashboardEventProps) => {
        const onDelete = data.myEvent
          ? () => {
              onDeleteEvent(data.code);
            }
          : undefined;

        return <DashboardEvent key={data.code} onDelete={onDelete} {...data} />;
      })}
    </div>
  );
}
