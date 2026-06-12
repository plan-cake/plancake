import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import AvailabilityFilters from "@/features/event/results/availability-filters";

export default function DisplaySettings({
  timezone,
  onTimezoneChange,
  open = false,
  setOpen,
  drawerNesting = 0,
}: {
  timezone: string;
  onTimezoneChange: (newTZ: string) => void;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  drawerNesting?: number;
}) {
  return (
    <>
      <div className="bg-panel shrink-0 rounded-3xl p-6 text-sm">
        <div className="flex flex-col gap-4">
          <div>
            <span className="mr-2 text-sm font-medium">
              Displaying event in
            </span>
            <span className="text-accent font-bold">
              <TimeZoneSelector
                id="timezone-select"
                value={timezone}
                onChange={onTimezoneChange}
                drawerNesting={drawerNesting}
                open={open}
                onOpenChange={setOpen}
              />
            </span>
          </div>
        </div>
      </div>
      <div className="bg-panel shrink-0 rounded-3xl p-6 text-sm">
        <AvailabilityFilters />
      </div>
    </>
  );
}
