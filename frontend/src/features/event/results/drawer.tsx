import { useState } from "react";

import { BaseDrawer } from "@/components/layout/base-drawer";
import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import { useResultsContext } from "@/features/event/results/context";
import ConfirmationDialog from "@/features/system-feedback/confirmation/base";

export default function ResultsDrawer() {
  const {
    participants,
    currentUser,
    handleRemoveParticipant: onRemoveParticipant,
  } = useResultsContext();

  /* REMOVING STATES */
  const [isRemoving, setIsRemoving] = useState(false);
  const [personToRemove, setPersonToRemove] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const promptRemove = (person: string) => {
    setPersonToRemove(person);
    setIsConfirmationOpen(true);
  };
  return (
    <>
      <BaseDrawer
        open
        onOpenChange={() => {}}
        contentClassName="h-full md:hidden"
        title="Attendees List"
        description="View attendees for this event"
        snapPoints={[0.13, 0.25, 0.5]}
        modal={false}
        floatingAtLowestSnap
        scrollableBody
        headerContent={
          <PanelHeader
            isRemoving={isRemoving}
            toggleRemoving={() => setIsRemoving((prev) => !prev)}
            promptRemove={promptRemove}
            inDrawer
          />
        }
      >
        <ParticipantList
          isRemoving={isRemoving}
          promptRemove={promptRemove}
          mobile
        />
            </p>
          </div>
        </BaseDrawer>
      </BaseDrawer>

      <ConfirmationDialog
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
        // Controlled Props
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
    </>
  );
}
