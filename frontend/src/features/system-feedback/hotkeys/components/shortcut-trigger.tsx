import { useRef } from "react";

import { useHotkeys } from "react-hotkeys-hook";

import ShortcutTooltip from "@/features/system-feedback/hotkeys/components/shortcut-tooltip";
import { SHORTCUT_MODE_SCOPE } from "@/features/system-feedback/hotkeys/constants";
import { useShortcuts } from "@/features/system-feedback/hotkeys/context";
import { TooltipSide } from "@/features/system-feedback/tooltip/base";
import { cn } from "@/lib/utils/classname";

export default function ShortcutTrigger({
  hotkey,
  onAction,
  tooltipSide,
  children,
  className,
}: {
  hotkey: string;
  onAction?: () => void;
  tooltipSide?: TooltipSide;
  children: React.ReactNode;
  className?: string;
}) {
  const { endShortcutMode } = useShortcuts();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleShortcut = () => {
    if (onAction) {
      onAction();
    } else {
      const targetEl = wrapperRef.current?.firstElementChild as HTMLElement;
      if (targetEl) {
        targetEl.click();
      }
    }
    endShortcutMode();
  };

  useHotkeys(hotkey, handleShortcut, {
    scopes: [SHORTCUT_MODE_SCOPE],
  });

  return (
    <div ref={wrapperRef} className={cn(className, "relative")}>
      {children}
      <ShortcutTooltip hotkey={hotkey} side={tooltipSide}>
        <div className="pointer-events-none absolute inset-0" />
      </ShortcutTooltip>
    </div>
  );
}
