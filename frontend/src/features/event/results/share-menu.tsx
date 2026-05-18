import { ShareIcon } from "lucide-react";

import CopyToastButton from "@/components/copy-toast-button";
import ActionButton from "@/features/button/components/action";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { cn } from "@/lib/utils/classname";

export default function ShareMenu({
  eventTitle,
  eventCode,
}: {
  eventTitle: string;
  eventCode: string;
}) {
  const { addToast } = useToast();

  let shareButton: React.ReactNode = (
    <ActionButton
      buttonStyle="primary"
      icon={<ShareIcon />}
      label="Share"
      onClick={async () => {
        try {
          await navigator.share({
            title: eventTitle,
            url: window.location.href,
          });
        } catch (error) {
          // An error is thrown if sharing is cancelled, ignore that
          if (error instanceof Error && error.name !== "AbortError") {
            addToast("error", MESSAGES.ERROR_GENERIC);
          }
        }
      }}
    />
  );
  // Check if sharing is supported
  if (typeof navigator !== "undefined" && !navigator.share) {
    /* This condition means it will be rendered until mounted on the client, then it
     * disappears if not supported. There are more browsers that support the API than
     * don't, so this is a better trade-off than having the button appear after initial
     * mount on supported browsers.
     *
     * This also won't be visible on mobile anyway, since the buttons are hidden in the
     * kebab menu.
     */
    shareButton = null;
  }

  const copyButton = (
    <CopyToastButton code={eventCode} buttonStyle="secondary" />
  );

  const currentURL =
    typeof window !== "undefined"
      ? `${window.location.origin}/${eventCode}`
      : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentURL);
      addToast("copy", MESSAGES.COPY_LINK_SUCCESS);
    } catch (err) {
      console.error("Failed to copy: ", err);
      addToast("error", MESSAGES.COPY_LINK_FAILURE);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className={cn(
          "w-full min-w-0 text-center text-xl font-bold",
          "hover:text-accent active:text-accent/75 cursor-pointer",
        )}
        style={{ wordBreak: "break-word" }} // Wrap long event codes
        onClick={copyToClipboard}
      >
        {window.location.host}/{eventCode}
      </div>
      <div
        className={cn(
          "flex w-full justify-center gap-2",
          shareButton && "justify-between",
        )}
      >
        {copyButton}
        {shareButton}
      </div>
    </div>
  );
}
