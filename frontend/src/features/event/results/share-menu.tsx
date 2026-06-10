import { useEffect, useMemo, useRef } from "react";

import { ShareIcon } from "lucide-react";
import QRCodeStyling from "qr-code-styling";

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

  const shareButton: React.ReactNode =
    typeof navigator !== "undefined" && navigator.share ? (
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
    ) : null;

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
      <QRCode url={currentURL} />
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          className={cn(
            "w-full min-w-0 text-center text-xl font-bold",
            "hover:text-accent active:text-accent/75 cursor-pointer",
          )}
          style={{ wordBreak: "break-word" }} // Wrap long event codes
          onClick={copyToClipboard}
        >
          {currentURL ? currentURL.replace(/^https?:\/\//, "") : "Loading..."}
        </button>
        <div className="text-center text-sm opacity-60">
          Anyone can join the event using this link
        </div>
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

function QRCode({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const qrCode = useMemo(() => {
    return new QRCodeStyling({
      width: 256,
      height: 256,
      type: "svg",
      data: url,
      dotsOptions: {
        color: "var(--color-foreground)",
        type: "rounded",
      },
      cornersSquareOptions: {
        type: "extra-rounded",
      },
      cornersDotOptions: {
        type: "extra-rounded",
      },
      backgroundOptions: {
        color: "var(--color-panel)",
      },
    });
  }, [url]);

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, [qrCode]);

  useEffect(() => {
    qrCode.update({
      data: url,
    });
  }, [qrCode, url]);

  return <div ref={ref} className="[&>svg]:aspect-square [&>svg]:w-full" />;
}
