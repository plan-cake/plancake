import { forwardRef, HTMLAttributes, useRef } from "react";

import { Slot } from "@radix-ui/react-slot";
import { useHotkeys } from "react-hotkeys-hook";

import ShortcutTooltip from "@/features/system-feedback/hotkeys/components/shortcut-tooltip";
import { SHORTCUT_MODE_SCOPE } from "@/features/system-feedback/hotkeys/constants";
import { useShortcuts } from "@/features/system-feedback/hotkeys/context";
import { TooltipSide } from "@/features/system-feedback/tooltip/base";
import { cn } from "@/lib/utils/classname";

type ShortcutTriggerProps = HTMLAttributes<HTMLElement> & {
  hotkey: string;
  selector?: string;
  onAction?: () => void;
  tooltipSide?: TooltipSide;
  allowTooltipCollisions?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

const ShortcutTrigger = forwardRef<HTMLElement, ShortcutTriggerProps>(
  (
    {
      hotkey,
      selector,
      onAction,
      tooltipSide,
      allowTooltipCollisions = false,
      disabled = false,
      children,
      className,
      ...slotProps
    },
    forwardedRef,
  ) => {
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
        <Slot ref={forwardedRef} {...slotProps}>
          {children}
        </Slot>
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
  },
);

ShortcutTrigger.displayName = "ShortcutTrigger";

export default ShortcutTrigger;
