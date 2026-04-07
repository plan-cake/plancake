import {
  CheckIcon,
  CopyIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

export const TOAST_CONFIG = {
  error: {
    icon: ExclamationTriangleIcon,
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
    icon: InfoCircledIcon,
    background: "blue",
    textColor: "white",
    title: "INFORMATION",
  },
} as const;
