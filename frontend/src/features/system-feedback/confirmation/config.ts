import {
  CheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

export const DIALOG_CONFIG = {
  warning: {
    icon: null, // special case for the text "!"
    bgClass: "bg-lion",
    btnStyle: "primary",
    isTextIcon: true,
  },
  delete: {
    icon: TriangleAlertIcon,
    bgClass: "bg-error/40",
    btnStyle: "danger",
    isTextIcon: false,
  },
  success: {
    icon: CheckIcon,
    bgClass: "bg-foreground/40",
    btnStyle: "primary",
    isTextIcon: false,
  },
  error: {
    icon: TriangleAlertIcon,
    bgClass: "bg-error/40",
    btnStyle: "danger",
    isTextIcon: false,
  },
  info: {
    icon: InfoIcon,
    bgClass: "bg-blue/40",
    btnStyle: "primary",
    isTextIcon: false,
  },
} as const;
