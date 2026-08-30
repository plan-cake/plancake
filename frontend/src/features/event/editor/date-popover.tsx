import { ReactNode } from "react";

import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils/classname";

export default function DatePopover({
  trigger,
  open,
  setOpen,
  ariaLabel,
  children,
}: {
  trigger: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="hover:cursor-pointer">
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className={cn(
            "bg-background z-50 rounded-2xl border border-gray-400 p-4 shadow-lg",
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
