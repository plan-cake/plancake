"use client";

import { useEffect, useState } from "react";

import HotkeyBadge from "@/features/system-feedback/hotkeys/components/hotkey-badge";
import { usePressedKeys } from "@/features/system-feedback/hotkeys/context";
import Tooltip, { TooltipSide } from "@/features/system-feedback/tooltip/base";

const POWERKEY_COMBO = ["mod", "alt"];

export default function PowerkeyTooltip({
  side,
  hotkey,
  children,
  disabled,
}: {
  side?: TooltipSide;
  hotkey: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  if (!hotkey.startsWith(POWERKEY_COMBO.join("+"))) {
    throw new Error(
      "PowerkeyTooltip only supports hotkeys starting with 'mod+alt'",
    );
  }

  const isPressed = usePressedKeys();
  const secretComboPressed =
    isPressed(POWERKEY_COMBO[0]) && isPressed(POWERKEY_COMBO[1]);
  const restOfHotkey = hotkey.split("+").slice(2).join("+");

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (secretComboPressed && !disabled) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [secretComboPressed, disabled]);

  return (
    <Tooltip
      side={side}
      content={
        <HotkeyBadge
          hotkey={restOfHotkey}
          keyClassName="text-background border-background"
          litKeyClassName="text-background/50 border-background/50"
        />
      }
      open={isOpen}
    >
      {children}
    </Tooltip>
  );
}
