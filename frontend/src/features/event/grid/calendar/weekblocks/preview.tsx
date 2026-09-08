import BaseWeekBlock from "@/features/event/grid/calendar/weekblocks/base";
import { PreviewWeekBlockProps } from "@/features/event/grid/calendar/weekblocks/props";

export default function PreviewWeekBlock({
  weeks,
  hasNext,
  hasPrev,
  backgroundColor,
}: PreviewWeekBlockProps) {
  return (
    <BaseWeekBlock
      weeks={weeks}
      hasNext={hasNext}
      hasPrev={hasPrev}
      backgroundColor={backgroundColor}
      getDayProps={() => ({ disableSelect: true })}
    />
  );
}
