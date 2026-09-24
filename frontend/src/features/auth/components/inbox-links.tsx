import { Gmail2026, MicrosoftOutlook } from "@thesvg/react";

import LinkButton from "@/features/button/components/link";

const GMAIL_DOMAINS = ["gmail.com", "googlemail.com"];
const OUTLOOK_DOMAINS = ["outlook.com", "hotmail.com", "live.com", "msn.com"];

export default function InboxLinks({ email }: { email: string }) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";

  const isGmail = GMAIL_DOMAINS.includes(domain);
  const isOutlook = OUTLOOK_DOMAINS.includes(domain);

  const gmailButton = (
    <LinkButton
      buttonStyle="secondary"
      icon={<Gmail2026 />}
      label="Open Gmail"
      href="https://mail.google.com"
      target="_blank"
      tooltip="Opens in a new tab"
      className="justify-center"
    />
  );

  const outlookButton = (
    <LinkButton
      buttonStyle="secondary"
      icon={<MicrosoftOutlook />}
      label="Open Outlook"
      href="https://outlook.live.com"
      target="_blank"
      tooltip="Opens in a new tab"
      className="justify-center"
    />
  );

  return (
    <div className="flex w-full flex-col gap-2">
      {isGmail && gmailButton}
      {isOutlook && outlookButton}
      {!isGmail && !isOutlook && (
        <>
          {gmailButton}
          {outlookButton}
        </>
      )}
    </div>
  );
}
