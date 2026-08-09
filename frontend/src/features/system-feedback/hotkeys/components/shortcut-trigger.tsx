import { useRef } from "react";

import { useHotkeys } from "react-hotkeys-hook";

import ShortcutTooltip from "@/features/system-feedback/hotkeys/components/shortcut-tooltip";
import { SHORTCUT_MODE_SCOPE } from "@/features/system-feedback/hotkeys/constants";
import { useShortcuts } from "@/features/system-feedback/hotkeys/context";
import { TooltipSide } from "@/features/system-feedback/tooltip/base";
import { cn } from "@/lib/utils/classname";

export default function ShortcutTrigger({
  hotkey,
  selector,
  onAction,
  tooltipSide,
  allowTooltipCollisions = false,
  disabled = false,
  children,
  className,
}: {
  hotkey: string;
  selector?: string;
  onAction?: () => void;
  tooltipSide?: TooltipSide;
  allowTooltipCollisions?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const { endShortcutMode } = useShortcuts();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleShortcut = () => {
    if (onAction) {
      onAction();
    } else {
      let targetEl: HTMLElement | null = null;
      if (selector) {
        targetEl = wrapperRef.current?.querySelector(selector) as HTMLElement;
      } else {
        targetEl = wrapperRef.current?.firstElementChild as HTMLElement;
      }
      if (targetEl) {
        targetEl.click();
        targetEl.focus();
      }
    }
    endShortcutMode(false);
  };

  useHotkeys(hotkey, handleShortcut, {
    scopes: [SHORTCUT_MODE_SCOPE],
    preventDefault: true,
    enabled: !disabled,
  });

  return (
    <div ref={wrapperRef} className={cn(className, "relative")}>
      {children}
      <ShortcutTooltip
        hotkey={hotkey}
        side={tooltipSide}
        allowCollisions={allowTooltipCollisions}
        disabled={disabled}
      >
        <div className="pointer-events-none absolute inset-0" />
      </ShortcutTooltip>
    </div>
  );
}
