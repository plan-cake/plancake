import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils/classname";

type TooltipProps = {
  /**
   * The side the tooltip should appear on. Defaults to "bottom".
   */
  side?: "top" | "bottom";
  /**
   * The content to be displayed in the tooltip. For most cases, this will just be a
   * string, but it can be any content for a more detailed tooltip.
   */
  content: React.ReactNode;
  /**
   * The element that triggers the tooltip when hovered.
   */
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
            "data-[state=delayed-open]:animate-tooltipOpen",
            "data-[state=instant-open]:animate-tooltipOpen",
            "data-[state=closed]:animate-tooltipClose",
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-foreground" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
