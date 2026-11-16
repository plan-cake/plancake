import { useState } from "react";

import { Settings2Icon, TriangleAlertIcon } from "lucide-react";

import { useEventContext } from "@/core/event/context";
import EmptyButton from "@/features/button/components/empty";
import { FloatingDrawer } from "@/features/drawer";
import AdvancedOptionsContent from "@/features/event/editor/advanced-options/content";
import { AdvancedOptionsProps } from "@/features/event/editor/advanced-options/props";
import EventEditorPopover from "@/features/event/editor/popover";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

export default function AdvancedOptions(props: AdvancedOptionsProps) {
  const isMobile = useCheckMobile();
  const { errors } = useEventContext();
  const [open, setOpen] = useState(false);

  // Centralized error status if other fields get added that can have errors
  const hasErrors = !!errors.customCode;

  const button = (
    <EmptyButton
      buttonStyle="semi-transparent"
      icon={hasErrors ? <TriangleAlertIcon /> : <Settings2Icon />}
      label="Advanced Options"
      className={cn(
        "border",
        open ? "border-accent" : "border-transparent",
        hasErrors && "text-error",
      )}
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
