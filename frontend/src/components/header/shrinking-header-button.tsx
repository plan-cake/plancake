"use client";

import { cloneElement, ReactElement, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/classname";

type HeaderButtonStyle = "frosted glass inset" | "primary";

export default function ShrinkingHeaderButton({
  buttonStyle,
  icon,
  label,
  isShrunk,
  children,
}: {
  buttonStyle: HeaderButtonStyle;
  icon?: React.ReactNode;
  label?: string;
  isShrunk: boolean;
  children: React.ReactNode;
}) {
  const [showButton, setShowButton] = useState(false);
  const buttonShowTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (buttonShowTimeout.current) {
      clearTimeout(buttonShowTimeout.current);
    }
    if (isShrunk) {
      setShowButton(false);
    } else {
      buttonShowTimeout.current = setTimeout(() => setShowButton(true), 250);
    }
  }, [isShrunk]);

  if (icon && label) {
    throw new Error("ShrinkingHeaderButton cannot have both icon and label");
  } else if (!icon && !label) {
    throw new Error(
      "ShrinkingHeaderButton must have either an icon or a label",
    );
  }

  const styleClass =
    buttonStyle === "primary"
      ? "bg-accent text-white"
      : "frosted-glass-inset text-foreground";

  // Same as the button component, setting the icon size here
  const iconComponent =
    icon &&
    cloneElement(icon as ReactElement<{ className: string }>, {
      className: cn(
        "header-transition-[height,width,padding,opacity]",
        isShrunk ? "h-0 w-0 p-0 opacity-0" : "h-6 w-6 p-0.5",
      ),
    });

  // This is honestly pretty tailored to the "Log In" button size, but no other text
  // buttons exist in the header on mobile and probably never will
  const textComponent = label && (
    <div
      className={cn(
        "header-transition-[height,padding,opacity,font-size]",
        isShrunk ? "h-0 px-1 text-[0px] opacity-0" : "h-6 px-2 opacity-100",
      )}
    >
      {label}
    </div>
  );

  return (
    <div>
      <div
        className={cn(
          "rounded-full",
          "header-transition-[padding]",
          isShrunk ? "p-1.5" : "p-2",
          showButton ? "absolute opacity-0" : "",
          styleClass,
        )}
      >
        {icon ? iconComponent : textComponent}
      </div>
      <div className={showButton ? "" : "hidden"}>{children}</div>
    </div>
  );
}
