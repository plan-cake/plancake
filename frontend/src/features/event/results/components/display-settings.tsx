// import Checkbox from "@/components/checkbox";
import { GlobeIcon } from "lucide-react";

import TimeZoneSelector from "@/features/event/components/selectors/timezone";
// import { useResultsContext } from "@/features/event/results/context";

export default function DisplaySettings({
  timezone,
  onTimezoneChange,
  drawerNesting = 0,
}: {
  timezone: string;
  onTimezoneChange: (newTZ: string) => void;
  drawerNesting?: number;
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
      <div className="flex items-center gap-1">
        <GlobeIcon className="h-3.5 w-3.5" />
        Displaying event in
      </div>
      <TimeZoneSelector
        id="timezone-select"
        value={timezone}
        onChange={onTimezoneChange}
        drawerNesting={drawerNesting}
      />
      {/* </div> */}
    </>
  );
}
