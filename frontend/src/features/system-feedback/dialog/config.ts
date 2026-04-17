import type { ComponentType } from "react";

import { CheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";

import { ButtonStyle } from "@/features/button/props";

export type DialogConfig = {
  icon: ComponentType<{ className?: string }> | null;
  iconStyle: string;
  buttonStyle: ButtonStyle;
};

export const DIALOG_CONFIG: Record<string, DialogConfig> = {
  warning: {
    icon: null, // special case for the text "!"
    iconStyle: "bg-lion",
    buttonStyle: "primary",
  },
  delete: {
    icon: TriangleAlertIcon,
    iconStyle: "bg-error/40",
    buttonStyle: "danger",
  },
  success: {
    icon: CheckIcon,
    iconStyle: "bg-foreground/40",
    buttonStyle: "primary",
  },
  error: {
    icon: TriangleAlertIcon,
    iconStyle: "bg-error/40",
    buttonStyle: "danger",
  },
  info: {
    icon: InfoIcon,
    iconStyle: "bg-blue/40",
    buttonStyle: "primary",
  },
} as const;
