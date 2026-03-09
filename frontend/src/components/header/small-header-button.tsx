import { cloneElement, ReactElement } from "react";

import { cn } from "@/lib/utils/classname";

type HeaderButtonStyle = "frosted glass inset" | "primary";
type HeaderButtonType = "icon" | "text";

export default function SmallHeaderButton({
  buttonStyle,
  buttonType,
  isShrunk,
  children,
}: {
  buttonStyle: HeaderButtonStyle;
  buttonType: HeaderButtonType;
  isShrunk: boolean;
  children: React.ReactNode;
}) {
  const styleClass =
    buttonStyle === "primary"
      ? "bg-accent text-white"
      : "frosted-glass-inset text-foreground";

  // Same as the button component, setting the icon size here
  const iconComponent =
    buttonType === "icon" &&
    cloneElement(children as ReactElement<{ className: string }>, {
      className: cn(
        "transition-[height,width,padding,opacity] duration-250 ease-out",
        isShrunk ? "h-0 w-0 p-0 opacity-0" : "h-6 w-6 p-0.5",
      ),
    });

  // This is honestly pretty tailored to the "Log In" button size, but no other text
  // buttons exist in the header on mobile and probably never will
  const textComponent = buttonType === "text" && (
    <div
      className={cn(
        "duration-250 transition-[height,padding,opacity,font-size] ease-out",
        isShrunk ? "h-0 px-1 text-[0px] opacity-0" : "h-6 px-2 opacity-100",
      )}
    >
      {children}
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-full",
        "duration-250 transition-[padding] ease-out",
        isShrunk ? "p-1.5" : "p-2",
        styleClass,
      )}
    >
      {buttonType === "icon" ? iconComponent : textComponent}
    </div>
  );
}
