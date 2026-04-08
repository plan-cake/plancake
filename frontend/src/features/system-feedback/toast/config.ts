import {
  CheckIcon,
  CopyIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

export const TOAST_CONFIG = {
  error: {
    icon: TriangleAlertIcon,
    background: "error",
    textColor: "white",
    title: "ERROR",
  },
  copy: {
    icon: CopyIcon,
    background: "foreground",
    textColor: "background",
    title: "COPIED",
  },
  success: {
    icon: CheckIcon,
    background: "foreground",
    textColor: "background",
    title: "SUCCESS",
  },
  info: {
    icon: InfoIcon,
    background: "blue",
    textColor: "white",
    title: "INFORMATION",
  },
} as const;
