import { useEffect, useState } from "react";

import { ShareIcon, SquarePenIcon } from "lucide-react";

import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import { FloatingDrawer, MorphingDrawer } from "@/features/drawer";
import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import { useResultsContext } from "@/features/event/results/context";
import ShareMenu from "@/features/event/results/share-menu";
import { ConfirmationDialog } from "@/features/system-feedback";

export default function ResultsDrawer({
  onSnapChange,
  eventTitle,
  eventCode,
}: {
  onSnapChange: (snap: number | string | null) => void;
  eventTitle: string;
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

  /* BUTTONS */
  const paintingButton = (
    <LinkButton
      buttonStyle="primary"
      icon={<SquarePenIcon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      href={`/${eventCode}/painting`}
    />
  );

  /* SHARE MENU */
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

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
          <FloatingDrawer
            title="Share Event"
            description="Share this event with others"
            open={shareMenuOpen}
            onOpenChange={setShareMenuOpen}
            trigger={
              <EmptyButton
                buttonStyle="semi-transparent"
                icon={<ShareIcon />}
              />
            }
            nested={true}
          >
            <ShareMenu eventTitle={eventTitle} eventCode={eventCode} />
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
          personToRemove === currentUser ? "Leave Event" : "Remove Participant"
        }
        description={
          personToRemove == currentUser
            ? "Are you sure you want to leave this event?"
            : "Are you sure you want to remove " + personToRemove + "?"
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
            "Are you sure you want to leave this event?"
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
