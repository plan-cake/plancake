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
  keyClassName,
  litKeyClassName,
}: {
  hotkey: string;
  keyClassName?: string;
  litKeyClassName?: string;
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
          isApple={isApple}
          className={keyClassName}
          litClassName={litKeyClassName}
        />
      ))}
    </kbd>
  );
}

function HotkeySegment({
  hotkey,
  isApple,
  className,
  litClassName,
}: {
  hotkey: string;
  isApple: boolean;
  className?: string;
  litClassName?: string;
}) {
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    const isModifier = ["mod", "shift", "alt"].includes(hotkey);
    let timeoutId: NodeJS.Timeout;

    const isStandardMatch = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code.toLowerCase();
      if (hotkey === "space") return key === " " || code === "space";
      return (
        key === hotkey ||
        code === hotkey ||
        code === `key${hotkey}` ||
        code === `digit${hotkey}`
      );
    };

    const handleKeyEvent = (e: KeyboardEvent, isDown: boolean) => {
      if (isModifier) {
        if (hotkey === "mod") setIsLit(isApple ? e.metaKey : e.ctrlKey);
        else if (hotkey === "shift") setIsLit(e.shiftKey);
        else if (hotkey === "alt") setIsLit(e.altKey);
      } else if (isStandardMatch(e)) {
        setIsLit(isDown);
        clearTimeout(timeoutId);
        if (isDown) {
          // Reset the lit state after a short delay in case keyup is swallowed
          timeoutId = setTimeout(() => setIsLit(false), 300);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => handleKeyEvent(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKeyEvent(e, false);

    const handleBlur = () => {
      setIsLit(false);
      clearTimeout(timeoutId);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      clearTimeout(timeoutId);
    };
  }, [hotkey, isApple]);

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
        "border-t-1 border-x-1 border-b-3 rounded-md p-1",
        isLit
          ? "border-accent text-accent border-b-1 mt-[2px]"
          : "border-foreground text-foreground",
        className,
        isLit && litClassName,
      )}
    >
      {content}
    </kbd>
  );
}
