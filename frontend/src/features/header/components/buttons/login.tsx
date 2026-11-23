"use client";

import { usePathname } from "next/navigation";

import LinkButton from "@/features/button/components/link";
import ShrinkingHeaderButton from "@/features/header/components/buttons/shrinking-header";
import { useHeader } from "@/features/header/context";

export default function LoginButton() {
  const pathname = usePathname();
  const { useLoginCallback } = useHeader();

  const href =
    useLoginCallback && pathname
      ? `/login?callbackUrl=${encodeURIComponent(pathname)}`
      : "/login";

  return (
    <ShrinkingHeaderButton buttonStyle="frosted glass inset" label="Log In">
      <LinkButton
        className="relative z-10"
        buttonStyle="frosted glass inset"
        label="Log In"
        href={href}
      />
    </ShrinkingHeaderButton>
  );
}
