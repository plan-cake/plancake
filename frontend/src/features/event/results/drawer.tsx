import { useEffect, useState } from "react";

import { GlobeIcon, SquarePenIcon } from "lucide-react";

import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import { MorphingDrawer } from "@/features/drawer";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import { useResultsContext } from "@/features/event/results/context";
import { ConfirmationDialog } from "@/features/system-feedback";
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
    participants,
    currentUser,
    clearSelectedParticipants,
    handleRemoveParticipant: onRemoveParticipant,
  } = useResultsContext();

  const promptRemove = (person: string) => {
    setPersonToRemove(person);
    setIsConfirmationOpen(true);
  };

  /* REMOVING STATES */
  const [isRemoving, setIsRemoving] = useState(false);
  const [personToRemove, setPersonToRemove] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

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
  }, [isCollapsed, isRemoving, clearSelectedParticipants]);

  const toggleRemoving = () => {
    setIsRemoving(!isRemoving);
    clearSelectedParticipants();
  };

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

      <ConfirmationDialog
        asNestedDrawer
        type="delete"
        autoClose={true}
        title={
          personToRemove === currentUser
            ? "Remove Yourself"
            : "Remove Participant"
        }
        description={
          personToRemove === currentUser
            ? "Are you sure you want to remove yourself from this event?"
            : `Are you sure you want to remove ${personToRemove} from this event?`
        }
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={async () => {
          if (!personToRemove) return false;
          const success = await onRemoveParticipant(personToRemove);
          if (success) {
            if (participants.length === 1) setIsRemoving(false);
          }
          return success;
        }}
      >
        <div className="text-center">
          {personToRemove === currentUser ? (
            "Are you sure you want to remove yourself from this event?"
          ) : (
            <span>
              Are you sure you want to remove{" "}
              <span className="font-bold">{personToRemove}</span>?
            </span>
          )}
        </div>
      </ConfirmationDialog>
    </MorphingDrawer>
  );
}
