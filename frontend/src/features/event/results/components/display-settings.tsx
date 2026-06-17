import { motion } from "framer-motion";

import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import AvailabilityFilters from "@/features/event/results/components/availability-filters";

export default function DisplaySettings({
  timezone,
  onTimezoneChange,
  drawerNesting = 0,
}: {
  timezone: string;
  onTimezoneChange: (newTZ: string) => void;
  drawerNesting?: number;
}) {
  return (
    <>
      <motion.div layout className="bg-panel shrink-0 rounded-3xl p-6 text-sm">
        Displaying event in
        <TimeZoneSelector
          id="timezone-select"
          value={timezone}
          onChange={onTimezoneChange}
          drawerNesting={drawerNesting}
        />
      </motion.div>
      <motion.div layout className="bg-panel shrink-0 rounded-3xl p-6 text-sm">
        <AvailabilityFilters />
      </motion.div>
    </>
  );
}
