"use client";

import { useState } from "react";

import { FloatingDrawer } from "@/features/drawer";
import ShareMenuContent from "@/features/share-menu/content";
import BaseDialog from "@/features/system-feedback/dialog/components/base";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function ShareMenu({
  trigger,
  eventTitle,
  eventCode,
  isNested = false,
}: {
  trigger: React.ReactNode;
  eventTitle: string;
  eventCode: string;
  isNested?: number | boolean;
}) {
  const isMobile = useCheckMobile();

  const [isOpen, setIsOpen] = useState(false);

  return isMobile ? (
    <FloatingDrawer
      title="Share Event"
      description="Share this event with others"
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={trigger}
      nested={isNested}
    >
      <ShareMenuContent eventTitle={eventTitle} eventCode={eventCode} />
    </FloatingDrawer>
  ) : (
    <BaseDialog
      title="Share Event"
      description="Share this event with others"
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={trigger}
      showCloseButton
    >
      <ShareMenuContent eventTitle={eventTitle} eventCode={eventCode} />
    </BaseDialog>
  );
}
