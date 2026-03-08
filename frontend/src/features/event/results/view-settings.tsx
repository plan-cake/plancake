import Checkbox from "@/components/checkbox";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import { useResultsContext } from "@/features/event/results/context";

export default function ViewSettings({
  timezone,
  onTimezoneChange,
  inDrawer = false,
  open = false,
  setOpen,
}: {
  timezone: string;
  onTimezoneChange: (newTZ: string) => void;
  inDrawer?: boolean;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { showOnlyBestTimes, setShowOnlyBestTimes } = useResultsContext();

  return (
    <>
      <Checkbox
        label="Only show best times"
        checked={showOnlyBestTimes}
        onChange={setShowOnlyBestTimes}
      />
      <div className="mt-3">
        Displaying event in
        <span className="text-accent font-bold">
          <TimeZoneSelector
            id="timezone-select"
            value={timezone}
            onChange={onTimezoneChange}
            asNestedDrawer={inDrawer}
            open={open}
            onOpenChange={setOpen}
          />
        </span>
      </div>
    </>
  );
}
