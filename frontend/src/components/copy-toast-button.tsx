"use client";

import { CopyIcon } from "@radix-ui/react-icons";

import ActionButton from "@/features/button/components/action";
import { ButtonStyle } from "@/features/button/props";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";

export default function CopyToastButton({
  code,
  buttonStyle = "secondary",
}: {
  code: string;
  buttonStyle?: ButtonStyle;
}) {
  const { addToast } = useToast();
  const currentURL =
    typeof window !== "undefined" ? `${window.location.origin}/${code}` : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentURL);
      addToast("copy", MESSAGES.COPY_LINK_SUCCESS);
      return true;
    } catch (err) {
      console.error("Failed to copy: ", err);
      addToast("error", MESSAGES.COPY_LINK_FAILURE);
      return false;
    }
  };

  return (
    <ActionButton
      buttonStyle={buttonStyle}
      icon={<CopyIcon />}
      label="Copy Link"
      onClick={copyToClipboard}
    />
  );
}
