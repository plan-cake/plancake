import DashboardEvent, {
  DashboardEventProps,
} from "@/features/dashboard/components/event";
import ShortcutTrigger from "@/features/system-feedback/hotkeys/components/shortcut-trigger";

type EventGridProps = {
  events: DashboardEventProps[];
  onDeleteEvent: (eventCode: string) => void;
};

export default function EventGrid({ events, onDeleteEvent }: EventGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((data: DashboardEventProps, index: number) => {
        const onDelete = data.myEvent
          ? () => {
              onDeleteEvent(data.code);
            }
          : undefined;

        const event = (
          <DashboardEvent key={data.code} onDelete={onDelete} {...data} />
        );

        if (index < 10) {
          let hotkey = (index + 1).toString();
          if (index === 9) {
            hotkey = "0";
          }
          return (
            <ShortcutTrigger
              key={data.code}
              hotkey={hotkey}
              tooltipSide="top"
              allowTooltipCollisions
            >
              {event}
            </ShortcutTrigger>
          );
        } else {
          return event;
        }
      })}
    </div>
  );
}
