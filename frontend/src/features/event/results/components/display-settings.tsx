// import Checkbox from "@/components/checkbox";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
// import { useResultsContext } from "@/features/event/results/context";

export default function DisplaySettings({
  timezone,
  onTimezoneChange,
  drawerNesting = 0,
  desktop,
}: {
  timezone: string;
  onTimezoneChange: (newTZ: string) => void;
  drawerNesting?: number;
  desktop: boolean;
}) {
  // const { showOnlyBestTimes, setShowOnlyBestTimes } = useResultsContext();

  return (
    <>
      {/* <Checkbox
        label="Only show best times"
        checked={showOnlyBestTimes}
        onChange={setShowOnlyBestTimes}
      /> */}
      {/* <div className="mt-3"> */}
      Displaying event in
      <TimeZoneSelector
        id="timezone-select"
        value={timezone}
        onChange={onTimezoneChange}
        drawerNesting={drawerNesting}
        useShortcut={desktop}
      />
      {/* </div> */}
    </>
  );
}
