import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils/classname";

export default function AccountSettingsPopover({
  children,
  content,
  open,
  setOpen,
}: {
  children?: React.ReactNode;
  content: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={20}
          onOpenAutoFocus={(e) => e.preventDefault()}
          side="bottom"
          className={cn(
            "frosted-glass",
            "w-100 z-50 rounded-3xl p-4",
            "data-[state=open]:animate-slideUpAndFade",
            "data-[state=closed]:animate-slideDownAndFadeOut",
          )}
          aria-label="Account settings"
        >
          {content}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
