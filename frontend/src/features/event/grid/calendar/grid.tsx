import { createEmptyUserAvailability } from "@/core/availability/utils";
import useCalendarGridInfo from "@/features/event/grid/calendar/lib/use-grid";
import InteractiveWeekBlock from "@/features/event/grid/calendar/weekblocks/interactive";
import PreviewWeekBlock from "@/features/event/grid/calendar/weekblocks/preview";
import ResultsWeekBlock from "@/features/event/grid/calendar/weekblocks/results";
import { GRID_ID } from "@/features/event/grid/date-time/lib/constants";
import GridMessage from "@/features/event/grid/grid-message";
import { GridProps } from "@/features/event/grid/grid-props";
import { getHighestMatchCount } from "@/features/event/results/lib/utils";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

export default function CalendarGrid({
  timeslots,
  mode,
  unselectedRange = false,
  availabilities = {},
  numParticipants = 0,
  hoveredSlot,
  setHoveredSlot = () => {},
  userAvailability = createEmptyUserAvailability(),
  onToggleSlot = () => {},
}: GridProps) {
  const isMobile = useCheckMobile();

  const { weekBlocks, error } = useCalendarGridInfo(timeslots);

  if (unselectedRange) {
    return (
      <GridMessage
        error={false}
        message={MESSAGES.INFO_UNSELECTED_CALENDAR_RANGE}
      />
    );
  }

  if (error) {
    return <GridMessage error={true} message={error} />;
  }

  return (
    <div
      className={cn(
        "grid-rows[auto_1fr] relative grid h-full w-full grid-cols-[1fr]",
        mode === "preview" ? "bg-background md:bg-panel" : "bg-background",
      )}
      style={{ viewTransitionName: "grid" }}
      id={GRID_ID}
    >
      <div
        className={cn(
          "relative grow select-none overflow-x-hidden",
          !isMobile ? "overflow-y-auto" : "overflow-y-hidden",
          mode === "preview" ? "pb-1" : "pb-6",
        )}
      >
        <div className="relative flex flex-grow flex-col gap-2">
          {weekBlocks.map((weekBlock, index) => {
            if (mode === "preview") {
              return <PreviewWeekBlock key={index} weeks={weekBlock} />;
            } else if (mode === "paint") {
              return (
                <InteractiveWeekBlock
                  key={index}
                  weeks={weekBlock}
                  availability={userAvailability}
                  onToggle={onToggleSlot}
                />
              );
            } else if (mode === "view") {
              return (
                <ResultsWeekBlock
                  key={index}
                  weeks={weekBlock}
                  hoveredDay={hoveredSlot}
                  availabilities={availabilities}
                  numParticipants={numParticipants}
                  highestMatchCount={getHighestMatchCount(availabilities)}
                  onHoverDay={setHoveredSlot}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
