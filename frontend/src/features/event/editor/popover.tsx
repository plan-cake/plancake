import { ReactNode } from "react";

import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils/classname";

export default function EventEditorPopover({
  trigger,
  align,
  side,
  open,
  setOpen,
  ariaLabel,
  children,
}: {
  trigger: ReactNode;
  align: Popover.PopoverContentProps["align"];
  side: Popover.PopoverContentProps["side"];
  open: boolean;
  setOpen: (open: boolean) => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild className="hover:cursor-pointer">
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          side={side}
          sideOffset={8}
          className={cn(
            "bg-background border-accent z-50 rounded-3xl border p-4 shadow-lg",
            "data-[state=open]:animate-slideUpAndFade",
            "data-[state=closed]:animate-slideDownAndFadeOut",
          )}
          aria-label={ariaLabel}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
