import { useState } from "react";

import EmptyButton from "@/features/button/components/empty";
import { FloatingDrawer } from "@/features/drawer";
import AdvancedOptionsContent from "@/features/event/editor/advanced-options/content";
import { AdvancedOptionsProps } from "@/features/event/editor/advanced-options/props";
import EventEditorPopover from "@/features/event/editor/popover";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

export default function AdvancedOptions(props: AdvancedOptionsProps) {
  const isMobile = useCheckMobile();
  const [open, setOpen] = useState(false);

  const button = (
    <EmptyButton
      buttonStyle="semi-transparent"
      label="Advanced Options"
      className={cn("border", open ? "border-accent" : "border-transparent")}
    />
  );

  return isMobile ? (
    <FloatingDrawer
      open={open}
      onOpenChange={setOpen}
      title="Advanced Options"
      description="Change optional event settings"
      trigger={button}
    >
      <AdvancedOptionsContent {...props} />
    </FloatingDrawer>
  ) : (
    <EventEditorPopover
      trigger={button}
      align="end"
      side="right"
      open={open}
      setOpen={setOpen}
      ariaLabel="Advanced options menu"
    >
      <AdvancedOptionsContent {...props} />
    </EventEditorPopover>
  );
}
