"use client";

import { cloneElement, ReactElement, useEffect, useState } from "react";

import {
  ArrowBigUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowRightToLineIcon,
  ArrowUpIcon,
  CommandIcon,
  CornerDownLeftIcon,
  DeleteIcon,
  OptionIcon,
  SpaceIcon,
} from "lucide-react";

import { useShortcuts } from "@/features/system-feedback/hotkeys/context";
import { cn } from "@/lib/utils/classname";
import { isAppleOs } from "@/lib/utils/is-apple-os";

const KEY_ICONS: Record<string, React.ReactNode> = {
  shift: <ArrowBigUpIcon />,
  option: <OptionIcon />,
  enter: <CornerDownLeftIcon />,
  backspace: <DeleteIcon />,
  tab: <ArrowRightToLineIcon />,
  space: <SpaceIcon />,
  command: <CommandIcon />,
  arrowup: <ArrowUpIcon />,
  arrowdown: <ArrowDownIcon />,
  arrowleft: <ArrowLeftIcon />,
  arrowright: <ArrowRightIcon />,
};

const KEY_ABBREVS: Record<string, string> = {
  control: "Ctrl",
  escape: "Esc",
};

export default function HotkeyBadge({
  hotkey,
  disabled = false,
  keyClassName,
  litKeyClassName,
  disabledKeyClassName,
}: {
  hotkey: string;
  disabled?: boolean;
  keyClassName?: string;
  litKeyClassName?: string;
  disabledKeyClassName?: string;
}) {
  const keys = hotkey.split("+").map((key) => key.trim().toLowerCase());

  const [isApple, setIsApple] = useState(false);
  useEffect(() => setIsApple(isAppleOs()), []);

  return (
    <kbd className="flex items-center gap-1">
      {keys.map((key) => (
        <HotkeySegment
          key={key}
          hotkey={key}
          disabled={disabled}
          isApple={isApple}
          className={keyClassName}
          litClassName={litKeyClassName}
          disabledClassName={disabledKeyClassName}
        />
      ))}
    </kbd>
  );
}

function HotkeySegment({
  hotkey,
  disabled = false,
  isApple,
  className,
  litClassName,
  disabledClassName,
}: {
  hotkey: string;
  disabled: boolean;
  isApple: boolean;
  className?: string;
  litClassName?: string;
  disabledClassName?: string;
}) {
  const isLit = useShortcuts().checkKeyPressed(hotkey);

  let displayKey = hotkey;
  if (displayKey === "mod") {
    displayKey = isApple ? "command" : "control";
  } else if (displayKey === "alt") {
    displayKey = isApple ? "option" : "alt";
  }

  let content;
  if (KEY_ICONS.hasOwnProperty(displayKey)) {
    content = cloneElement(
      KEY_ICONS[displayKey] as ReactElement<{ className: string }>,
      { className: "h-3.5 w-3.5" },
    );
  } else {
    content =
      KEY_ABBREVS[displayKey] ||
      displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
  }

  return (
    <kbd
      className={cn(
        "font-nunito text-sm leading-none",
        "border-t-1 border-x-1 border-b-3 rounded-md p-[3px]",
        disabled
          ? cn("border-foreground/50 text-foreground/50", disabledClassName)
          : isLit
            ? cn(
                "border-foreground/50 text-foreground/50 border-b-1 mt-[2px]",
                litClassName,
              )
            : cn("border-foreground text-foreground", className),
      )}
    >
      {content}
    </kbd>
  );
}
