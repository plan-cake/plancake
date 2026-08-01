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
      open={secretComboPressed && !disabled}
    >
      {children}
    </Tooltip>
  );
}
