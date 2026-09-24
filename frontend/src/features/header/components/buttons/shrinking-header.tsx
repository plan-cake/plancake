"use client";

import { cloneElement, ReactElement } from "react";

import { motion, useTransform } from "framer-motion";

import { useHeader } from "@/features/header/context";
import { cn } from "@/lib/utils/classname";

type HeaderButtonStyle = "frosted glass inset" | "primary";

export default function ShrinkingHeaderButton({
  buttonStyle,
  icon,
  label,
  children,
}: {
  buttonStyle: HeaderButtonStyle;
  icon?: React.ReactNode;
  label?: string;
  children: React.ReactNode;
}) {
  const { isFullSize, shrinkAmount } = useHeader();

  const iconStyle = useTransform(shrinkAmount, [0, 1], {
    height: [24, 0],
    width: [24, 0],
    padding: [2, 0],
    opacity: [1, 0],
  });
  const textStyle = useTransform(shrinkAmount, [0, 1], {
    height: [24, 0],
    paddingLeft: [8, 4],
    paddingRight: [8, 4],
    opacity: [1, 0],
    fontSize: ["16px", "0px"],
  });
  const containerStyle = useTransform(shrinkAmount, [0, 1], {
    padding: [8, 6],
  });

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
  const iconComponent = icon && (
    <motion.div style={iconStyle}>
      {cloneElement(icon as ReactElement<{ className: string }>, {
        className: "h-full w-full",
      })}
    </motion.div>
  );

  // This is honestly pretty tailored to the "Log In" button size, but no other text
  // buttons exist in the header on mobile and probably never will
  const textComponent = label && (
    <motion.div style={textStyle}>{label}</motion.div>
  );

  return (
    <div>
      <motion.div
        className={cn(
          "rounded-full",
          isFullSize ? "absolute opacity-0" : "",
          styleClass,
        )}
        style={containerStyle}
      >
        {icon ? iconComponent : textComponent}
      </motion.div>
      <div className={isFullSize ? "" : "hidden"}>{children}</div>
    </div>
  );
}
