import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils/classname";

export type TooltipSide = "top" | "bottom" | "left" | "right";

type TooltipProps = {
  /**
   * The side the tooltip should appear on. Defaults to "bottom".
   */
  side?: TooltipSide;
  /**
   * The content to be displayed in the tooltip. For most cases, this will just be a
   * string, but it can be any content for a more detailed tooltip.
   */
  content: React.ReactNode;
  /**
   * Optional maximum height for the tooltip. If the content is taller than this, it will
   * become scrollable.
   */
  maxHeight?: string;
  /**
   * The element that triggers the tooltip when hovered.
   */
  children: React.ReactNode;
};

export default function Tooltip({
  side = "bottom",
  content,
  maxHeight,
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
            "max-w-screen z-[100] rounded-2xl",
            "shadow-lg will-change-transform",
            "data-[state=delayed-open]:animate-tooltipOpen",
            "data-[state=instant-open]:animate-tooltipOpen",
            "data-[state=closed]:animate-tooltipClose",
            "data-[side=bottom]:[&_.tooltip-arrow]:translate-y-[-1px]",
            "data-[side=top]:[&_.tooltip-arrow]:translate-y-[-1px]",
            "data-[side=left]:[&_.tooltip-arrow]:translate-y-[-1px]",
            "data-[side=right]:[&_.tooltip-arrow]:translate-y-[-1px]",
          )}
        >
          <div
            className={cn("px-2 py-1", maxHeight && "overflow-y-auto")}
            style={maxHeight ? { maxHeight } : undefined}
          >
            {content}
          </div>
          <TooltipPrimitive.Arrow className="fill-foreground tooltip-arrow" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
