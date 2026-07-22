import { useEffect, useState } from "react";

import { ShareIcon, SquarePenIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import { MorphingDrawer } from "@/features/drawer";
import PanelHeader from "@/features/event/results/attendees/panel-header";
import ParticipantList from "@/features/event/results/attendees/participant-list";
import {
  RemoveParticipantDialog,
  useParticipantRemoval,
} from "@/features/event/results/attendees/remove-participant";
import ShareMenu from "@/features/share-menu/menu";
import { useViewTransition } from "@/lib/hooks/use-view-transition";

export default function AttendeesDrawer({
  onSnapChange,
  eventTitle,
  eventCode,
}: {
  onSnapChange: (snap: number | string | null) => void;
  eventTitle: string;
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

  const doViewTransition = useViewTransition();

  /* BUTTONS */
  const paintingButton = (
    <ActionButton
      buttonStyle="primary"
      icon={<SquarePenIcon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      onClick={() => {
        doViewTransition(`/${eventCode}/painting`);
      }}
      loadOnSuccess
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
          <ShareMenu
            trigger={
              <EmptyButton
                buttonStyle="semi-transparent"
                icon={<ShareIcon />}
                aria-label="Share Event"
              />
            }
            eventTitle={eventTitle}
            eventCode={eventCode}
            isNested
          />
          {paintingButton}
        </div>
      }
      viewTransitionName="results-drawer"
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
