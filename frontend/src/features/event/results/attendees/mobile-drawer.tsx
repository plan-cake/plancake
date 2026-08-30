import { useEffect, useState } from "react";

import { ShareIcon, SlidersHorizontalIcon, SquarePenIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";
import EmptyButton from "@/features/button/components/empty";
import { FloatingDrawer, MorphingDrawer } from "@/features/drawer";
import { GRID_ID_SELECTOR } from "@/features/event/grid/lib/constants";
import PanelHeader from "@/features/event/results/attendees/panel-header";
import ParticipantList from "@/features/event/results/attendees/participant-list";
import {
  RemoveParticipantDialog,
  useParticipantRemoval,
} from "@/features/event/results/attendees/remove-participant";
import AvailabilityFilters from "@/features/event/results/components/availability-filters";
import { useResultsContext } from "@/features/event/results/context";
import ShareMenu from "@/features/share-menu/menu";
import { useViewTransition } from "@/lib/hooks/use-view-transition";

export default function AttendeesDrawer({
  onSnapChange,
  eventTitle,
  eventCode,
  numParticipants,
}: {
  onSnapChange: (snap: number | string | null) => void;
  eventTitle: string;
  eventCode: string;
  numParticipants: number;
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

  const { showOnlyBestTimes, minAvailability } = useResultsContext();
  const areFiltersActive = showOnlyBestTimes || minAvailability > 1;

  /* SNAP POINTS */
  const [activeSnap, setActiveSnap] = useState<number | string | null>(0);
  const [currentSnapPoints, setCurrentSnapPoints] = useState<number[]>([
    0, 0.22, 0.37,
  ]);
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

  const doViewTransition = useViewTransition();

  /* BUTTONS */
  const paintingButton = (
    <ActionButton
      buttonStyle="primary"
      icon={<SquarePenIcon />}
      label={(currentUser ? "Edit" : "Add") + " Availability"}
      onClick={() => {
        doViewTransition(`/${eventCode}/painting`, GRID_ID_SELECTOR);
      }}
      loadOnSuccess
    />
  );

  const filtersButton = (
    <FloatingDrawer
      showOverlay={false}
      modal={false}
      open={openViewOptions}
      onOpenChange={setOpenViewOptions}
      title="View Options"
      description="View Options"
      trigger={
        <EmptyButton
          buttonStyle={
            areFiltersActive ? "bordered semi-transparent" : "semi-transparent"
          }
          icon={<SlidersHorizontalIcon />}
          aria-label="View Options"
        />
      }
    >
      <AvailabilityFilters />
    </FloatingDrawer>
  );

  const shareButton = (
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
  );

  useEffect(() => {
    // Wait for the view transition to finish, then animate the drawer in
    const timer = setTimeout(() => {
      setCurrentSnapPoints([0.22, 0.37]);
      setActiveSnap(0.22);
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MorphingDrawer
      open
      onOpenChange={() => {}}
      contentClassName="h-full md:hidden"
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={setActiveSnap}
      title="Attendees List"
      description="View attendees for this event"
      snapPoints={currentSnapPoints}
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
            {shareButton}
            {numParticipants > 1 && filtersButton}
          </div>
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
