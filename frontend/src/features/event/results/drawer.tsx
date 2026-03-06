import { useState, useMemo, useEffect } from "react";

import { PersonIcon, GearIcon } from "@radix-ui/react-icons";

import Checkbox from "@/components/checkbox";
import SegmentedControl from "@/components/segmented-control";
import { MorphingDrawer } from "@/features/drawer/components/morph";
import TimeZoneSelector from "@/features/event/components/selectors/timezone";
import PanelHeader from "@/features/event/results/attendee-panel/panel-header";
import ParticipantList from "@/features/event/results/attendee-panel/participant-list";
import { useResultsContext } from "@/features/event/results/context";
import ConfirmationDialog from "@/features/system-feedback/confirmation/base";

type ResultsTab = "attendees" | "view-details";

export default function ResultsDrawer({
  timezone,
  onTimezoneChange,
}: {
  timezone: string;
  onTimezoneChange: (newTZ: string) => void;
}) {
  const {
    participants,
    currentUser,
    handleRemoveParticipant: onRemoveParticipant,
    showOnlyBestTimes,
    setShowOnlyBestTimes,
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
  const [tab, setTab] = useState<ResultsTab>("attendees");
  const [activeSnap, setActiveSnap] = useState<number | string | null>(0.22);

  useEffect(() => {
    if (tab === "view-details") {
      setActiveSnap(0.3);
    }
  }, [tab]);

  /* TABS - Wrapped in useMemo */
  const tabContent = useMemo(
    () => ({
      attendees: {
        header: (
          <PanelHeader
            isRemoving={isRemoving}
            toggleRemoving={() => setIsRemoving((prev) => !prev)}
            promptRemove={promptRemove}
            inDrawer
          />
        ),
        content: (
          <ParticipantList
            isRemoving={isRemoving}
            promptRemove={promptRemove}
            mobile
          />
        ),
      },
      "view-details": {
        header: <h2 className="text-md font-semibold">View Details</h2>,
        content: (
          <div className="pt-4">
            <Checkbox
              label="Only show best times"
              checked={showOnlyBestTimes}
              onChange={setShowOnlyBestTimes}
              textSize="md"
            />
            <div className="mt-3">
              Displaying event in
              <span className="text-accent font-bold">
                <TimeZoneSelector
                  id="timezone-select"
                  value={timezone}
                  onChange={onTimezoneChange}
                />
              </span>
            </div>
          </div>
        ),
      },
    }),
    [
      isRemoving,
      timezone,
      onTimezoneChange,
      showOnlyBestTimes,
      setShowOnlyBestTimes,
    ],
  );

  return (
    <>
      <MorphingDrawer
        open
        onOpenChange={() => {}}
        contentClassName="h-full md:hidden"
        activeSnapPoint={activeSnap}
        setActiveSnapPoint={setActiveSnap}
        title="Attendees List"
        description="View attendees for this event"
        snapPoints={[0.22, 0.3, 0.4]}
        modal={false}
        floatingAtLowestSnap
        scrollableBody
        headerContent={tabContent[tab].header}
        footerContent={
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              {
                label: (
                  <div className="flex flex-col items-center gap-1 text-xs">
                    <PersonIcon className="h-5 w-5" />
                    {activeSnap === 0.22 && (
                      <span className="text-xs">Attendees</span>
                    )}
                  </div>
                ),
                value: "attendees",
              },
              {
                label: (
                  <div className="flex flex-col items-center gap-1 text-xs">
                    <GearIcon className="h-5 w-5" />
                    {activeSnap === 0.22 && (
                      <span className="text-xs">View Settings</span>
                    )}
                  </div>
                ),
                value: "view-details",
              },
            ]}
          />
        }
      >
        {tabContent[tab].content || <div>Content for {tab}</div>}
        <ConfirmationDialog
          asNestedDrawer // <-- Triggers the Drawer layout instead of Dialog
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
    </>
  );
}
