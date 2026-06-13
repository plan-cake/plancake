import { useEffect, useState } from "react";

import { ShareIcon, SlidersHorizontalIcon, SquarePenIcon } from "lucide-react";

import EmptyButton from "@/features/button/components/empty";
import LinkButton from "@/features/button/components/link";
import { FloatingDrawer, MorphingDrawer } from "@/features/drawer";
import PanelHeader from "@/features/event/results/attendees/panel-header";
import ParticipantList from "@/features/event/results/attendees/participant-list";
import {
  RemoveParticipantDialog,
  useParticipantRemoval,
} from "@/features/event/results/attendees/remove-participant";
import AvailabilityFilters from "@/features/event/results/availability-filters";
import ShareMenu from "@/features/event/results/share-menu";

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
  const [openViewOptions, setOpenViewOptions] = useState(false);

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

  /* BUTTONS */
  const paintingButton = (
    <LinkButton
      buttonStyle="primary"
      icon={<SquarePenIcon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      href={`/${eventCode}/painting`}
    />
  );

  const filtersButton = (
    <FloatingDrawer
      showOverlay={false}
      open={openViewOptions}
      onOpenChange={setOpenViewOptions}
      title="View Options"
      description="View Options"
      trigger={
        <EmptyButton
          buttonStyle="semi-transparent"
          icon={<SlidersHorizontalIcon />}
          aria-label="View Options"
        />
      }
    >
      <AvailabilityFilters />
    </FloatingDrawer>
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
          <div className="flex gap-2">
            <FloatingDrawer
              title="Share Event"
              description="Share this event with others"
              open={shareMenuOpen}
              onOpenChange={setShareMenuOpen}
              trigger={
                <EmptyButton
                  buttonStyle="semi-transparent"
                  icon={<ShareIcon />}
                  aria-label="Share Event"
                />
              }
              nested={true}
            >
              <ShareMenu eventTitle={eventTitle} eventCode={eventCode} />
            </FloatingDrawer>
            {filtersButton}
          </div>
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
