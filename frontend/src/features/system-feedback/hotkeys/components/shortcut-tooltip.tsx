"use client";

import HotkeyBadge from "@/features/system-feedback/hotkeys/components/hotkey-badge";
import { useShortcuts } from "@/features/system-feedback/hotkeys/context";
import Tooltip, { TooltipSide } from "@/features/system-feedback/tooltip/base";

export default function ShortcutTooltip({
  side,
  hotkey,
  children,
  allowCollisions = false,
  disabled,
}: {
  side?: TooltipSide;
  hotkey: string;
  children: React.ReactNode;
  allowCollisions?: boolean;
  disabled?: boolean;
}) {
  const { shortcutMode } = useShortcuts();

  return (
    <Tooltip
      side={side}
      content={
        <HotkeyBadge
          hotkey={hotkey}
          keyClassName="text-background border-background"
          litKeyClassName="text-background/50 border-background/50"
        />
      }
      allowCollisions={allowCollisions}
      open={shortcutMode && !disabled}
    >
      {children}
    </Tooltip>
  );
}
