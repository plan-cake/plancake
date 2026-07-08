import { cn } from "@/lib/utils/classname";

export default function GuestDataSummary({
  events,
  availabilities,
}: {
  events: number;
  availabilities: number;
}) {
  return (
    <div>
      <div className="font-semibold">Guest data found on this browser:</div>
      <div className={cn("text-sm", events === 0 && "opacity-50")}>
        • {events} event
        {events !== 1 ? "s" : ""} that you created
      </div>
      <div className={cn("text-sm", availabilities === 0 && "opacity-50")}>
        • {availabilities} event
        {availabilities !== 1 ? "s" : ""} that you added your availability to
      </div>
    </div>
  );
}
