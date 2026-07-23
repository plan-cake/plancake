import { cloneElement, ReactElement } from "react";

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
  SpaceIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/classname";
import { isAppleOs } from "@/lib/utils/is-apple-os";

const KEY_ICONS: Record<string, React.ReactNode> = {
  shift: <ArrowBigUpIcon />,
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
}: {
  hotkey: string;
  keyClassName?: string;
}) {
  const keys = hotkey.split("+").map((key) => key.trim().toLowerCase());
  const isApple = isAppleOs();

  return (
    <kbd className="flex items-center gap-1">
      {keys.map((key) => {
        if (key === "mod") {
          key = isApple ? "command" : "control";
        }

        let content;

        if (KEY_ICONS.hasOwnProperty(key)) {
          content = cloneElement(
            KEY_ICONS[key] as ReactElement<{ className: string }>,
            {
              className: "h-3.5 w-3.5",
            },
          );
        } else {
          content = KEY_ABBREVS[key] || key;
        }

        return (
          <kbd
            key={key}
            className={cn(
              "font-nunito text-sm leading-none",
              "border-t-1 border-x-1 border-b-3 rounded-md p-1",
              keyClassName,
            )}
          >
            {content}
          </kbd>
        );
      })}
    </kbd>
  );
}
