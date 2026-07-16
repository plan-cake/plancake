import { Gmail2026, MicrosoftOutlook } from "@thesvg/react";

import LinkButton from "@/features/button/components/link";

export default function InboxLinks() {
  return (
    <div className="flex w-full flex-col gap-2">
      <LinkButton
        buttonStyle="secondary"
        icon={<Gmail2026 />}
        label="Open Gmail"
        href="https://mail.google.com"
        target="_blank"
        tooltip="Opens in a new tab"
        className="justify-center"
      />
      <LinkButton
        buttonStyle="secondary"
        icon={<MicrosoftOutlook />}
        label="Open Outlook"
        href="https://outlook.live.com/mail/"
        target="_blank"
        tooltip="Opens in a new tab"
        className="justify-center"
      />
    </div>
  );
}
