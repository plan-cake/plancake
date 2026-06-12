import { ButtonStyle } from "@/features/button/props";
import { DialogType } from "@/features/system-feedback/type"; // Assuming path

export type DialogConfig = {
  buttonStyle: ButtonStyle;
};

export const DIALOG_CONFIG = {
  warning: {
    buttonStyle: "primary",
  },
  delete: {
    buttonStyle: "danger",
  },
  success: {
    buttonStyle: "primary",
  },
  error: {
    buttonStyle: "danger",
  },
  info: {
    buttonStyle: "primary",
  },
} satisfies Record<DialogType, DialogConfig>;
