import { MouseEvent } from "react";

import { CopyIcon } from "@radix-ui/react-icons";

import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

export type DashboardCopyButtonProps = {
  code: string;
};

export default function DashboardCopyButton({
  code,
}: DashboardCopyButtonProps) {
  const { addToast } = useToast();
  const eventUrl =
    typeof window !== "undefined" ? `${window.location.origin}/${code}` : "";

  const copyToClipboard = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // avoid triggering the parent link

    try {
      await navigator.clipboard.writeText(eventUrl);
      addToast("copy", MESSAGES.COPY_LINK_SUCCESS);
    } catch (err) {
      console.error("Failed to copy: ", err);
      addToast("error", MESSAGES.COPY_LINK_FAILURE);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={cn(
        "flex cursor-pointer items-center gap-0.5 rounded-full px-2 py-1.5",
        "border-foreground hover:bg-foreground/20 active:bg-foreground/10 border",
      )}
    >
      <CopyIcon className="h-4 w-4" />
      <span className="ml-1 text-xs">Copy Link</span>
    </button>
  );
}
