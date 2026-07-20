"use client";

import { useCallback, useState } from "react";

import { FloatingDrawer } from "@/features/drawer";
import ShareMenuContent from "@/features/share-menu/content";
import BaseDialog from "@/features/system-feedback/dialog/components/base";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function ShareMenu({
  trigger,
  eventTitle,
  eventCode,
  isNested = false,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger: React.ReactNode;
  eventTitle: string;
  eventCode: string;
  isNested?: number | boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useCheckMobile();

  /* OPEN STATE MANAGEMENT */
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  return isMobile ? (
    <FloatingDrawer
      title="Share Event"
      description="Share this event with others"
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      nested={isNested}
    >
      <ShareMenuContent eventTitle={eventTitle} eventCode={eventCode} />
    </FloatingDrawer>
  ) : (
    <BaseDialog
      title="Share Event"
      description="Share this event with others"
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      showCloseButton
    >
      <ShareMenuContent eventTitle={eventTitle} eventCode={eventCode} />
    </BaseDialog>
  );
}
