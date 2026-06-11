import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils/classname";

type TooltipProps = {
  side?: "top" | "bottom";
  content: React.ReactNode;
  children: React.ReactNode;
};

export default function Tooltip({
  side = "bottom",
  content,
  children,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align="center"
          sideOffset={4}
          className={cn(
            "bg-foreground text-background text-sm",
            "max-w-screen z-100 rounded-2xl px-2 py-1",
            "shadow-lg will-change-transform",
            "data-[state=delayed-open]:animate-slideUpAndFade",
            "data-[state=instant-open]:animate-slideUpAndFade",
            "data-[state=closed]:animate-slideDownAndFadeOut",
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-foreground" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
