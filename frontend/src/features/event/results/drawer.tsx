import { useEffect, useState } from "react";

import { GlobeIcon, SquarePenIcon } from "lucide-react";

import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import { MorphingDrawer } from "@/features/drawer";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import {
  useParticipantRemoval,
  RemoveParticipantDialog,
} from "@/features/event/results/remove-participant";
import { tzEqual } from "@/lib/utils/date-time-format";

export default function ResultsDrawer({
  timezone,
  onTimezoneChange,
  onSnapChange,
  eventCode,
}: {
  timezone: string;
  onTimezoneChange: (newTZ: string) => void;
  onSnapChange: (snap: number | string | null) => void;
  eventCode: string;
}) {
  const {
    isRemoving,
    setIsRemoving,
    personToRemove,
    isConfirmationOpen,
    setIsConfirmationOpen,
    promptRemove,
    toggleRemoving,
    confirmRemove,
    currentUser,
    clearSelectedParticipants,
  } = useParticipantRemoval();

  /* TABS */
  const [activeSnap, setActiveSnap] = useState<number | string | null>(0.22);

  useEffect(() => {
    onSnapChange(activeSnap);
  }, [activeSnap, onSnapChange]);

  const isCollapsed = activeSnap === 0.22;

  useEffect(() => {
    if (isCollapsed && isRemoving) {
      setIsRemoving(false);
      clearSelectedParticipants();
    }
  }, [isCollapsed, isRemoving, clearSelectedParticipants, setIsRemoving]);

  /* TIMEZONE HANDLING */
  const tzChanged = !tzEqual(
    timezone,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  /* BUTTONS */
  const paintingButton = (
    <LinkButton
      buttonStyle="primary"
      icon={<SquarePenIcon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      href={`/${eventCode}/painting`}
    />
  );

  return (
    <MorphingDrawer
      open
      onOpenChange={() => {}}
      contentClassName="h-full md:hidden"
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={setActiveSnap}
      title="Attendees List"
      description="View attendees for this event"
      snapPoints={[0.22, 0.37]}
      modal={false}
      floatingAtLowestSnap
      scrollableBody
      headerContent={
        <PanelHeader
          isRemoving={isRemoving}
          toggleRemoving={toggleRemoving}
          promptRemove={promptRemove}
          isCollapsed={isCollapsed}
          inDrawer
        />
      }
      footerContent={
        <div className="mx-1 flex grow justify-between gap-2">
          <TimeZoneSelector
            id="timezone-select"
            value={timezone}
            onChange={onTimezoneChange}
            drawerNesting={1}
            trigger={
              <EmptyButton
                buttonStyle={
                  tzChanged ? "bordered semi-transparent" : "semi-transparent"
                }
                icon={<GlobeIcon />}
                aria-label="Change Timezone"
              />
            }
          />
          {paintingButton}
        </div>
      }
    >
      <ParticipantList
        isRemoving={isRemoving}
        promptRemove={promptRemove}
        mobile
      />

      <RemoveParticipantDialog
        asNestedDrawer
        personToRemove={personToRemove}
        currentUser={currentUser}
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={confirmRemove}
      />
    </MorphingDrawer>
  );
}
