import { useState, useEffect } from "react";

import { GearIcon, Pencil2Icon } from "@radix-ui/react-icons";

import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import { FloatingDrawer, MorphingDrawer } from "@/features/drawer";
import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import { useResultsContext } from "@/features/event/results/context";
import ViewSettings from "@/features/event/results/view-settings";
import ConfirmationDialog from "@/features/system-feedback/confirmation/base";

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
    handleRemoveParticipant: onRemoveParticipant,
  } = useResultsContext();

  const promptRemove = (person: string) => {
    setPersonToRemove(person);
    setIsConfirmationOpen(true);
  };

  const [isTimezoneOpen, setTimezoneOpen] = useState(false);

  /* REMOVING STATES */
  const [isRemoving, setIsRemoving] = useState(false);
  const [personToRemove, setPersonToRemove] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  /* TABS */
  const [openSettings, setSettings] = useState(false);
  const [activeSnap, setActiveSnap] = useState<number | string | null>(0.22);

  useEffect(() => {
    onSnapChange(activeSnap);
  }, [activeSnap, onSnapChange]);

  const isCollapsed = activeSnap === 0.22;

  /* BUTTONS */
  const paintingButton = (
    <LinkButton
      buttonStyle="primary"
      icon={<Pencil2Icon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      href={`/${eventCode}/painting`}
    />
  );

  const settingsButton = (
    <EmptyButton buttonStyle="semi-transparent" icon={<GearIcon />} />
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
          toggleRemoving={() => setIsRemoving((prev) => !prev)}
          promptRemove={promptRemove}
          isCollapsed={isCollapsed}
          inDrawer
        />
      }
      footerContent={
        <div className="mx-1 flex grow justify-between gap-2">
          <FloatingDrawer
            nested
            open={openSettings}
            onOpenChange={setSettings}
            trigger={settingsButton}
            title="View Settings"
            description="View Settings"
            headerContent={
              <h1 className="flex-1 text-lg font-semibold">View Settings</h1>
            }
          >
            <ViewSettings
              timezone={timezone}
              onTimezoneChange={onTimezoneChange}
              open={isTimezoneOpen}
              setOpen={setTimezoneOpen}
              drawerNesting={2}
            />
          </FloatingDrawer>
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
          personToRemove == currentUser ? (
            "Are you sure you want to remove yourself from this event?"
          ) : (
            <span>
              Are you sure you want to remove{" "}
              <span className="font-bold">{personToRemove}</span>?
            </span>
          )
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
      />
    </MorphingDrawer>
  );
}
